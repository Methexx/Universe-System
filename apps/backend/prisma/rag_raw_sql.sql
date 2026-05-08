-- ============================================================
-- RAG Raw SQL: HNSW index, hybrid_search RPC, RLS policies
-- Run via: npx prisma db execute --file prisma/rag_raw_sql.sql --schema prisma/schema.prisma
-- ============================================================

-- 1. HNSW index on document_chunks.embedding for fast cosine similarity search.
--    HNSW (Hierarchical Navigable Small World) outperforms IVFFlat at recall
--    without requiring a training step (lists parameter). Better for dynamic inserts.
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 2. Hybrid search RPC: combines pgvector cosine similarity (semantic, weight 0.7)
--    and PostgreSQL tsvector full-text rank (keyword, weight 0.3).
--    Hybrid scoring catches both conceptually similar and exact-term matches.
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding vector(768),
  query_text      text,
  match_count     int DEFAULT 5
)
RETURNS TABLE (
  id          uuid,
  chunk_text  text,
  document_id uuid,
  similarity  float,
  chunk_index int
)
LANGUAGE sql STABLE AS $$
  SELECT
    dc.id,
    dc.chunk_text,
    dc.document_id,
    (
      (1 - (dc.embedding <=> query_embedding)) * 0.7
      + ts_rank(
          to_tsvector('english', dc.chunk_text),
          plainto_tsquery('english', query_text)
        ) * 0.3
    ) AS similarity,
    dc.chunk_index
  FROM document_chunks dc
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- 3. RLS: Restrict who can manage policy documents.
--    policy_documents: admins can do anything; all authenticated users can read.
--    document_chunks: all authenticated users can read (needed for RAG queries).
--    evaluation_logs: admins only (sensitive usage data).
ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_logs  ENABLE ROW LEVEL SECURITY;

-- Drop if exists before recreating (idempotent)
DROP POLICY IF EXISTS "admins_full_access_policy_documents" ON policy_documents;
DROP POLICY IF EXISTS "authenticated_read_policy_documents" ON policy_documents;
DROP POLICY IF EXISTS "authenticated_read_chunks"           ON document_chunks;
DROP POLICY IF EXISTS "admins_full_access_eval_logs"        ON evaluation_logs;

CREATE POLICY "admins_full_access_policy_documents" ON policy_documents
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
  );

CREATE POLICY "authenticated_read_policy_documents" ON policy_documents
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_read_chunks" ON document_chunks
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "admins_full_access_eval_logs" ON evaluation_logs
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
  );

-- ── Processing status column (fix for stuck "Processing" badges) ─────────────
-- Adds a status enum to distinguish: pending | processing | completed | failed
-- Idempotent — safe to re-apply.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'processing_status_enum') THEN
    CREATE TYPE processing_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
  END IF;
END
$$;

ALTER TABLE policy_documents
  ADD COLUMN IF NOT EXISTS processing_status processing_status_enum NOT NULL DEFAULT 'pending';

ALTER TABLE policy_documents
  ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Back-fill: completed rows
UPDATE policy_documents
  SET processing_status = 'completed'
  WHERE is_processed = true AND processing_status = 'pending';

-- Back-fill: stuck rows (is_processed=false AND older than 30 minutes → failed)
UPDATE policy_documents
  SET processing_status = 'failed'
  WHERE is_processed = false
    AND processing_status = 'pending'
    AND created_at < NOW() - INTERVAL '30 minutes';

