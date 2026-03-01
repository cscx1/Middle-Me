-- Middle Me Demo Sprint Migration
-- Run this in Supabase Dashboard → SQL Editor

-- Add perspective and category columns to sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS user_perspective text,
  ADD COLUMN IF NOT EXISTS opposing_perspective text,
  ADD COLUMN IF NOT EXISTS category text;

-- Seed Business Mode demo company policies
-- Using zero vectors since RAG keyword match supplements semantic search
INSERT INTO articles (url, title, content, topic, embedding) VALUES
(
  'internal://policy/conflict',
  'Workplace Conflict Resolution Policy',
  'Employees must resolve disagreements through respectful dialogue. The company encourages active listening, empathy, and a solutions-first mindset. All parties should feel psychologically safe throughout any conflict resolution process. Escalation to HR is available if direct dialogue is unsuccessful. Retaliation against any party is strictly prohibited.',
  'work',
  array_fill(0, ARRAY[768])::vector
),
(
  'internal://policy/inclusion',
  'Inclusion and Belonging Standards',
  'The company is committed to an inclusive workplace where every voice is heard and respected. Differences in background, belief, communication style, and lived experience are valued as strengths. Leaders are expected to model inclusive behavior and address bias promptly. Employees have a right to a workplace free from discrimination and microaggressions.',
  'work',
  array_fill(0, ARRAY[768])::vector
),
(
  'internal://policy/wellness',
  'Employee Wellness and EAP Guidelines',
  'The Employee Assistance Program (EAP) provides free, confidential counseling for personal and workplace challenges including stress, relationship difficulties, and mental health concerns. Employees are encouraged to seek support early rather than waiting for a crisis. Mental health is treated with the same urgency and respect as physical health. All EAP interactions are fully confidential.',
  'work',
  array_fill(0, ARRAY[768])::vector
),
(
  'internal://policy/communication',
  'Professional Communication Standards',
  'All workplace communication must remain respectful and constructive. Employees should assume positive intent, seek to understand before responding, and avoid inflammatory language. Written communications including email and chat should be professional in tone. Disagreements should be addressed directly and privately before escalating to management.',
  'work',
  array_fill(0, ARRAY[768])::vector
)
ON CONFLICT (url) DO NOTHING;
