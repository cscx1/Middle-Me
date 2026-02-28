'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { TrendingTopic } from '@/types'

interface Props {
  initial: TrendingTopic[]
}

export function TrendingTopics({ initial }: Props) {
  const [topics, setTopics] = useState<TrendingTopic[]>(initial)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new article inserts — refetch the view on change
    const channel = supabase
      .channel('articles-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'articles' },
        async () => {
          const { data } = await supabase
            .from('trending_topics')
            .select('*')
          if (data) setTopics(data as TrendingTopic[])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (topics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No trending topics yet. Scrape some news to get started.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((t) => (
        <span
          key={t.topic}
          className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors cursor-default"
          title={`${t.article_count} articles`}
        >
          <TrendingUp className="w-3 h-3" />
          {t.topic}
          <span className="opacity-60">({t.article_count})</span>
        </span>
      ))}
    </div>
  )
}
