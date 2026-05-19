import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env';
import type { RetrievedChunk } from './retrieval.service';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const generationModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const MAX_CONTEXT_CHARS = 16000;

export interface GenerationResult {
  answer: string;
  sources: Array<{ document_id: string; chunk_index: number; snippet: string }>;
  confidence: number;
}

const DONT_KNOW_MARKER = "I don't have enough information";

// Prepended (general-knowledge path) or appended by the model (mixed answers)
// so users don't mistake general guidance for the school's official policy.
const GENERAL_DISCLAIMER =
  "ℹ️ General guidance — this is not from your school's official policy documents.";

function buildPrompt(chunks: RetrievedChunk[], question: string): string {
  let contextText = chunks.map((c) => c.chunk_text).join('\n\n');
  if (contextText.length > MAX_CONTEXT_CHARS) {
    contextText = contextText.slice(0, MAX_CONTEXT_CHARS) + '\n[...context truncated]';
  }

  return `You are a helpful assistant for a school. Answer the user's question.

Use the school policy excerpts below as your primary, authoritative source.
- If the excerpts fully answer the question, answer directly from them.
- If the excerpts only partially cover it, answer from them AND supplement with general knowledge of how schools commonly operate, so the answer is helpful.
- If any part of your answer is NOT taken from the excerpts, append this exact line at the very end: "${GENERAL_DISCLAIMER}"
- Only if the question is not about school or education at all, reply with exactly: "${DONT_KNOW_MARKER} in the school policy documents to answer that."

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

/**
 * Fallback used when retrieval finds no relevant policy chunks.
 * Answers school/education questions from the model's general knowledge so the
 * bot stays helpful, with a disclaimer that it is not official school policy.
 * Genuinely non-school questions still get the standard refusal.
 */
export async function generateGeneralAnswer(question: string): Promise<GenerationResult> {
  const prompt = `You are a helpful assistant for a school. The school's policy documents do not contain information relevant to this question.
If the question is about school, education, students, or related matters, answer it helpfully using general knowledge of how schools commonly operate.
If the question is NOT about school or education at all, reply with exactly: "${DONT_KNOW_MARKER} in the school policy documents to answer that."

[QUESTION]
${question}`;

  const result = await generationModel.generateContent(prompt);
  let answer = result.response.text().trim();

  const didntKnow = answer.includes(DONT_KNOW_MARKER);
  if (!didntKnow) {
    answer = `${GENERAL_DISCLAIMER}\n\n${answer}`;
  }

  return { answer, sources: [], confidence: didntKnow ? 0 : 0.3 };
}
