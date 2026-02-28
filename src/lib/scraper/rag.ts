import { createClient } from '@/lib/supabase/server'

interface MatchedArticle {
  id: string
  title: string
  content: string
  topic: string | null
  similarity: number
}

async function generateQueryEmbedding(query: string): Promise<number[]> {
  // Uses Supabase's built-in AI embedding endpoint (gte-small model, 384 dims)
  // For 1536-dim compatibility with OpenAI ada-002, swap this for an OpenAI call
  // Zero-vector fallback ensures the app doesn't crash if embedding is unavailable
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase as any).functions.invoke('embed', {
      body: { input: query },
    })
    if (error || !data?.embedding) throw new Error('No embedding returned')
    return data.embedding
  } catch {
    return new Array(1536).fill(0)
  }
}

export async function retrieveContext(query: string, matchCount = 3): Promise<string> {
  try {
    const supabase = await createClient()
    const embedding = await generateQueryEmbedding(query)

    const { data, error } = await supabase.rpc('match_articles', {
      query_embedding: embedding,
      match_count: matchCount,
      match_threshold: 0.4,
    }) as { data: MatchedArticle[] | null; error: unknown }

    if (error || !data || data.length === 0) return ''

    const formatted = data
      .map((a, i) => `[Article ${i + 1}] ${a.title}\n${a.content.slice(0, 300)}...`)
      .join('\n\n')

    return `Relevant news context:\n${formatted}\n\n`
  } catch {
    return ''
  }
}
