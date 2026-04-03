# px — Local Task Organizer

Fast local to-do app. React + TypeScript + Vite + Tailwind CSS + localStorage.

## Product rules (never break these)

- Input field always focused and ready
- Task created on `Enter` — zero friction
- No login, no backend, no remote DB, no AI/NLP in MVP
- Completed tasks go to archive, never hard-deleted
- Colors must carry semantic meaning — never decorative

## Auto-assignment heuristics

When the user doesn't manually pick priority or time-of-day, apply these rules:

**Priority auto-assign** (keywords in task text):
- Alta: reunião, prazo, urgente, deadline, entregar, apresentar, médico, consulta
- Média: estudar, revisar, pesquisar, planejar, rascunho
- Baixa: comprar, ligar, enviar, anything short/vague

**Time-of-day auto-assign**:
- Manhã: alta priority OR duration ≥ 2h (complex/heavy)
- Tarde: média priority OR duration 30m–2h
- Noite: baixa priority OR duration < 30m (light)

## Duration parsing

`#5m` → 5min | `#2h` → 2h | `#3d` → 3 days | `#1w` → 1 week
If missing → default 30m

## Stack constraints

- Use Tailwind CSS classes only — no inline styles
- State lives in `useTasks` hook — components are dumb
- Persistence via `src/lib/storage/tasks.ts` (localStorage)
- No external state management (no Redux, no Zustand) — React state is enough for MVP

## File map

See `FILES.md` for the full file map.

## Skills to use

See `SKILLS.md` for when to invoke each Claude Code skill.
