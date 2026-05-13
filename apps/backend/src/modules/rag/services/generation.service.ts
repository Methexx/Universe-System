import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env';
import type { RetrievedChunk } from './retrieval.service';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const generationModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const MAX_CONTEXT_CHARS = 3000;

export interface GenerationResult {
  answer: string;
  sources: Array<{ document_id: string; chunk_index: number; snippet: string }>;
  confidence: number;
}

const DONT_KNOW_MARKER = "I don't have enough information";

function buildPrompt(chunks: RetrievedChunk[], question: string): string {
  let contextText = chunks.map((c) => c.chunk_text).join('\n\n');
  if (contextText.length > MAX_CONTEXT_CHARS) {
    contextText = contextText.slice(0, MAX_CONTEXT_CHARS) + '\n[...context truncated]';
  }

  return `You are a helpful assistant for a school. Answer the question using ONLY the school policy documents provided below.
If the context does not contain enough information to answer, respond with exactly: "${DONT_KNOW_MARKER} in the school policy documents to answer that."

[CONTEXT]
${contextText}

[QUESTION]
${question}`;
}

export async function generateAnswer(
  chunks: RetrievedChunk[],
  question: string
): Promise<GenerationResult> {
  const prompt = buildPrompt(chunks, question);

  const result = await generationModel.generateContent(prompt);
  const answer = result.response.text().trim();

  const didntKnow = answer.includes(DONT_KNOW_MARKER);
  const topSimilarity = chunks.length > 0 ? chunks[0].similarity : 0;
  const confidence = didntKnow ? 0 : Math.min(topSimilarity, 1);

  const sources = chunks.slice(0, 3).map((c) => ({
    document_id: c.document_id,
    chunk_index: c.chunk_index,
    snippet: c.chunk_text.slice(0, 120) + (c.chunk_text.length > 120 ? '...' : ''),
  }));

  return { answer, sources, confidence };
}
