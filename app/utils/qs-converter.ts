import qs from 'qs';

export function convertQuery(query?: Record<string, unknown>) {
  return `?${qs.stringify(query, { encode: true })}`;
}
