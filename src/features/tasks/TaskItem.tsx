import type { Task } from '../../types/task';
import { PriorityBadge, cyclePriority } from '../../components/PriorityBadge';
import { TimeOfDayBadge, cycleTimeOfDay } from '../../components/TimeOfDayBadge';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onPriority: (id: string, p: Task['priority']) => void;
  onTimeOfDay: (id: string, t: Task['timeOfDay']) => void;
}

export function TaskItem({ task, onComplete, onPriority, onTimeOfDay }: Props) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 group">
      <button
        onClick={() => onComplete(task.id)}
        className="w-4 h-4 rounded-full border border-slate-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0 transition-colors"
        aria-label="Completar"
      />
      <span className="flex-1 text-sm text-slate-800">{task.text}</span>
      <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <PriorityBadge
          priority={task.priority}
          onClick={() => onPriority(task.id, cyclePriority(task.priority))}
        />
        <TimeOfDayBadge
          timeOfDay={task.timeOfDay}
          onClick={() => onTimeOfDay(task.id, cycleTimeOfDay(task.timeOfDay))}
        />
      </div>
    </div>
  );
}
