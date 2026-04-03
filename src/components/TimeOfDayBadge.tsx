import type { TimeOfDay } from '../types/task';

const STYLES: Record<TimeOfDay, string> = {
  manhã: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  tarde: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  noite: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
};

interface Props {
  timeOfDay: TimeOfDay;
  onClick?: () => void;
}

const CYCLE: Record<TimeOfDay, TimeOfDay> = { manhã: 'tarde', tarde: 'noite', noite: 'manhã' };

export function TimeOfDayBadge({ timeOfDay, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-xs font-medium rounded border transition-colors ${STYLES[timeOfDay]}`}
    >
      {timeOfDay}
    </button>
  );
}

export function cycleTimeOfDay(t: TimeOfDay): TimeOfDay {
  return CYCLE[t];
}
