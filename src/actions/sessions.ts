'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { mediationChain } from '@/lib/ai'
import { retrieveContext } from '@/lib/scraper/rag'
import type { ActionResult, Session, Message } from '@/types'

export async function createSession(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string)?.trim()
  const topic = (formData.get('topic') as string)?.trim() || null

  if (!title) return

  const { data, error } = await supabase
    .from('sessions')
    .insert({ title, topic, created_by: user.id })
    .select()
    .single()

  if (error) {
    console.error('createSession error:', error.message)
    return
  }

  redirect(`/sessions/${data.id}`)
}

export async function sendMessage(
  sessionId: string,
  content: string
): Promise<ActionResult<{ userMessage: Message; aiMessage: Message }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify the user owns this session
  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('created_by', user.id)
    .single()

  if (!session) return { success: false, error: 'Session not found' }

  // 1. Fetch RAG context from articles
  const articles = await retrieveContext(content)

  // 2. Run mediation chain
  let aiResponse: string
  try {
    aiResponse = await mediationChain.invoke({ message: content, articles })
  } catch (err) {
    console.error('AI chain error:', err)
    return { success: false, error: 'AI mediator is unavailable. Please try again.' }
  }

  // 3. Persist both messages
  const { data: messages, error: insertError } = await supabase
    .from('messages')
    .insert([
      { session_id: sessionId, role: 'user', content },
      { session_id: sessionId, role: 'mediator', content: aiResponse },
    ])
    .select()

  if (insertError || !messages) {
    return { success: false, error: 'Failed to save messages' }
  }

  revalidatePath(`/sessions/${sessionId}`)

  return {
    success: true,
    data: {
      userMessage: messages[0] as Message,
      aiMessage: messages[1] as Message,
    },
  }
}

export async function listSessions(): Promise<ActionResult<Session[]>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  return { success: true, data: (data ?? []) as Session[] }
}

export async function getSessionWithMessages(
  sessionId: string
): Promise<ActionResult<{ session: Session; messages: Message[] }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const [sessionResult, messagesResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('created_by', user.id)
      .single(),
    supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true }),
  ])

  if (sessionResult.error || !sessionResult.data) {
    return { success: false, error: 'Session not found' }
  }

  return {
    success: true,
    data: {
      session: sessionResult.data as Session,
      messages: (messagesResult.data ?? []) as Message[],
    },
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'open' | 'resolved' | 'archived'
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
    .eq('created_by', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true, data: undefined }
}
