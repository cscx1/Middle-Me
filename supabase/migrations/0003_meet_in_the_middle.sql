-- Meet in the Middle: structured steps, ratings, and summary
-- Run in Supabase Dashboard → SQL Editor

-- ─── sessions: business_mode, avg_rating, summary ────────────────────────────

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS business_mode boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS avg_rating    numeric(3,2),
  ADD COLUMN IF NOT EXISTS summary       jsonb;

-- ─── messages: meta (step_type, follow_up_question, ready_for_summary) ───────

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS meta jsonb;

-- ─── message_ratings ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS message_ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating     smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT message_ratings_unique_per_user UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS message_ratings_message_id_idx ON message_ratings(message_id);

-- ─── RLS for message_ratings ─────────────────────────────────────────────────

ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings: insert own"
  ON message_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN sessions s ON s.id = m.session_id
      WHERE m.id = message_ratings.message_id
        AND s.created_by = auth.uid()
    )
  );

CREATE POLICY "ratings: read own"
  ON message_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ratings: update own"
  ON message_ratings FOR UPDATE
  USING (auth.uid() = user_id);
