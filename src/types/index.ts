export type SessionStatus = 'open' | 'resolved' | 'archived'
export type MessageRole = 'user' | 'mediator'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Session {
  id: string
  title: string
  topic: string | null
  status: SessionStatus
  created_by: string
  created_at: string
  profiles?: Pick<Profile, 'display_name' | 'avatar_url'>
}

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  content: string
  created_at: string
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

// Server action result wrapper
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
