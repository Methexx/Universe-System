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

-- 4. Table & function privileges for Supabase API roles.
--    These tables are created by Prisma migrations and do NOT inherit Supabase's
--    default GRANTs, so service_role (used by supabaseAdmin via PostgREST) gets
--    "permission denied for table" despite having BYPASSRLS. Grant explicitly.
GRANT SELECT, INSERT, UPDATE, DELETE ON policy_documents TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_chunks  TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluation_logs  TO service_role;

-- authenticated users only read (matches the RLS SELECT policies above)
GRANT SELECT ON policy_documents TO authenticated;
GRANT SELECT ON document_chunks  TO authenticated;

-- hybrid_search runs with caller privileges (plain SQL, not SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION hybrid_search(vector, text, integer)
  TO service_role, authenticated;
