import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionChat } from './SessionChat'
import type { Message, Session } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('sessions')
    .select('title')
    .eq('id', id)
    .single()
  return { title: data ? `${data.title} — Middle Me` : 'Session — Middle Me' }
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [sessionResult, messagesResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .eq('created_by', user!.id)
      .single(),
    supabase
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (sessionResult.error || !sessionResult.data) notFound()

  return (
    <SessionChat
      session={sessionResult.data as Session}
      initialMessages={(messagesResult.data ?? []) as Message[]}
    />
  )
}
