import { Request, Response } from 'express'
import { sendMessage } from '../services/claude'

export async function chat(req: Request, res: Response): Promise<void> {
  const { message } = req.body as { message?: string }

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Campo "message" obrigatório' })
    return
  }

  const result = await sendMessage(message, [])
  res.json({ reply: result.reply, tasks: result.tasks })
}
