import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export const geminiClient = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  maxOutputTokens: 1024,
})
