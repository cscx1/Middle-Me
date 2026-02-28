import { ChatAnthropic } from '@langchain/anthropic'

export const anthropicClient = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 1024,
})
