import type { Task } from '../../types/task';
import type { SortKey } from '../../types/task';
import { TaskItem } from './TaskItem';
import { SortBar } from '../../components/SortBar';

interface Props {
  tasks: Task[];
  sort: SortKey;
  onSort: (key: SortKey) => void;
  onComplete: (id: string) => void;
  onPriority: (id: string, p: Task['priority']) => void;
  onTimeOfDay: (id: string, t: Task['timeOfDay']) => void;
}

export function TaskList({ tasks, sort, onSort, onComplete, onPriority, onTimeOfDay }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{tasks.length} tarefas</span>
        <SortBar sort={sort} onSort={onSort} />
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Nenhuma tarefa pendente.</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {tasks.map(t => (
            <TaskItem
              key={t.id}
              task={t}
              onComplete={onComplete}
              onPriority={onPriority}
              onTimeOfDay={onTimeOfDay}
            />
          ))}
        </div>
      )}
    </div>
  );
}
