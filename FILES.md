# Key Files — px (Local Task Organizer)

Updated as the project grows. Use this as a map when navigating or asking Claude to modify something.

---

## Project root

| File | Purpose |
|------|---------|
| `README` | Full product spec and scope |
| `Claude.md` | Project-level Claude instructions |
| `SKILLS.md` | Skills/MCPs reference for this project |
| `FILES.md` | This file — key files map |
| `.gitignore` | Excludes secrets, build artifacts, node_modules |
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite bundler config |
| `tsconfig.json` | TypeScript config |
| `index.html` | App entry point |

---

## src/

| File | Purpose |
|------|---------|
| `src/main.tsx` | React app mount |
| `src/App.tsx` | Root component — layout and routing |

### src/types/

| File | Purpose |
|------|---------|
| `src/types/task.ts` | `Task` type definition |

### src/lib/parser/

| File | Purpose |
|------|---------|
| `src/lib/parser/parseInput.ts` | Parses raw input string → task fields (duration, text) |

### src/lib/storage/

| File | Purpose |
|------|---------|
| `src/lib/storage/tasks.ts` | Read/write tasks to localStorage |

### src/lib/heuristics/

| File | Purpose |
|------|---------|
| `src/lib/heuristics/priority.ts` | Auto-assigns priority from task text |
| `src/lib/heuristics/timeOfDay.ts` | Auto-assigns morning/afternoon/night from task text |

### src/features/tasks/

| File | Purpose |
|------|---------|
| `src/features/tasks/TaskInput.tsx` | Main fast-input field |
| `src/features/tasks/TaskList.tsx` | Renders task list with sort controls |
| `src/features/tasks/TaskItem.tsx` | Single task row (priority button, time-of-day button, edit, complete) |
| `src/features/tasks/TaskArchive.tsx` | Completed/crossed-out tasks view |
| `src/features/tasks/useTasks.ts` | State hook — CRUD + sort + persist |

### src/components/

| File | Purpose |
|------|---------|
| `src/components/PriorityBadge.tsx` | Color-coded priority selector button |
| `src/components/TimeOfDayBadge.tsx` | Color-coded time-of-day selector button |
| `src/components/SortBar.tsx` | Sort toggle (priority / created / time-of-day) |

---

## Color meaning reference

| Color | Meaning |
|-------|---------|
| Red / rose | Alta priority |
| Yellow / amber | Média priority |
| Slate / muted | Baixa priority |
| Blue | Morning (heavy tasks) |
| Orange | Afternoon (medium tasks) |
| Purple / indigo | Night (light tasks) |
| Green | Long duration (≥ 2h) |
| Task text opacity 50% + strikethrough | Completed |
