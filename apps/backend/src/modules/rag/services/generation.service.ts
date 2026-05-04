import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../../config/env';
import type { RetrievedChunk } from './retrieval.service';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// Cap context to ~3000 chars to stay well within Haiku's context window and control cost
const MAX_CONTEXT_CHARS = 3000;

export interface GenerationResult {
  answer: string;
  sources: Array<{ document_id: string; chunk_index: number; snippet: string }>;
  confidence: number;
}

const DONT_KNOW_MARKER = "I don't have enough information";

/**
 * Builds a structured prompt that separates context from the question.
 * Explicit [CONTEXT] / [QUESTION] tags help the model attend to the right section
 * and reduce hallucination by making the grounding instruction unambiguous.
 */
function buildPrompt(chunks: RetrievedChunk[], question: string): string {
  let contextText = chunks.map((c) => c.chunk_text).join('\n\n');

  // Truncate if the combined context is too large to avoid token overflow
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

/**
 * Calls Claude Haiku with the context-grounded prompt.
 * Haiku is used here for its speed and low cost — responses are short factual answers,
 * not creative generation, so the smaller model is appropriate.
 */
export async function generateAnswer(
  chunks: RetrievedChunk[],
  question: string
): Promise<GenerationResult> {
  const prompt = buildPrompt(chunks, question);

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const answer =
    message.content[0].type === 'text' ? message.content[0].text.trim() : '';

  // Heuristic confidence: 0 if model said it doesn't know, else based on top chunk similarity
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
