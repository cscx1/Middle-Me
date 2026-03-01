export type SessionStatus = 'open' | 'resolved' | 'archived'
export type MessageRole = 'user' | 'mediator'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export type SessionCategory =
  | 'politics'
  | 'relationships'
  | 'work'
  | 'religion'
  | 'health'
  | 'family'
  | 'other'

// Adaptive step types — old values kept for backwards compat parsing
export type StepType =
  | 'deescalation'
  | 'belief_probe'
  | 'fact_probe'
  | 'values_probe'
  | 'reflection'
  // legacy
  | 'breakdown'
  | 'shared_values'
  | 'misunderstandings'
  | 'closing'

export type InteractionType = 'scale' | 'yes_no'

export interface Interaction {
  type: InteractionType
  question: string
}

export interface MessageMeta {
  step_type?: StepType
  // New adaptive probing format
  interaction?: Interaction
  // Legacy format (kept for backwards compat)
  follow_up_question?: string
  ready_for_summary?: boolean
}

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  content: string
  meta?: MessageMeta | null
  created_at: string
}

export interface SessionSummary {
  middle_ground: string
  bridge_statements: string[]
  advice: string
}

export interface Session {
  id: string
  title: string
  topic: string | null
  category: SessionCategory | null
  user_perspective: string | null
  opposing_perspective: string | null
  business_mode: boolean
  // New adaptive scoring (primary)
  emotional_alignment_score: number | null
  openness_score: number | null
  // Legacy (kept for backwards compat)
  avg_rating: number | null
  summary: SessionSummary | null
  status: SessionStatus
  created_by: string
  created_at: string
  deleted_at?: string | null
  profiles?: Pick<Profile, 'display_name' | 'avatar_url'>
}

export interface Article {
  id: string
  url: string
  title: string
  content: string
  topic: string | null
  scraped_at: string
}

export interface TrendingTopic {
  topic: string
  article_count: number
  latest_scraped_at: string
}

// New: adaptive interaction response
export interface MessageInteraction {
  id: string
  message_id: string
  user_id: string
  interaction_type: InteractionType
  response_value: number
  created_at: string
}

// Legacy: kept for backwards compat with old sessions
export interface MessageRating {
  id: string
  message_id: string
  user_id: string
  rating: number
  created_at: string
}

// Server action result wrapper
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
