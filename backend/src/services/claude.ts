import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env'

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export async function sendMessage(message: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Resposta inesperada da Claude')
  return block.text
}
