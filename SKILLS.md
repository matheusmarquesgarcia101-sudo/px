# Claude Code Skills — px (Local Task Organizer)

Reference for which skills to invoke and when during development.

---

## When to use each skill

| Situation | Skill to invoke |
|-----------|----------------|
| Adding a new feature or screen | `feature-dev:feature-dev` |
| Building or redesigning a UI component | `frontend-design:frontend-design` |
| Something is broken / unexpected behavior | `superpowers:systematic-debugging` |
| About to build something non-trivial | `superpowers:brainstorming` |
| After implementing — clean up code | `simplify` |
| Completed a major step — verify quality | `superpowers:requesting-code-review` |
| Received review feedback | `superpowers:receiving-code-review` |
| Multi-step plan to execute | `superpowers:executing-plans` |
| Writing a plan before coding | `superpowers:writing-plans` |

---

## Active MCP servers

| Server | Use for |
|--------|---------|
| `context7` | Fetch live docs for React, Tailwind, Vite, TypeScript |

### How to use context7
When uncertain about an API, resolve library ID first:
```
mcp__plugin_context7_context7__resolve-library-id → then → mcp__plugin_context7_context7__query-docs
```

---

## Stack reference

- **React 19** + **TypeScript** — component logic
- **Vite** — dev server & bundler
- **Tailwind CSS v4** — styling
- **localStorage** — persistence (no backend)
- **uv** — Python tooling if scripts are needed (`uv run`, `uv add`)

---

## Key project conventions

- No login, no remote DB, no AI/NLP in MVP
- Auto-assign priority and time-of-day when user doesn't choose (heuristic, not ML)
- Duration parsed from `#5m`, `#2h`, `#3d`, `#1w` — default `30m` if missing
- Completed tasks move to a separate "archive" view, not deleted
- Colors carry meaning — do not use color decoratively
