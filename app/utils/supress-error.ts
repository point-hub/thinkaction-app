/**
 * Wraps an asynchronous Promise to catch any rejection/error and prevent it from
 * being thrown up the call stack. This is useful for preventing global error pages
 * on expected but unhandled API failures (e.g., 401 in middleware).
 *
 * @param promise The Promise to execute and silence on failure.
 * @returns A Promise that always resolves (never rejects).
 */
export const suppressError = async <T>(promise: Promise<T>): Promise<T | undefined> => {
  try {
    return await promise;
  } catch {
    return undefined as T | undefined;
  }
};
