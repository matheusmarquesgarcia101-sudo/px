import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env'

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

type HistoryMessage = { role: 'user' | 'assistant'; content: string }

export type ClaudeTask = {
  text: string
  priority?: 'alta' | 'media' | 'baixa'
  timeOfDay?: 'manha' | 'tarde' | 'noite'
  durationMinutes?: number
}

const SYSTEM_PROMPT = `Você é um assistente de produtividade. Dado o que o usuário precisa fazer, retorne SEMPRE um JSON válido neste formato exato, sem texto fora do JSON:
{
  "reply": "<mensagem conversacional breve em português>",
  "tasks": [
    {
      "text": "<descrição objetiva da tarefa>",
      "priority": "alta" | "media" | "baixa",
      "timeOfDay": "manha" | "tarde" | "noite",
      "durationMinutes": <número inteiro, ex: 30, 60, 120>
    }
  ]
}
Regras de prioridade: reunião, prazo, urgente, deadline, médico = alta; estudar, revisar, planejar = media; comprar, ligar, enviar = baixa.
Regras de período: alta ou durationMinutes >= 120 = manha; media ou 30–120 min = tarde; baixa ou < 30 min = noite.
Não inclua texto, markdown ou explicações fora do JSON.`

function stripMarkdown(text: string): string {
  return text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
}

export async function sendMessage(
  message: string,
  history: HistoryMessage[]
): Promise<{ reply: string; tasks: ClaudeTask[] }> {
  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: 'user', content: message },
  ]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages,
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Resposta inesperada da Claude')

  let parsed: { reply?: string; tasks?: ClaudeTask[] }
  try {
    parsed = JSON.parse(stripMarkdown(block.text))
  } catch {
    parsed = { reply: block.text, tasks: [] }
  }
  return { reply: parsed.reply ?? '', tasks: parsed.tasks ?? [] }
}
