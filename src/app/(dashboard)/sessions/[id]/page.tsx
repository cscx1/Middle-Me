import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SessionChat } from './SessionChat'
import type { Message, MessageRating, MessageInteraction, Session } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('sessions').select('title').eq('id', id).single()
  return { title: data ? `${data.title} — Middle Me` : 'Session — Middle Me' }
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()

  const businessMode = cookieStore.get('middle_me_business_mode')?.value === 'true'

  const { data: { user } } = await supabase.auth.getUser()

  const [sessionResult, messagesResult, ratingsResult, interactionsResult] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', id).eq('created_by', user!.id).single(),
    supabase.from('messages').select('*').eq('session_id', id).order('created_at', { ascending: true }),
    supabase.from('message_ratings').select('*').eq('user_id', user!.id),
    supabase.from('message_interactions').select('*').eq('user_id', user!.id),
  ])

  if (sessionResult.error || !sessionResult.data) notFound()

  return (
    <SessionChat
      session={sessionResult.data as Session}
      initialMessages={(messagesResult.data ?? []) as Message[]}
      initialRatings={(ratingsResult.data ?? []) as MessageRating[]}
      initialInteractions={(interactionsResult.data ?? []) as MessageInteraction[]}
      businessMode={businessMode}
    />
  )
}
