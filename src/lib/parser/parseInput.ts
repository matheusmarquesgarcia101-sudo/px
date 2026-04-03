/** Parses raw input string into task text and duration in minutes. */
export function parseInput(raw: string): { text: string; durationMinutes: number } {
  const match = raw.match(/#(\d+)(m|h|d|w)/);
  if (!match) return { text: raw.trim(), durationMinutes: 30 };

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { m: 1, h: 60, d: 1440, w: 10080 };
  const durationMinutes = value * multipliers[unit];
  const text = raw.replace(match[0], '').trim();

  return { text, durationMinutes };
}
