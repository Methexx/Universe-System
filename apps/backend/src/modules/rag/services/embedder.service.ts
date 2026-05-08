import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env';
import type { TextChunk } from './chunker.service';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

const BATCH_SIZE = 20;
const EMBED_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

async function embedWithRetry(text: string): Promise<number[]> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini embed timeout')), EMBED_TIMEOUT_MS)
      );
      // outputDimensionality truncates gemini-embedding-001 (3072-dim) to 768 to match the DB column.
      // SDK v0.24.1 types don't expose this field yet — cast to bypass.
      const req = { content: { parts: [{ text }], role: 'user' }, outputDimensionality: 768 } as Parameters<typeof embeddingModel.embedContent>[0];
      const embedPromise = embeddingModel.embedContent(req).then((r) => r.embedding.values);
      return await Promise.race([embedPromise, timeoutPromise]);
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error('Unreachable');
}

export async function embedText(text: string): Promise<number[]> {
  return embedWithRetry(text);
}

export async function embedChunks(
  chunks: TextChunk[]
): Promise<Array<TextChunk & { embedding: number[] }>> {
  const results: Array<TextChunk & { embedding: number[] }> = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    for (const chunk of batch) {
      const embedding = await embedWithRetry(chunk.text);
      results.push({ ...chunk, embedding });
    }
  }

  return results;
}
