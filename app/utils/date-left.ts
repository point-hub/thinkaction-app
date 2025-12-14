export function dateLeft(target: Date | string | number | undefined) {
  if (!target) return '';

  const date = new Date(target);
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000);

  if (seconds <= 0) return '0 days left';

  const days = Math.ceil(seconds / 86400);

  return `${days} day${days !== 1 ? 's' : ''} left`;
}
