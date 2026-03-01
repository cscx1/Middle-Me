-- Adaptive Emotional Probing: additive migration, backwards compatible
-- Run in Supabase Dashboard → SQL Editor

-- ─── sessions: emotional_alignment_score + openness_score ────────────────────

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS emotional_alignment_score numeric(3,2),
  ADD COLUMN IF NOT EXISTS openness_score numeric(3,2);

-- Backfill from avg_rating so existing sessions show correctly in the meter
UPDATE sessions
SET emotional_alignment_score = avg_rating
WHERE avg_rating IS NOT NULL AND emotional_alignment_score IS NULL;

-- ─── message_interactions ─────────────────────────────────────────────────────
-- Separate from message_ratings — new sessions use this table
-- scale: response_value 1-5
-- yes_no: response_value 1 (yes) or 0 (no)

CREATE TABLE IF NOT EXISTS message_interactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id       uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('scale', 'yes_no')),
  response_value   smallint NOT NULL CHECK (response_value >= 0 AND response_value <= 5),
  created_at       timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT message_interactions_unique UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS message_interactions_message_id_idx ON message_interactions(message_id);
CREATE INDEX IF NOT EXISTS message_interactions_user_id_idx ON message_interactions(user_id);

-- ─── RLS for message_interactions ────────────────────────────────────────────

ALTER TABLE message_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions: insert own"
  ON message_interactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN sessions s ON s.id = m.session_id
      WHERE m.id = message_interactions.message_id
        AND s.created_by = auth.uid()
    )
  );

CREATE POLICY "interactions: read own"
  ON message_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "interactions: update own"
  ON message_interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "interactions: delete own"
  ON message_interactions FOR DELETE
  USING (auth.uid() = user_id);
