import type { Task } from '../../types/task';

interface Props {
  tasks: Task[];
}

export function TaskArchive({ tasks }: Props) {
  if (tasks.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
        Arquivo — {tasks.length}
      </h2>
      <div className="divide-y divide-slate-50">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-2 py-2 px-3">
            <span className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm text-slate-400 line-through opacity-50">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
