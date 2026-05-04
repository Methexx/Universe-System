import { supabaseAdmin } from '../../../config/supabase';

export interface RetrievedChunk {
  id: string;
  chunk_text: string;
  document_id: string;
  similarity: number;
  chunk_index: number;
}

/**
 * Calls the hybrid_search Supabase RPC which combines:
 * - pgvector cosine similarity (semantic match, weight 0.7)
 * - PostgreSQL tsvector full-text rank (keyword match, weight 0.3)
 *
 * Using both catches cases where semantic embeddings miss exact terminology
 * (e.g., a policy number or specific acronym that embeddings generalise away).
 */
export async function hybridSearch(
  queryEmbedding: number[],
  queryText: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const { data, error } = await supabaseAdmin.rpc('hybrid_search', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    query_text: queryText,
    match_count: topK,
  });

  if (error) throw new Error(`hybrid_search RPC failed: ${error.message}`);
  if (!data || data.length === 0) return [];

  return data as RetrievedChunk[];
}

/**
 * Re-ranks retrieved chunks using term frequency boosting (BM25-inspired).
 * Cross-encoder models are more accurate but require Python; this lightweight
 * approach improves ordering for keyword-heavy queries without extra dependencies.
 *
 * Chunks with more query term occurrences are boosted proportionally.
 */
export function rerankChunks(chunks: RetrievedChunk[], queryText: string): RetrievedChunk[] {
  const queryTerms = queryText
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2); // ignore stop words shorter than 3 chars

  return chunks
    .map((chunk) => {
      const lowerText = chunk.chunk_text.toLowerCase();
      const termFrequency = queryTerms.reduce((count, term) => {
        const matches = (lowerText.match(new RegExp(term, 'g')) || []).length;
        return count + matches;
      }, 0);

      // Blend original similarity with term frequency boost (capped at 0.1)
      const boost = Math.min(termFrequency * 0.02, 0.1);
      return { ...chunk, similarity: chunk.similarity + boost };
    })
    .sort((a, b) => b.similarity - a.similarity);
}
