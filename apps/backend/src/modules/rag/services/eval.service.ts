import { prisma } from '../../../config/prisma';
import type { RetrievedChunk } from './retrieval.service';
import type { GenerationResult } from './generation.service';

/**
 * Logs every RAG query and its result to evaluation_logs for academic documentation.
 * Stored data enables: query pattern analysis, confidence trend tracking,
 * "I don't know" rate calculation, and per-document usage stats.
 */
export async function logEvaluation(
  query: string,
  chunks: RetrievedChunk[],
  result: GenerationResult
): Promise<void> {
  const retrievedChunksSummary = chunks.map((c) => ({
    id: c.id,
    document_id: c.document_id,
    chunk_index: c.chunk_index,
    similarity: parseFloat(c.similarity.toFixed(4)),
    snippet: c.chunk_text.slice(0, 100),
  }));

  await prisma.evaluationLog.create({
    data: {
      query,
      retrieved_chunks: retrievedChunksSummary,
      generated_answer: result.answer,
      confidence_score: result.confidence,
      sources: result.sources,
    },
  });
}

/**
 * Generates an aggregated evaluation report for academic documentation.
 * Returns metrics that demonstrate RAG pipeline quality without requiring Python/RAGAS.
 */
export async function getEvalReport() {
  const logs = await prisma.evaluationLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 500,
  });

  if (logs.length === 0) {
    return { total_queries: 0, message: 'No evaluation data yet.' };
  }

  const totalQueries = logs.length;
  const avgConfidence =
    logs.reduce((sum: number, l: { confidence_score: number | null }) => sum + (l.confidence_score ?? 0), 0) / totalQueries;

  const dontKnowCount = logs.filter((l: { generated_answer: string }) =>
    l.generated_answer.includes("I don't have enough information")
  ).length;

  const dontKnowRate = parseFloat(((dontKnowCount / totalQueries) * 100).toFixed(1));

  // Count which documents are queried most via sources
  const docHits: Record<string, number> = {};
  for (const log of logs) {
    const sources = log.sources as Array<{ document_id: string }> | null;
    if (sources) {
      for (const s of sources) {
        docHits[s.document_id] = (docHits[s.document_id] ?? 0) + 1;
      }
    }
  }

  const topDocuments = Object.entries(docHits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([document_id, hits]) => ({ document_id, hits }));

  return {
    total_queries: totalQueries,
    avg_confidence: parseFloat(avgConfidence.toFixed(3)),
    dont_know_rate_percent: dontKnowRate,
    top_queried_documents: topDocuments,
    generated_at: new Date().toISOString(),
  };
}
