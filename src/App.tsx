import { useTasks } from './features/tasks/useTasks';
import { TaskInput } from './features/tasks/TaskInput';
import { TaskList } from './features/tasks/TaskList';
import { TaskArchive } from './features/tasks/TaskArchive';

export default function App() {
  const { active, archived, add, complete, remove, setPriority, setTimeOfDay, sort, setSort } = useTasks();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">px</h1>
        <TaskInput onAdd={add} />
        <div className="mt-6">
          <TaskList
            tasks={active}
            sort={sort}
            onSort={setSort}
            onComplete={complete}
            onRemove={remove}
            onPriority={setPriority}
            onTimeOfDay={setTimeOfDay}
          />
        </div>
        <TaskArchive tasks={archived} />
      </div>
    </div>
  );
}
