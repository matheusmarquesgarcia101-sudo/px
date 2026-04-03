import type { Priority, TimeOfDay } from '../../types/task';

/** Auto-assigns time-of-day based on priority and duration. */
export function autoTimeOfDay(priority: Priority, durationMinutes: number): TimeOfDay {
  if (priority === 'alta' || durationMinutes >= 120) return 'manhã';
  if (priority === 'média' || durationMinutes >= 30) return 'tarde';
  return 'noite';
}
