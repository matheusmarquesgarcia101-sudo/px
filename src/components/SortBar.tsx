import type { SortKey } from '../types/task';

interface Props {
  sort: SortKey;
  onSort: (key: SortKey) => void;
}

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'createdAt', label: 'Recentes' },
  { key: 'priority', label: 'Prioridade' },
  { key: 'timeOfDay', label: 'Horário' },
];

export function SortBar({ sort, onSort }: Props) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSort(key)}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            sort === key
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
