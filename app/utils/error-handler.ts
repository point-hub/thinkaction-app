// Define a type for the dynamic field errors
type FieldErrors = Record<string, string[]>;

/**
 * Handles common API errors encountered during authentication processes.
 * @param error The error object caught by the try/catch block.
 * @returns FieldErrors object for 422 validation errors, or null for other errors/success.
 */
export function handleError(error: unknown): FieldErrors | null {
  if (isApiError(error)) {
    const apiError = getApiError(error);

    if (!apiError) {
      toast('Unexpected API error.', { color: 'danger' });
      return null;
    }

    switch (apiError.code) {
    case 401:
      toast(apiError.message || 'Unauthenticated.', { color: 'danger' });
      return null;

    case 403:
      toast(apiError.message || 'Unauthorized access.', { color: 'danger' });
      return null;

    case 422:
      return apiError.errors as FieldErrors || null;

    default:
      toast(apiError.message || 'Something went wrong.', { color: 'danger' });
      return null;
    }
  } else {
    const message = error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

    toast(message, { color: 'danger' });
    return null;
  }
}
