# Chat IA — Criação Inteligente de Tarefas (TDLPA-3)

## Visão geral

Painel de chat flutuante (floating panel) que permite ao usuário descrever o que precisa fazer em linguagem natural. Claude interpreta, cria e prioriza as tarefas automaticamente na lista — zero clique adicional.

---

## Fluxo de dados

```
Usuário digita → useChat envia { message, history } ao backend
  → controller monta messages[] + system prompt
  → Claude retorna JSON { reply, tasks[] }
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
    priority?: 'alta' | 'media' | 'baixa',  // sem acento — frontend mapeia para 'média'
    timeOfDay?: 'manha' | 'tarde' | 'noite', // sem acento — frontend mapeia para 'manhã'
    duration?: string   // ex: "30m", "2h" — frontend converte para durationMinutes
  }[]
}
```

**Regras:**
- Claude responde **sempre** em JSON nesse formato, mesmo quando `tasks: []`
- O histórico completo da sessão é enviado a cada request para manter contexto
- `reply` é a mensagem conversacional exibida ao usuário

### Arquivos alterados

**`backend/src/services/claude.ts`**
- Assinatura: `sendMessage(message: string, history: Message[]): Promise<{ reply: string, tasks: Task[] }>`
- Monta `messages[]` com history + nova mensagem do usuário
- System prompt instrui Claude a retornar JSON estruturado
- Parseia a resposta de Claude como JSON

**`backend/src/controllers/chat.ts`**
- Lê `message` e `history` do body
- Repassa ao service
- Retorna `{ reply, tasks }` diretamente

### System prompt

```
Você é um assistente de produtividade. Dado o que o usuário precisa fazer,
retorne SEMPRE um JSON válido neste formato exato:
{
  "reply": "<mensagem conversacional breve>",
  "tasks": [
    {
      "text": "<descrição da tarefa>",
      "priority": "alta" | "media" | "baixa",
      "timeOfDay": "manha" | "tarde" | "noite",
      "duration": "<ex: 30m, 2h>"
    }
  ]
}
Priorize com inteligência: reuniões e prazos = alta, estudos = média, recados = baixa.
Período: alta priority ou duração >= 2h = manhã; média ou 30m–2h = tarde; baixa ou < 30m = noite.
Não inclua texto fora do JSON.
```

---

## Frontend

### Novos arquivos

**`src/features/chat/useChat.ts`**
- Estado: `messages: ChatMessage[]`, `isLoading: boolean`, `error: string | null`
- `send(text: string)`: adiciona mensagem do usuário, chama `POST /chat` com histórico, recebe resposta, chama `addStructured()` para cada task, adiciona resposta do assistente com count de tarefas criadas
- Histórico enviado ao backend: apenas `{ role, content }` — sem metadados visuais

**`src/features/chat/Chat.tsx`**
- Floating button fixo no bottom-right (`fixed bottom-6 right-6`)
- Abre/fecha painel (toggle)
- Painel: `w-80 h-96`, área de mensagens com scroll, input no rodapé
- Balões: usuário alinhado à direita (slate), assistente à esquerda (white/border)
- Quando tasks criadas: texto `✓ N tarefas adicionadas` abaixo do reply
- Loading: input desabilitado, balão com "..."
- Erro: mensagem inline no chat

### Arquivo alterado

**`src/features/tasks/useTasks.ts`**
- Nova função: `addStructured(task: { text: string, priority?: 'alta'|'media'|'baixa', timeOfDay?: 'manha'|'tarde'|'noite', duration?: string })`
- Mapeia `priority: 'media'` → `'média'` e `timeOfDay: 'manha'` → `'manhã'` (tipos internos com acento)
- Parseia `duration` string para `durationMinutes` via mesma lógica de `parseInput` (default 30m)
- Bypassa as heurísticas automáticas — valores de Claude têm precedência

**`src/App.tsx`**
- Importa e renderiza `<Chat addStructured={addStructured} />`

---

## Critérios de pronto

- [ ] Usuário descreve tarefa(s) em linguagem natural
- [ ] Tarefas aparecem na lista automaticamente com prioridade e período corretos
- [ ] Claude mantém contexto da conversa dentro da sessão
- [ ] Loading visível enquanto aguarda resposta
- [ ] Erro básico exibido no chat (sem crash)
- [ ] Fluxo ponta a ponta: front → backend → Claude → front → lista
