import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { anthropicClient } from '../client'
import { mediationPrompt } from '../prompts/mediation'

export interface MediationInput {
  message: string
  articles: string // formatted RAG context, or empty string
}

export const mediationChain = RunnableSequence.from([
  mediationPrompt,
  anthropicClient,
  new StringOutputParser(),
])
