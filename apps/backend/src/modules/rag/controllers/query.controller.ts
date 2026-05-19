import type { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { redis } from '../../../config/redis';
import { embedText } from '../services/embedder.service';
import { hybridSearch, rerankChunks, type RetrievedChunk } from '../services/retrieval.service';
import { generateAnswer, generateGeneralAnswer, type GenerationResult } from '../services/generation.service';
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

  // Step 3: generate an answer.
  // When retrieval finds no relevant policy chunks, fall back to general
  // knowledge instead of refusing — still helpful for school-related questions.
  let result: GenerationResult;
  let loggedChunks: RetrievedChunk[] = [];
  if (rawChunks.length === 0) {
    result = await generateGeneralAnswer(question);
  } else {
    loggedChunks = rerankChunks(rawChunks, normalised);
    result = await generateAnswer(loggedChunks, question);
  }

  // Step 4: log to evaluation_logs (non-blocking — don't await)
  logEvaluation(question, loggedChunks, result).catch((err) =>
    request.log.error({ err }, 'Eval logging failed')
  );

  const response = { ...result, cached: false };

  // Cache successful answer in Redis
  if (redis?.isOpen) {
    await redis.set(cacheKey, JSON.stringify(response), { EX: CACHE_TTL_SECONDS });
  }

  return reply.send(response);
}
