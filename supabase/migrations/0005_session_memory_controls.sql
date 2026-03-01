-- Session Memory Controls: soft-delete support
-- Run in Supabase Dashboard → SQL Editor
-- Additive only — no drops, no breaking changes

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_sessions_deleted_at
  ON sessions(deleted_at)
  WHERE deleted_at IS NOT NULL;
