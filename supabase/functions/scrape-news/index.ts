// Deno Edge Function — invoked on-demand or via pg_cron
// Fetches news articles, generates embeddings, upserts into the articles table.
//
// Local dev: supabase functions serve scrape-news --env-file .env.local
// Deploy:    supabase functions deploy scrape-news

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.37.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

interface NewsArticle {
  url: string
  title: string
  description: string
  source: string
}

async function fetchNewsArticles(query: string): Promise<NewsArticle[]> {
  const apiKey = Deno.env.get('NEWS_API_KEY')
  if (!apiKey) throw new Error('NEWS_API_KEY not set')

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&language=en&apiKey=${apiKey}`
  const res = await fetch(url)

  if (!res.ok) throw new Error(`NewsAPI error: ${res.statusText}`)

  const data = await res.json()
  return (data.articles ?? [])
    .filter((a: { url: string; title: string; description: string }) => a.url && a.title && a.description)
    .map((a: { url: string; title: string; description: string; source?: { name: string } }) => ({
      url: a.url,
      title: a.title,
      description: a.description,
      source: a.source?.name ?? 'Unknown',
    }))
}

async function generateEmbedding(text: string): Promise<number[]> {
  // Claude doesn't have an embeddings API — use OpenAI-compatible endpoint via Supabase AI
  // or fall back to a lightweight hash-based placeholder for MVP
  // When you add OpenAI: replace with openai.embeddings.create(...)
  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/embed`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ input: text }),
    }
  )

  if (!response.ok) {
    // Fallback: zero vector (embedding search won't work, but upsert succeeds)
    return new Array(1536).fill(0)
  }

  const { embedding } = await response.json()
  return embedding
}

async function classifyTopic(title: string, description: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 20,
    messages: [
      {
        role: 'user',
        content: `Classify this news article into ONE short topic label (2-3 words max, e.g. "climate change", "immigration", "gun control"). Article: "${title}. ${description}". Respond with only the topic label.`,
      },
    ],
  })

  const content = msg.content[0]
  return content.type === 'text' ? content.text.trim().toLowerCase() : 'general'
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { query = 'political controversy divisive issues' } = await req.json().catch(() => ({}))

    const articles = await fetchNewsArticles(query)

    const results = await Promise.allSettled(
      articles.map(async (article) => {
        const content = `${article.title}. ${article.description}`
        const [embedding, topic] = await Promise.all([
          generateEmbedding(content),
          classifyTopic(article.title, article.description),
        ])

        const { error } = await supabase.from('articles').upsert(
          {
            url: article.url,
            title: article.title,
            content,
            topic,
            embedding,
            scraped_at: new Date().toISOString(),
          },
          { onConflict: 'url', ignoreDuplicates: false }
        )

        if (error) throw error
        return article.url
      })
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return Response.json({ succeeded, failed, total: articles.length })
  } catch (err) {
    console.error('scrape-news error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
})
