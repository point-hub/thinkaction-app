import { useRuntimeConfig } from 'nuxt/app';
import type { FetchError, FetchOptions, FetchRequest } from 'ofetch';
import qs from 'qs';

// --- Helper Function: Refresh Token ---
async function refreshAccessToken(): Promise<boolean> {
  try {
    await $fetch('/auth/refresh', {
      baseURL: useRuntimeConfig().public.apiBase,
      method: 'POST',
      credentials: 'include',
    });
    console.info('🔁 Token refreshed successfully');
    return true;
  } catch {
    console.warn('🚫 Token refresh failed');
    return false;
  }
}

// --- Main API Fetch Wrapper ---
export async function useApiClientFetch<T>(
  url: FetchRequest,
  options: FetchOptions = {},
  hasRetried = false,
): Promise<T> {
  const config = useRuntimeConfig();

  // 1. Separate 'query' from other options
  // We need to handle query parameters manually before $fetch
  const { query, ...otherOptions } = options;

  let finalUrl: FetchRequest = url;

  // 2. Serialize query parameters using qs if they exist
  if (query && Object.keys(query).length > 0) {
    const queryString = qs.stringify(query, {
      // Crucial: Use dot notation for serialization
      allowDots: true,
      // arrayFormat: 'brackets' is a good default for arrays (e.g., ids[]=1&ids[]=2)
      arrayFormat: 'brackets',
    });

    // Append the serialized string directly to the URL
    // Make sure we work with a string representation of the request (handles string | URL | Request)
    const urlString =
      typeof url === 'string'
        ? url
        : url instanceof URL
          ? url.toString()
          : (url as Request).url;

    // Checks if the URL already has query params ('?')
    finalUrl = `${urlString}${urlString.includes('?') ? '&' : '?'}${queryString}`;
  }

  // 3. Construct merged options for $fetch
  const mergedOptions: FetchOptions = {
    baseURL: config.public.apiBase,
    credentials: 'include',
    // Remaining options (data, method, headers, etc.)
    ...otherOptions,
  };

  try {
    // 4. Execute $fetch with the modified URL
    return await $fetch<T>(finalUrl, mergedOptions as Record<string, unknown>);
  } catch (error) {
    const err = error as FetchError;

    // If refresh endpoint itself failed → don't retry
    if (url === '/auth/refresh') throw err;

    // Handle token expiration (401)
    const isUnauthorized = err.status === 401 || err.statusCode === 401;
    if (!isUnauthorized || hasRetried) throw err;

    console.warn('Token expired, attempting refresh...');

    // Attempt refresh once
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      console.error('Token refresh failed — user must reauthenticate');
      throw err;
    }

    console.info('Token refreshed, retrying original request...');
    // Retries the call with the original URL and options (including the query object)
    return useApiClientFetch<T>(url, options, true);
  }
}
