const intervals = {
  year: 31536000,
  month: 2592000,
  week: 604800,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
} as const;

type IntervalKey = keyof typeof intervals;

export function timeLeft(target: Date | string | number | undefined) {
  if (!target) return '';

  const date = new Date(target);
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000);

  // If time is already passed
  if (seconds <= 0) return 'no time left';

  for (const key of Object.keys(intervals) as IntervalKey[]) {
    const value = Math.floor(seconds / intervals[key]);
    if (value >= 1) {
      return `${value} ${key}${value > 1 ? 's' : ''} left`;
    }
  }

  return 'no time left';
}
