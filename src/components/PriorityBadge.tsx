import type { Priority } from '../types/task';

const STYLES: Record<Priority, string> = {
  alta: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200',
  média: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
  baixa: 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200',
};

interface Props {
  priority: Priority;
  onClick?: () => void;
}

const CYCLE: Record<Priority, Priority> = { alta: 'média', média: 'baixa', baixa: 'alta' };

export function PriorityBadge({ priority, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-xs font-medium rounded border transition-colors ${STYLES[priority]}`}
    >
      {priority}
    </button>
  );
}

export function cyclePriority(p: Priority): Priority {
  return CYCLE[p];
}
