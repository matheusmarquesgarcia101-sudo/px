import { useState } from 'react';
import type { StructuredTask } from '../tasks/useTasks';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  taskCount?: number;
  isError?: boolean;
};

type UseChatProps = {
  addStructured: (tasks: StructuredTask | StructuredTask[]) => void;
};

export function useChat({ addStructured }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const next = [...messages, userMessage];
    setMessages(next);
    setIsLoading(true);
    setError(null);

    try {
      const history = next
        .filter(m => !m.isError)
        .slice(0, -1)
        .map(({ role, content }) => ({ role, content }));
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data = await res.json() as { reply: string; tasks: StructuredTask[] };

      addStructured(data.tasks);

      setMessages([
        ...next,
        { role: 'assistant', content: data.reply, taskCount: data.tasks.length },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(msg);
      setMessages([...next, { role: 'assistant', content: `Erro: ${msg}`, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, send };
}
