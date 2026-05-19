-- ============================================================
-- Migrate policy_documents: boolean is_processed -> 3-state status string
-- Run via:
--   npx prisma db execute --file prisma/policy_document_status.sql --schema prisma/schema.prisma
-- Idempotent: safe to re-run.
-- ============================================================

ALTER TABLE "policy_documents"
  ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'processing';

ALTER TABLE "policy_documents"
  ADD COLUMN IF NOT EXISTS "error_message" text;

-- Backfill status from the old boolean, then drop it — only on the first run.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policy_documents' AND column_name = 'is_processed'
  ) THEN
    UPDATE "policy_documents"
      SET "status" = CASE WHEN "is_processed" THEN 'completed' ELSE 'processing' END;
    ALTER TABLE "policy_documents" DROP COLUMN "is_processed";
  END IF;
END $$;
