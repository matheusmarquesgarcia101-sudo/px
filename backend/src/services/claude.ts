import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function chat(message: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
  });

  const block = response.content.find(b => b.type === 'text');
  return block?.type === 'text' ? block.text : '';
}
