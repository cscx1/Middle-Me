'use server' 

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { runMediationStep, runSummaryChain, computeNextStepHint } from '@/lib/ai'
import { retrieveContext } from '@/lib/scraper/rag'
import type {
  ActionResult,
  Session,
  Message,
  SessionCategory,
  SessionSummary,
  MessageRating,
  MessageInteraction,
  InteractionType,
} from '@/types'

// ─── createSession ────────────────────────────────────────────────────────────

export async function createSession(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const cookieStore = await cookies()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string)?.trim()
  const topic = (formData.get('topic') as string)?.trim() || null
  const category = (formData.get('category') as SessionCategory) || null
  const userPerspective = (formData.get('user_perspective') as string)?.trim() || null
  const opposingPerspective = (formData.get('opposing_perspective') as string)?.trim() || null
  // `mode=business` from form (e.g. from /sessions/new?mode=business) OR cookie
  const modeParam = (formData.get('mode') as string) === 'business'
  const businessMode = modeParam || cookieStore.get('middle_me_business_mode')?.value === 'true'

  if (!title) return

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      title,
      topic: topic ?? category ?? title,
      category,
      user_perspective: userPerspective,
      opposing_perspective: opposingPerspective,
      business_mode: businessMode,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('createSession DB error:', error.message, error.code)
    // Fallback if migration not yet run
    if (error.message?.includes('business_mode') || error.code === 'PGRST204' || error.code === '42703') {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('sessions')
        .insert({
          title,
          topic: topic ?? category ?? title,
          category,
          user_perspective: userPerspective,
          opposing_perspective: opposingPerspective,
          created_by: user.id,
        })
        .select()
        .single()
      if (fallbackError) {
        console.error('createSession fallback error:', fallbackError.message)
        throw new Error(`Failed to create session: ${fallbackError.message}`)
      }
      redirect(`/sessions/${fallbackData.id}`)
    }
    throw new Error(`Failed to create session: ${error.message}`)
  }

  // Auto-generate opening mediation step
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in .env.local')
    }
    const articles = await retrieveContext(topic ?? title)
    const stepOutput = await runMediationStep(
      {
        message: '',
        articles,
        user_perspective: userPerspective ?? 'Not provided',
        opposing_perspective: opposingPerspective ?? 'Not provided',
        topic: topic ?? title,
        category: category ?? 'other',
        step_index: 0,
        emotional_score: 'N/A',
        openness_score: 'N/A',
        suggested_step: 'deescalation',
        conversation_history: '(First message — no history yet)',
      },
      businessMode
    )

    if (!stepOutput.ai_text) {
      throw new Error('AI returned empty opening step')
    }

    const { error: insertError } = await supabase.from('messages').insert({
      session_id: data.id,
      role: 'mediator',
      content: stepOutput.ai_text,
      meta: stepOutput.meta,
    })

    if (insertError) {
      console.error('Failed to save opening message:', insertError.message)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Auto-opening step failed:', msg)
  }

  redirect(`/sessions/${data.id}`)
}

// ─── sendMessage ──────────────────────────────────────────────────────────────

export async function sendMessage(
  sessionId: string,
  content: string,
  businessMode = false
): Promise<ActionResult<{
  userMessage: Message
  aiMessage: Message
  summary?: SessionSummary | null
  avgRating?: number | null
  emotionalAlignmentScore?: number | null
  opennessScore?: number | null
}>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: session } = await supabase
    .from('sessions')
    .select('id, title, topic, category, user_perspective, opposing_perspective, avg_rating, emotional_alignment_score, openness_score, summary, business_mode')
    .eq('id', sessionId)
    .eq('created_by', user.id)
    .single()

  if (!session) return { success: false, error: 'Session not found' }

  // Fetch prior messages for conversation history and mediator count
  const { data: priorMessages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20)

  const mediatorCount = (priorMessages ?? []).filter(
    (m: { role: string }) => m.role === 'mediator'
  ).length

  const conversationHistory = (priorMessages ?? [])
    .map((m: { role: string; content: string }) =>
      `${m.role === 'user' ? 'User' : 'Mediator'}: ${m.content.slice(0, 300)}`
    )
    .join('\n') || '(First message — no history yet)'

  const stepIndex = mediatorCount ?? 0
  const emotionalScore = (session.emotional_alignment_score ?? session.avg_rating) as number | null
  const opennessScore = session.openness_score as number | null
  const effectiveBusinessMode = businessMode || Boolean(session.business_mode)

  // Deterministic step hint
  const suggestedStep = computeNextStepHint(emotionalScore, opennessScore, stepIndex)

  // RAG context
  const ragQuery = effectiveBusinessMode ? `workplace ${content}` : content
  const articles = await retrieveContext(ragQuery)

  // Invoke structured step chain
  let stepOutput
  try {
    stepOutput = await runMediationStep(
      {
        message: content,
        articles,
        user_perspective: session.user_perspective ?? 'Not provided',
        opposing_perspective: session.opposing_perspective ?? 'Not provided',
        topic: session.topic ?? session.title,
        category: session.category ?? 'other',
        step_index: stepIndex,
        emotional_score: emotionalScore != null ? String(emotionalScore.toFixed(2)) : 'N/A',
        openness_score: opennessScore != null ? String(opennessScore.toFixed(2)) : 'N/A',
        suggested_step: suggestedStep,
        conversation_history: conversationHistory,
      },
      effectiveBusinessMode
    )
  } catch (err) {
    console.error('AI chain error:', err)
    return { success: false, error: 'The AI mediator is temporarily unavailable. Please try again.' }
  }

  // Persist both messages
  const { data: messages, error: insertError } = await supabase
    .from('messages')
    .insert([
      { session_id: sessionId, role: 'user', content },
      { session_id: sessionId, role: 'mediator', content: stepOutput.ai_text, meta: stepOutput.meta },
    ])
    .select()

  if (insertError || !messages) {
    return { success: false, error: 'Failed to save messages' }
  }

  // Check summary trigger
  const shouldSummarize =
    !session.summary &&
    (stepOutput.meta.ready_for_summary ||
      stepIndex >= 5 ||
      (emotionalScore != null && emotionalScore >= 3.5))

  let finalSummary: SessionSummary | null = null
  if (shouldSummarize) {
    finalSummary = await generateAndStoreSummary(supabase, sessionId, session, emotionalScore, opennessScore)
  }

  revalidatePath(`/sessions/${sessionId}`)

  return {
    success: true,
    data: {
      userMessage: messages[0] as Message,
      aiMessage: messages[1] as Message,
      summary: finalSummary,
      avgRating: emotionalScore,
      emotionalAlignmentScore: emotionalScore,
      opennessScore,
    },
  }
}

// ─── submitInteraction (new adaptive probing system) ─────────────────────────

export async function submitInteraction(
  sessionId: string,
  messageId: string,
  interactionType: InteractionType,
  responseValue: number
): Promise<ActionResult<{
  emotionalAlignmentScore: number | null
  opennessScore: number | null
  summary?: SessionSummary | null
}>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Upsert interaction (one per user per message)
  const { error: interactionError } = await supabase
    .from('message_interactions')
    .upsert(
      {
        message_id: messageId,
        user_id: user.id,
        interaction_type: interactionType,
        response_value: responseValue,
      },
      { onConflict: 'message_id,user_id' }
    )

  if (interactionError) {
    console.error('submitInteraction error:', interactionError.message)
    return { success: false, error: 'Failed to save interaction' }
  }

  // Recompute scores from all interactions for this session
  const { data: allInteractions } = await supabase
    .from('message_interactions')
    .select('interaction_type, response_value, messages!inner(session_id, meta)')
    .eq('messages.session_id', sessionId)
    .eq('user_id', user.id)

  let newEmotionalScore: number | null = null
  let newOpennessScore: number | null = null

  if (allInteractions && allInteractions.length > 0) {
    const scaleInteractions = allInteractions.filter(i => i.interaction_type === 'scale')
    const yesNoInteractions = allInteractions.filter(i => i.interaction_type === 'yes_no')

    if (scaleInteractions.length > 0) {
      // Invert deescalation ratings (5 stars = very distressed = low progress)
      const sum = scaleInteractions.reduce((acc, i) => {
        const stepType = (i.messages as any)?.meta?.step_type
        const value = stepType === 'deescalation' ? (6 - i.response_value) : i.response_value
        return acc + value
      }, 0)
      const rawAvg = sum / scaleInteractions.length

      // Gate progress by session depth so early interactions can't spike the meter
      const totalInteractions = scaleInteractions.length + yesNoInteractions.length
      const progressionFactor = Math.min(totalInteractions / 5, 1.0)
      newEmotionalScore = Math.round(rawAvg * progressionFactor * 100) / 100
    }

    if (yesNoInteractions.length > 0) {
      const yesCount = yesNoInteractions.filter(i => i.response_value === 1).length
      newOpennessScore = Math.round((yesCount / yesNoInteractions.length) * 100) / 100
    }
  }

  // Update session scores
  const { data: sessionData } = await supabase
    .from('sessions')
    .update({
      emotional_alignment_score: newEmotionalScore,
      openness_score: newOpennessScore,
      // Also update avg_rating for backwards compat with legacy UI
      avg_rating: newEmotionalScore,
    })
    .eq('id', sessionId)
    .eq('created_by', user.id)
    .select('summary, topic, user_perspective, opposing_perspective, title, category, business_mode')
    .single()

  // Check summary trigger
  let finalSummary: SessionSummary | null = null
  if (sessionData && !sessionData.summary && newEmotionalScore != null && newEmotionalScore >= 3.5) {
    finalSummary = await generateAndStoreSummary(
      supabase,
      sessionId,
      sessionData,
      newEmotionalScore,
      newOpennessScore
    )
  }

  revalidatePath(`/sessions/${sessionId}`)

  return {
    success: true,
    data: {
      emotionalAlignmentScore: newEmotionalScore,
      opennessScore: newOpennessScore,
      summary: finalSummary,
    },
  }
}

// ─── submitRating (legacy backwards compat) ──────────────────────────────────

export async function submitRating(
  sessionId: string,
  messageId: string,
  rating: number
): Promise<ActionResult<{ avgRating: number; summary?: SessionSummary | null }>> {
  // Delegate to submitInteraction treating it as a scale response
  const result = await submitInteraction(sessionId, messageId, 'scale', rating)
  if (!result.success) return result

  return {
    success: true,
    data: {
      avgRating: result.data.emotionalAlignmentScore ?? 0,
      summary: result.data.summary,
    },
  }
}

// ─── generateAndStoreSummary (shared helper) ─────────────────────────────────

async function generateAndStoreSummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  sessionId: string,
  session: {
    topic?: string | null
    title?: string
    user_perspective?: string | null
    opposing_perspective?: string | null
    category?: string | null
    business_mode?: boolean
  },
  emotionalScore: number | null = null,
  opennessScore: number | null = null
): Promise<SessionSummary | null> {
  try {
    const { data: msgs } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    const conversation = (msgs ?? [])
      .map((m: { role: string; content: string }) =>
        `${m.role === 'user' ? 'User' : 'Mediator'}: ${m.content.slice(0, 200)}`
      )
      .join('\n')

    const summary = await runSummaryChain({
      topic: session.topic ?? session.title ?? 'the disagreement',
      user_perspective: session.user_perspective ?? 'Not provided',
      opposing_perspective: session.opposing_perspective ?? 'Not provided',
      conversation,
      emotional_score: emotionalScore != null ? String(emotionalScore.toFixed(2)) : 'N/A',
      openness_score: opennessScore != null ? String(opennessScore.toFixed(2)) : 'N/A',
    })

    if (!summary) return null

    await supabase
      .from('sessions')
      .update({ summary, status: 'resolved' })
      .eq('id', sessionId)

    return summary
  } catch (err) {
    console.error('generateAndStoreSummary failed:', err)
    return null
  }
}

// ─── Read helpers ─────────────────────────────────────────────────────────────

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
): Promise<ActionResult<{
  session: Session
  messages: Message[]
  ratings: MessageRating[]
  initialInteractions: MessageInteraction[]
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const [sessionResult, messagesResult, ratingsResult, interactionsResult] = await Promise.all([
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
    supabase
      .from('message_ratings')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('message_interactions')
      .select('*')
      .eq('user_id', user.id),
  ])

  if (sessionResult.error || !sessionResult.data) {
    return { success: false, error: 'Session not found' }
  }

  // Treat soft-deleted sessions as not found
  if (sessionResult.data.deleted_at) {
    return { success: false, error: 'Session not found' }
  }

  return {
    success: true,
    data: {
      session: sessionResult.data as Session,
      messages: (messagesResult.data ?? []) as Message[],
      ratings: (ratingsResult.data ?? []) as MessageRating[],
      initialInteractions: (interactionsResult.data ?? []) as MessageInteraction[],
    },
  }
}

// ─── deleteSession ────────────────────────────────────────────────────────────

export async function deleteSession(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('sessions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('created_by', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/sessions')
  revalidatePath('/dashboard')
  revalidatePath('/business')
  return { success: true, data: undefined }
}

// ─── deleteAllSessions ────────────────────────────────────────────────────────

export async function deleteAllSessions(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('sessions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('created_by', user.id)
    .is('deleted_at', null)

  if (error) return { success: false, error: error.message }

  revalidatePath('/sessions')
  revalidatePath('/dashboard')
  revalidatePath('/business')
  return { success: true, data: undefined }
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
