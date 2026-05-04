import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env';
import type { TextChunk } from './chunker.service';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
// text-embedding-004: 768-dim, free tier, strong semantic similarity on English text
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const BATCH_SIZE = 100; // Gemini free tier: 1500 req/min, 100 per batch is safe

/**
 * Embeds a single text string. Used for query embedding at search time.
 */
export async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

/**
 * Batch-embeds an array of chunks. Sends in groups of BATCH_SIZE to respect rate limits.
 * Returns chunks paired with their 768-dim embedding vectors.
 */
export async function embedChunks(
  chunks: TextChunk[]
): Promise<Array<TextChunk & { embedding: number[] }>> {
  const results: Array<TextChunk & { embedding: number[] }> = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const embeddings = await Promise.all(
      batch.map((chunk) => embeddingModel.embedContent(chunk.text))
    );

    for (let j = 0; j < batch.length; j++) {
      results.push({
        ...batch[j],
        embedding: embeddings[j].embedding.values,
      });
    }
  }

  return results;
}
