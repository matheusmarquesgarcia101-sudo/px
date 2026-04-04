# Chat IA — Criação Inteligente de Tarefas (TDLPA-3)

## Visão geral

Painel de chat flutuante (floating panel) que permite ao usuário descrever o que precisa fazer em linguagem natural. Claude interpreta, cria e prioriza as tarefas automaticamente na lista — zero clique adicional.

---

## Fluxo de dados

```
Usuário digita → useChat envia { message, history } ao backend (via proxy /chat)
  → controller monta messages[] + system prompt
  → Claude retorna JSON { reply, tasks[] }
  → backend faz strip de markdown e parseia JSON
  → frontend renderiza reply
  → chama addStructured(task) para cada task silenciosamente
  → exibe "✓ N tarefas adicionadas" no balão do assistente
```

---

## Backend

### `POST /chat`

**Request body:**
```ts
{
  message: string,
  history: { role: 'user' | 'assistant', content: string }[]
}
```

**Response:**
```ts
{
  reply: string,
  tasks: {
    text: string,
    priority?: 'alta' | 'media' | 'baixa',   // sem acento — frontend mapeia para 'média'
    timeOfDay?: 'manha' | 'tarde' | 'noite',  // sem acento — frontend mapeia para 'manhã'
    durationMinutes?: number                   // número direto, ex: 30, 120 — default 30
  }[]
}
```

**Regras:**
- Claude responde **sempre** em JSON nesse formato, mesmo quando `tasks: []`
- O histórico completo da sessão é enviado a cada request para manter contexto
- `reply` é a mensagem conversacional exibida ao usuário

### Arquivos alterados

**`backend/src/services/claude.ts`**
- Assinatura: `sendMessage(message: string, history: Message[]): Promise<{ reply: string, tasks: ClaudeTask[] }>`
- Monta `messages[]` com history + nova mensagem do usuário
- Passa system prompt via campo `system` da API Anthropic
- `max_tokens: 2048` (de 1024 para comportar JSON com múltiplas tasks)
- Após receber resposta, faz strip de markdown (`` ```json ... ``` ``) antes de `JSON.parse`
- Retorna `{ reply, tasks }` parseados

**`backend/src/controllers/chat.ts`**
- Lê `message` e `history` do body (history default `[]` se ausente)
- Repassa ao service
- Retorna `{ reply, tasks }` diretamente

### System prompt

```
Você é um assistente de produtividade. Dado o que o usuário precisa fazer,
retorne SEMPRE um JSON válido neste formato exato, sem texto fora do JSON:
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
Não inclua texto, markdown ou explicações fora do JSON.
```

---

## Frontend

### Vite proxy

Adicionar ao `vite.config.ts` para evitar CORS e hardcode de porta:
```ts
server: {
  proxy: {
    '/chat': 'http://localhost:3001',
  }
}
```
Fetch no frontend usa `/chat` (relativo), sem hardcode de host.

### Novos arquivos

**`src/features/chat/useChat.ts`**

Tipo interno:
```ts
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  taskCount?: number; // só no assistente, quando tasks foram criadas
}
```

- Estado: `messages: ChatMessage[]`, `isLoading: boolean`, `error: string | null`
- `send(text: string)`:
  1. Adiciona `{ role: 'user', content: text }` ao estado local
  2. Monta `history` com as mensagens anteriores (apenas `{ role, content }`)
  3. `POST /chat` com `{ message: text, history }`
  4. Para cada task recebida, chama `addStructured(task)`
  5. Adiciona `{ role: 'assistant', content: reply, taskCount: tasks.length }` ao estado
- Em caso de erro: adiciona mensagem de erro no chat, seta `error`

**`src/features/chat/Chat.tsx`**
- Floating button fixo (`fixed bottom-6 right-6 z-50`) — ícone de chat
- Toggle abre/fecha painel (`fixed bottom-20 right-6 z-50 w-80 h-96`)
- Painel: área de mensagens com `overflow-y-auto` + input fixo no rodapé
- Balões: usuário alinhado à direita (bg-slate-100), assistente à esquerda (bg-white border)
- Quando `taskCount > 0`: linha `✓ N tarefas adicionadas` abaixo do reply (text-green-600 text-xs)
- Loading: input `disabled` + balão do assistente com "..."
- Erro: texto vermelho inline no chat
- Auto-scroll para última mensagem via `useEffect` + `ref` no fim da lista

### Arquivo alterado

**`src/features/tasks/useTasks.ts`**

Nova função adicionada e exportada no return:
```ts
const addStructured = (task: {
  text: string,
  priority?: 'alta' | 'media' | 'baixa',
  timeOfDay?: 'manha' | 'tarde' | 'noite',
  durationMinutes?: number
}) => {
  const priority: Priority = task.priority === 'media' ? 'média' : (task.priority ?? autoPriority(task.text));
  const timeOfDay: TimeOfDay = task.timeOfDay === 'manha' ? 'manhã' : (task.timeOfDay ?? autoTimeOfDay(priority, task.durationMinutes ?? 30));
  const t: Task = {
    id: crypto.randomUUID(),
    text: task.text,
    priority,
    timeOfDay,
    durationMinutes: task.durationMinutes ?? 30,
    createdAt: new Date().toISOString(),
  };
  persist([t, ...tasks]);
};
```

Mapeamentos:
- `'media'` → `'média'`, `'manha'` → `'manhã'`
- Se Claude omitir `priority` ou `timeOfDay`, fallback para heurísticas existentes

**`src/App.tsx`**
- Desestrutura `addStructured` de `useTasks()`
- Renderiza `<Chat addStructured={addStructured} />` dentro do container principal

---

## Critérios de pronto

- [ ] Usuário descreve tarefa(s) em linguagem natural
- [ ] Tarefas aparecem na lista automaticamente com prioridade e período corretos
- [ ] Claude mantém contexto da conversa dentro da sessão
- [ ] Loading visível enquanto aguarda resposta
- [ ] Erro básico exibido no chat (sem crash)
- [ ] Fluxo ponta a ponta: front → backend → Claude → front → lista
- [ ] Sem CORS errors (proxy Vite configurado)
- [ ] JSON com markdown strips tratado corretamente no backend
