import type { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { redis } from '../../../config/redis';
import { embedText } from '../services/embedder.service';
import { hybridSearch, rerankChunks } from '../services/retrieval.service';
import { generateAnswer } from '../services/generation.service';
import { logEvaluation } from '../services/eval.service';

const CACHE_TTL_SECONDS = 3600; // 1 hour — school policy answers are stable

interface QueryBody {
  question: string;
  top_k?: number;
}

/**
 * POST /api/rag/query
 * Full RAG pipeline: embed → hybrid search → re-rank → generate → log.
 * Per-route rate limit of 10 req/min (set in rag.routes.ts) prevents API cost abuse.
 * Redis cache keyed on normalised question hash to avoid duplicate LLM calls.
 */
export async function queryRag(
  request: FastifyRequest<{ Body: QueryBody }>,
  reply: FastifyReply
) {
  const { question, top_k = 5 } = request.body;

  if (!question || question.trim().length === 0) {
    return reply.status(400).send({ error: 'Question is required' });
  }

  const normalised = question.toLowerCase().trim();
  const cacheKey = `rag:query:${crypto.createHash('sha256').update(normalised).digest('hex')}`;

  // Check Redis cache first — if cached, skip all API calls
  if (redis?.isOpen) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return reply.send({ ...JSON.parse(cached), cached: true });
    }
  }

  // Step 1: embed the question
  const queryEmbedding = await embedText(normalised);

  // Step 2: hybrid search (pgvector + tsvector)
  const rawChunks = await hybridSearch(queryEmbedding, normalised, top_k);

  if (rawChunks.length === 0) {
    return reply.send({
      answer: "I don't have enough information in the school policy documents to answer that.",
      sources: [],
      confidence: 0,
      cached: false,
    });
  }

  // Step 3: re-rank by term frequency boost
  const chunks = rerankChunks(rawChunks, normalised);

  // Step 4: generate answer with Claude Haiku
  const result = await generateAnswer(chunks, question);

  // Step 5: log to evaluation_logs (non-blocking — don't await)
  logEvaluation(question, chunks, result).catch((err) =>
    request.log.error({ err }, 'Eval logging failed')
  );

  const response = { ...result, cached: false };

  // Cache successful answer in Redis
  if (redis?.isOpen) {
    await redis.set(cacheKey, JSON.stringify(response), { EX: CACHE_TTL_SECONDS });
  }

  return reply.send(response);
}
