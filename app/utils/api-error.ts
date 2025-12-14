export interface ApiErrorResponse {
  name?: string
  code?: number
  status?: string
  message?: string
  errors?: Record<string, string[]>
}

interface ErrorWithResponse {
  response?: {
    _data?: unknown
  }
}

/**
 * Check if the given error looks like an ApiError.
 */
export function isApiError(error: unknown): error is ApiErrorResponse {
  const data
    = typeof error === 'object' && error !== null
      ? (error as Record<string, unknown>).data
      ?? (error as ErrorWithResponse).response?._data
      ?? error
      : null;

  return (
    typeof data === 'object'
    && data !== null
    && (data as Record<string, unknown>).name === 'ApiError'
  );
}

/**
 * Safely extract the backend ApiError response.
 * Keeps the original structure (not normalized).
 */
export function getApiError(error: unknown): ApiErrorResponse | null {
  if (!isApiError(error)) return null;

  const data
    = (error as Record<string, unknown>).data
      ?? (error as ErrorWithResponse).response?._data
      ?? error;

  return data as ApiErrorResponse;
}

/**
 * Get the first message for a specific field.
 */
export function getFieldError(
  error: ApiErrorResponse | null,
  field: string,
): string[] {
  return error?.errors?.[field] ?? [];
}
