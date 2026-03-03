// Deno Edge Function — invoked on-demand or via pg_cron
// Fetches news articles, generates embeddings via Google text-embedding-004,
// classifies topics via Gemini 2.5 Flash, and upserts into the articles table.
//
// Local dev: supabase functions serve scrape-news --env-file .env.local
// Deploy:    supabase functions deploy scrape-news 

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const genai = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY')!)

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
  const model = genai.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
}

async function classifyTopic(title: string, description: string): Promise<string> {
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(
    `Classify this news article into ONE short topic label (2-3 words max, e.g. "climate change", "immigration", "gun control"). Article: "${title}. ${description}". Respond with only the topic label.`
  )
  return result.response.text().trim().toLowerCase() || 'general'
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
