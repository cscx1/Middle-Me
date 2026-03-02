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
  conversation_history: string // prior exchanges so the AI doesn't repeat itself
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

/** Extract double-quoted string value for a key from JSON-like text (handles truncated/malformed JSON) */
function extractJsonString(text: string, key: string): string | null {
  const keyPattern = new RegExp(
    `"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`,
    's'
  )
  const match = text.match(keyPattern)
  return match ? match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : null
}

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
    // Response may be truncated or malformed JSON — never show raw JSON to the user
    if (text.startsWith('{')) {
      const aiText = extractJsonString(text, 'ai_text')
      const question = extractJsonString(text, 'question')
      const stepTypeMatch = text.match(/"step_type"\s*:\s*"([^"]+)"/)
      const stepType = (stepTypeMatch?.[1] ?? 'deescalation') as MessageMeta['step_type']

      if (aiText) {
        return {
          ai_text: aiText,
          meta: {
            step_type: stepType,
            interaction:
              question != null
                ? { type: 'scale' as const, question }
                : undefined,
            ready_for_summary: false,
          },
        }
      }
    }
    // Truly unparseable: show a safe fallback instead of raw payload
    return {
      ai_text: "I hear how much this situation is affecting you. Take your time — when you're ready, share a bit more about what matters most to you right now, or rate how you're feeling on the scale below.",
      meta: {
        step_type: 'deescalation',
        interaction: {
          type: 'scale',
          question: 'On a scale of 1 to 5, how emotionally charged does this feel for you right now?',
        },
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
