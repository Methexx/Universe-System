import { PDFParse } from 'pdf-parse';

export interface TextChunk {
  text: string;
  index: number;
}

const CHUNK_TOKEN_SIZE = 512;
const OVERLAP_TOKEN_SIZE = 50;

// Rough approximation: 1 token ≈ 4 characters for English text
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Splits text into sentences using punctuation boundaries.
 * Sentence-aware splitting avoids cutting mid-sentence, which degrades embedding quality.
 */
function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Merges sentences into chunks of ~CHUNK_TOKEN_SIZE tokens with OVERLAP_TOKEN_SIZE overlap.
 * Overlap ensures context continuity — a chunk boundary mid-topic doesn't lose surrounding context.
 */
function buildChunks(sentences: string[]): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    if (currentTokens + sentenceTokens > CHUNK_TOKEN_SIZE && current.length > 0) {
      chunks.push(current.join(' '));

      // Keep overlap sentences from the end of the current chunk
      let overlapTokens = 0;
      const overlapSentences: string[] = [];
      for (let i = current.length - 1; i >= 0; i--) {
        const t = estimateTokens(current[i]);
        if (overlapTokens + t > OVERLAP_TOKEN_SIZE) break;
        overlapSentences.unshift(current[i]);
        overlapTokens += t;
      }
      current = [...overlapSentences, sentence];
      currentTokens = overlapSentences.reduce((sum, s) => sum + estimateTokens(s), 0) + sentenceTokens;
    } else {
      current.push(sentence);
      currentTokens += sentenceTokens;
    }
  }

  if (current.length > 0) {
    chunks.push(current.join(' '));
  }

  return chunks;
}

/**
 * Extracts text from a PDF buffer and returns indexed chunks.
 * Cleans up hyphenation artifacts and extra whitespace common in PDF-extracted text.
 */
export async function chunkPdf(buffer: Buffer): Promise<TextChunk[]> {
  const parser = new PDFParse({ data: buffer });
  let rawText: string;
  try {
    const result = await parser.getText();
    rawText = result.text;
  } finally {
    await parser.destroy(); // always release the pdf.js worker
  }

  const cleaned = rawText
    .replace(/-\n/g, '')     // rejoin hyphenated line breaks
    .replace(/\n+/g, ' ')   // flatten newlines to spaces
    .replace(/\s{2,}/g, ' ') // collapse multiple spaces
    .trim();

  const sentences = splitSentences(cleaned);
  const rawChunks = buildChunks(sentences);

  return rawChunks.map((text, index) => ({ text: text.trim(), index }));
}

/**
 * Extracts text from plain text buffer and returns indexed chunks.
 */
export async function chunkText(buffer: Buffer): Promise<TextChunk[]> {
  const text = buffer.toString('utf-8');
  const sentences = splitSentences(text);
  const rawChunks = buildChunks(sentences);
  return rawChunks.map((text, index) => ({ text: text.trim(), index }));
}
