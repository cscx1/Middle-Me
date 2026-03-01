import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { geminiClient } from '../client'
import { mediationPrompt, businessPrompt, summaryPrompt } from '../prompts/mediation'
import type { MessageMeta, SessionSummary, Interaction } from '@/types'

export interface MediationInput {
  message: string
  articles: string
  user_perspective: string
  opposing_perspective: string
  topic: string
  category?: string
  step_index: number
  emotional_score: string  // "N/A" or numeric string
  openness_score: string   // "N/A" or numeric string
  suggested_step: string   // hint from deterministic helper
}

export interface StepOutput {
  ai_text: string
  meta: MessageMeta
}

export interface SummaryInput {
  topic: string
  user_perspective: string
  opposing_perspective: string
  conversation: string
  emotional_score: string
  openness_score: string
}

// ─── Deterministic step progression hint ─────────────────────────────────────

export function computeNextStepHint(
  emotionalScore: number | null,
  opennessScore: number | null,
  stepIndex: number
): string {
  if (stepIndex >= 4) return 'reflection'
  if (emotionalScore == null || emotionalScore < 2.5) return 'deescalation'
  if (opennessScore != null && opennessScore > 0.6) return 'values_probe'
  if (emotionalScore >= 3.0) return 'values_probe'
  return 'belief_probe'
}

// ─── Parse AI step response ───────────────────────────────────────────────────

function parseStepResponse(raw: string): StepOutput {
  let text = raw.trim()

  // Strip markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  try {
    const parsed = JSON.parse(text)

    // Resolve interaction — new format has `interaction` object
    let interaction: Interaction | undefined
    if (parsed.interaction && parsed.interaction.type && parsed.interaction.question) {
      interaction = {
        type: parsed.interaction.type as 'scale' | 'yes_no',
        question: String(parsed.interaction.question),
      }
    } else if (parsed.follow_up_question) {
      // Legacy fallback: convert old follow_up_question to scale interaction
      interaction = {
        type: 'scale',
        question: String(parsed.follow_up_question),
      }
    }

    // Resolve content — new format uses `ai_text`, old used `content`
    const aiText = String(parsed.ai_text ?? parsed.content ?? raw)

    return {
      ai_text: aiText,
      meta: {
        step_type: parsed.step_type ?? 'deescalation',
        interaction,
        ready_for_summary: Boolean(parsed.ready_for_summary),
      },
    }
  } catch {
    // Fallback: treat entire response as plain text, no interaction
    return {
      ai_text: raw,
      meta: {
        step_type: 'deescalation',
        ready_for_summary: false,
      },
    }
  }
}

function parseSummaryResponse(raw: string): SessionSummary | null {
  let text = raw.trim()

  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  try {
    const parsed = JSON.parse(text)
    return {
      middle_ground: String(parsed.middle_ground ?? ''),
      bridge_statements: Array.isArray(parsed.bridge_statements)
        ? parsed.bridge_statements.map(String)
        : [],
      advice: String(parsed.advice ?? ''),
    }
  } catch {
    return null
  }
}

// ─── Chains ───────────────────────────────────────────────────────────────────

const rawMediationChain = RunnableSequence.from([
  mediationPrompt,
  geminiClient,
  new StringOutputParser(),
])

const rawBusinessChain = RunnableSequence.from([
  businessPrompt,
  geminiClient,
  new StringOutputParser(),
])

const rawSummaryChain = RunnableSequence.from([
  summaryPrompt,
  geminiClient,
  new StringOutputParser(),
])

export async function runMediationStep(
  input: MediationInput,
  businessMode = false
): Promise<StepOutput> {
  const chain = businessMode ? rawBusinessChain : rawMediationChain
  const raw = await chain.invoke(input)
  return parseStepResponse(raw)
}

export async function runSummaryChain(input: SummaryInput): Promise<SessionSummary | null> {
  const raw = await rawSummaryChain.invoke(input)
  return parseSummaryResponse(raw)
}

// Backwards compat exports
export { rawMediationChain as mediationChain, rawBusinessChain as businessChain }
