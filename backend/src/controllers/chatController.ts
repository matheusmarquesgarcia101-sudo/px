import { Request, Response } from 'express';
import { chat } from '../services/claude';

export async function handleChat(req: Request, res: Response): Promise<void> {
  const { message } = req.body as { message?: string };

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const reply = await chat(message.trim());
  res.json({ reply });
}
