import { useRef, useEffect } from 'react';

interface Props {
  onAdd: (raw: string) => void;
}

export function TaskInput({ onAdd }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = ref.current?.value.trim() ?? '';
      if (value) {
        onAdd(value);
        ref.current!.value = '';
      }
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      placeholder="Nova tarefa… use #5m #2h para duração"
      onKeyDown={handleKeyDown}
      className="w-full px-4 py-3 text-base bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 placeholder:text-slate-400"
    />
  );
}
