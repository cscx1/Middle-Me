import { createClient } from '@/lib/supabase/server'

export async function triggerNewsScrape(query: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.functions.invoke('scrape-news', {
    body: { query },
  })

  if (error) {
    console.error('Failed to invoke scrape-news edge function:', error.message)
    throw new Error('News scrape failed')
  }
}
