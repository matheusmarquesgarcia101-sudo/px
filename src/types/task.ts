export type Priority = 'alta' | 'média' | 'baixa';
export type TimeOfDay = 'manhã' | 'tarde' | 'noite';
export type SortKey = 'priority' | 'createdAt' | 'timeOfDay';

export interface Task {
  id: string;
  text: string;
  priority: Priority;
  timeOfDay: TimeOfDay;
  durationMinutes: number;
  createdAt: string;
  completedAt?: string;
}
