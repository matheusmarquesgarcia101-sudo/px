import type { Task } from '../../types/task';

const KEY = 'px-tasks';

export function loadTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}
