export function dateProgress(createdAt: Date | string | number | undefined) {
  if (!createdAt) return '';

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const date = new Date(createdAt);

  return `${months[date.getMonth()]} ${date.getDate()}`;
}
