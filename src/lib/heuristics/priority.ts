import type { Priority } from '../../types/task';

const ALTA = ['reunião', 'prazo', 'urgente', 'deadline', 'entregar', 'apresentar', 'médico', 'consulta'];
const MEDIA = ['estudar', 'revisar', 'pesquisar', 'planejar', 'rascunho'];

/** Auto-assigns priority based on keywords in task text. */
export function autoPriority(text: string): Priority {
  const lower = text.toLowerCase();
  if (ALTA.some(k => lower.includes(k))) return 'alta';
  if (MEDIA.some(k => lower.includes(k))) return 'média';
  return 'baixa';
}
