-- ============================================================
-- Creates the notifications table (in-app notification centre).
-- Run via:
--   npx prisma db execute --file prisma/notifications_table.sql --schema prisma/schema.prisma
-- Idempotent: safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS "notifications" (
  "id"           uuid        NOT NULL DEFAULT uuid_generate_v4(),
  "recipient_id" uuid        NOT NULL,
  "type"         text        NOT NULL,
  "title"        text        NOT NULL,
  "body"         text        NOT NULL,
  "data"         jsonb,
  "is_read"      boolean     NOT NULL DEFAULT false,
  "created_at"   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id")
    REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "notifications_recipient_id_is_read_idx"
  ON "notifications" ("recipient_id", "is_read");

CREATE INDEX IF NOT EXISTS "notifications_recipient_id_created_at_idx"
  ON "notifications" ("recipient_id", "created_at");
