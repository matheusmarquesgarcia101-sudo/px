import { useState } from 'react';
import type { Task, Priority, TimeOfDay, SortKey } from '../../types/task';
import { loadTasks, saveTasks } from '../../lib/storage/tasks';
import { parseInput } from '../../lib/parser/parseInput';
import { autoPriority } from '../../lib/heuristics/priority';
import { autoTimeOfDay } from '../../lib/heuristics/timeOfDay';

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

  const complete = (id: string) =>
    persist(tasks.map(t => t.id === id ? { ...t, completedAt: new Date().toISOString() } : t));

  const remove = (id: string) =>
    persist(tasks.filter(t => t.id !== id));

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

  return { active, archived, add, complete, remove, setPriority, setTimeOfDay, sort, setSort };
}
