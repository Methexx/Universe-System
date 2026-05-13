import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env';
import type { TextChunk } from './chunker.service';

// gemini-embedding-2 natively outputs 3072 dims; truncate to 768 to match existing pgvector schema
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

const EMBED_DIMS = 768;
const BATCH_SIZE = 100;

function embedRequest(text: string) {
  return {
    content: { parts: [{ text }], role: 'user' },
    outputDimensionality: EMBED_DIMS,
  } as Parameters<typeof embeddingModel.embedContent>[0];
}

export async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(embedRequest(text));
  return result.embedding.values;
}

export async function embedChunks(
  chunks: TextChunk[]
): Promise<Array<TextChunk & { embedding: number[] }>> {
  const results: Array<TextChunk & { embedding: number[] }> = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const embeddings = await Promise.all(
      batch.map((chunk) => embeddingModel.embedContent(embedRequest(chunk.text)))
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
