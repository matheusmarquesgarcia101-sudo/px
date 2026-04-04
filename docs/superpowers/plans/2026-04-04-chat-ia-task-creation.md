# Chat IA — Criação Inteligente de Tarefas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Floating chat panel que permite ao usuário descrever tarefas em linguagem natural e ter Claude criá-las e priorizá-las automaticamente na lista.

**Architecture:** Frontend chama `POST /chat` (via proxy Vite) com a mensagem e histórico da sessão. Backend manda para Claude com system prompt que força retorno JSON `{ reply, tasks[] }`. Frontend parseia, chama `addStructured()` para cada task, e exibe confirmação no chat.

**Tech Stack:** React + TypeScript + Vite + Tailwind CSS (frontend), Express + Anthropic SDK (backend)

> **Nota:** Projeto não tem test framework configurado. Os passos de verificação são manuais (browser + terminal).

---

### Task 1: Backend — atualizar `claude.ts`

**Files:**
- Modify: `backend/src/services/claude.ts`

- [ ] **Step 1: Substituir o conteúdo de `backend/src/services/claude.ts`**

```ts
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
  return text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
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

  const parsed = JSON.parse(stripMarkdown(block.text))
  return { reply: parsed.reply, tasks: parsed.tasks ?? [] }
}
```

- [ ] **Step 2: Verificar que o TypeScript compila**

```bash
cd backend && npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px
git add backend/src/services/claude.ts
git commit -m "feat(backend): sendMessage com history, system prompt JSON e strip markdown"
```

---

### Task 2: Backend — atualizar `chat.ts` controller

**Files:**
- Modify: `backend/src/controllers/chat.ts`

- [ ] **Step 1: Substituir o conteúdo de `backend/src/controllers/chat.ts`**

```ts
import { Request, Response } from 'express'
import { sendMessage } from '../services/claude'

export async function chat(req: Request, res: Response): Promise<void> {
  const { message, history = [] } = req.body as {
    message?: string
    history?: { role: 'user' | 'assistant'; content: string }[]
  }

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Campo "message" obrigatório' })
    return
  }

  const result = await sendMessage(message, history)
  res.json(result)
}
```

- [ ] **Step 2: Verificar que o TypeScript compila**

```bash
cd backend && npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Testar manualmente o endpoint**

Inicie o backend:
```bash
cd backend && npm run dev
```

Em outro terminal:
```bash
curl -s -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"preciso estudar para a prova de amanhã e ligar para o dentista","history":[]}' | jq .
```

Expected: JSON com `reply` (string) e `tasks` (array com 2 itens — um `media/tarde` para estudar, um `baixa/noite` para ligar).

- [ ] **Step 4: Commit**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px
git add backend/src/controllers/chat.ts
git commit -m "feat(backend): chat controller aceita history e retorna { reply, tasks }"
```

---

### Task 3: Frontend — configurar proxy Vite

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Atualizar `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/chat': 'http://localhost:3001',
    },
  },
})
```

- [ ] **Step 2: Commit**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px
git add vite.config.ts
git commit -m "feat(frontend): proxy vite /chat → backend :3001"
```

---

### Task 4: Frontend — `addStructured` em `useTasks.ts`

**Files:**
- Modify: `src/features/tasks/useTasks.ts`

- [ ] **Step 1: Adicionar a função `addStructured` e exportá-la**

Substituir o conteúdo de `src/features/tasks/useTasks.ts`:

```ts
import { useState } from 'react';
import type { Task, Priority, TimeOfDay, SortKey } from '../../types/task';
import { loadTasks, saveTasks } from '../../lib/storage/tasks';
import { parseInput } from '../../lib/parser/parseInput';
import { autoPriority } from '../../lib/heuristics/priority';
import { autoTimeOfDay } from '../../lib/heuristics/timeOfDay';

export type StructuredTask = {
  text: string;
  priority?: 'alta' | 'media' | 'baixa';
  timeOfDay?: 'manha' | 'tarde' | 'noite';
  durationMinutes?: number;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [sort, setSort] = useState<SortKey>('createdAt');

  const persist = (next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  };

  const add = (raw: string) => {
    const { text, durationMinutes } = parseInput(raw);
    if (!text) return;
    const priority = autoPriority(text);
    const timeOfDay = autoTimeOfDay(priority, durationMinutes);
    const task: Task = {
      id: crypto.randomUUID(),
      text,
      priority,
      timeOfDay,
      durationMinutes,
      createdAt: new Date().toISOString(),
    };
    persist([task, ...tasks]);
  };

  const addStructured = (input: StructuredTask) => {
    const priorityMap: Record<string, Priority> = { media: 'média' };
    const timeOfDayMap: Record<string, TimeOfDay> = { manha: 'manhã' };

    const priority: Priority =
      input.priority != null
        ? (priorityMap[input.priority] ?? (input.priority as Priority))
        : autoPriority(input.text);

    const durationMinutes = input.durationMinutes ?? 30;

    const timeOfDay: TimeOfDay =
      input.timeOfDay != null
        ? (timeOfDayMap[input.timeOfDay] ?? (input.timeOfDay as TimeOfDay))
        : autoTimeOfDay(priority, durationMinutes);

    const task: Task = {
      id: crypto.randomUUID(),
      text: input.text,
      priority,
      timeOfDay,
      durationMinutes,
      createdAt: new Date().toISOString(),
    };
    persist([task, ...tasks]);
  };

  const complete = (id: string) =>
    persist(tasks.map(t => t.id === id ? { ...t, completedAt: new Date().toISOString() } : t));

  const setPriority = (id: string, priority: Priority) =>
    persist(tasks.map(t => t.id === id ? { ...t, priority } : t));

  const setTimeOfDay = (id: string, timeOfDay: TimeOfDay) =>
    persist(tasks.map(t => t.id === id ? { ...t, timeOfDay } : t));

  const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, média: 1, baixa: 2 };
  const TIME_ORDER: Record<TimeOfDay, number> = { manhã: 0, tarde: 1, noite: 2 };

  const sorted = (list: Task[]) =>
    [...list].sort((a, b) => {
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'timeOfDay') return TIME_ORDER[a.timeOfDay] - TIME_ORDER[b.timeOfDay];
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const active = sorted(tasks.filter(t => !t.completedAt));
  const archived = tasks.filter(t => t.completedAt);

  return { active, archived, add, addStructured, complete, setPriority, setTimeOfDay, sort, setSort };
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px && npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/tasks/useTasks.ts
git commit -m "feat(tasks): addStructured — cria task com campos resolvidos por Claude"
```

---

### Task 5: Frontend — criar `useChat.ts`

**Files:**
- Create: `src/features/chat/useChat.ts`

- [ ] **Step 1: Criar `src/features/chat/useChat.ts`**

```ts
import { useState } from 'react';
import type { StructuredTask } from '../tasks/useTasks';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  taskCount?: number;
};

type UseChatProps = {
  addStructured: (task: StructuredTask) => void;
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
      const history = next.slice(0, -1).map(({ role, content }) => ({ role, content }));
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data = await res.json() as { reply: string; tasks: StructuredTask[] };

      data.tasks.forEach(task => addStructured(task));

      setMessages([
        ...next,
        { role: 'assistant', content: data.reply, taskCount: data.tasks.length },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(msg);
      setMessages([...next, { role: 'assistant', content: `Erro: ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, send };
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px && npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/chat/useChat.ts
git commit -m "feat(chat): useChat hook — envia mensagem, recebe tasks, chama addStructured"
```

---

### Task 6: Frontend — criar `Chat.tsx`

**Files:**
- Create: `src/features/chat/Chat.tsx`

- [ ] **Step 1: Criar `src/features/chat/Chat.tsx`**

```tsx
import { useRef, useEffect, useState } from 'react';
import type { StructuredTask } from '../tasks/useTasks';
import { useChat } from './useChat';

type Props = {
  addStructured: (task: StructuredTask) => void;
};

export function Chat({ addStructured }: Props) {
  const { messages, isLoading, send } = useChat({ addStructured });
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      send(input);
      setInput('');
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
        aria-label="Abrir chat IA"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z" />
        </svg>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 h-96 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Assistente px</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400 text-center mt-4">
                Descreva o que você precisa fazer hoje.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.role === 'assistant' && msg.taskCount != null && msg.taskCount > 0 && (
                    <p className="text-xs text-green-600 mt-1">✓ {msg.taskCount} {msg.taskCount === 1 ? 'tarefa adicionada' : 'tarefas adicionadas'}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400">
                  ...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="O que você precisa fazer?"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400 placeholder:text-slate-400 disabled:opacity-50"
            />
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px && npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/features/chat/Chat.tsx
git commit -m "feat(chat): Chat.tsx — floating panel com balões, loading e confirmação de tasks"
```

---

### Task 7: Frontend — integrar Chat em `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Substituir o conteúdo de `src/App.tsx`**

```tsx
import { useTasks } from './features/tasks/useTasks';
import { TaskInput } from './features/tasks/TaskInput';
import { TaskList } from './features/tasks/TaskList';
import { TaskArchive } from './features/tasks/TaskArchive';
import { Chat } from './features/chat/Chat';

export default function App() {
  const { active, archived, add, addStructured, complete, setPriority, setTimeOfDay, sort, setSort } = useTasks();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">px</h1>
        <TaskInput onAdd={add} />
        <div className="mt-6">
          <TaskList
            tasks={active}
            sort={sort}
            onSort={setSort}
            onComplete={complete}
            onPriority={setPriority}
            onTimeOfDay={setTimeOfDay}
          />
        </div>
        <TaskArchive tasks={archived} />
      </div>
      <Chat addStructured={addStructured} />
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px && npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): integra Chat com addStructured"
```

---

### Task 8: Verificação E2E manual

- [ ] **Step 1: Iniciar backend**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px/backend && npm run dev
```

Expected: `Server running on http://localhost:3001`

- [ ] **Step 2: Iniciar frontend (novo terminal)**

```bash
cd /Users/matheusmarquesgarcia/Projetos/MATHEUS/px && npm run dev
```

Expected: `Local: http://localhost:5173`

- [ ] **Step 3: Testar fluxo ponta a ponta**

1. Abrir `http://localhost:5173`
2. Clicar no botão flutuante (bottom-right)
3. Digitar: `"preciso estudar para a prova de amanhã, reunião com cliente às 14h e comprar café"`
4. Pressionar Enter

Expected:
- Balão do assistente aparece com reply em português
- `✓ 3 tarefas adicionadas` (ou similar) abaixo do reply
- Lista de tarefas mostra as 3 tasks com prioridades: `alta` (reunião), `média` (estudar), `baixa` (comprar)
- Períodos: manhã (reunião), tarde (estudar), noite (comprar)

- [ ] **Step 4: Testar memória de sessão**

No mesmo chat, digitar: `"adiciona mais uma: revisar o contrato"`

Expected: Claude lembra o contexto, adiciona a task com `media/tarde`.

- [ ] **Step 5: Testar loading e erro**

Parar o backend (`Ctrl+C`) e enviar uma mensagem no chat.

Expected: mensagem de erro aparece no chat, app não crasha.
