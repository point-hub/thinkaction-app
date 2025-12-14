import { useRuntimeConfig, useRequestHeaders, navigateTo } from '#app';
import type { UseFetchOptions, AsyncData } from 'nuxt/app';
import type { Ref } from 'vue';
import type { FetchError } from 'ofetch';
import QueryString from 'qs';

const cleanHeaders = (headers?: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(headers ?? {}).filter(([_, v]) => v)) as Record<string, string>;

export const refreshToken = async (apiBaseUrl: string, headers?: Record<string, string | undefined>) => {
  try {
    const { error } = await useFetch('/auth/refresh', {
      baseURL: apiBaseUrl,
      method: 'POST',
      credentials: 'include',
      headers: cleanHeaders(headers),
    });
    if (error.value) throw error.value;
    return true;
  } catch {
    return false;
  }
};

export const useApiFetch = async <T>(
  url: string | Ref<string> | (() => string),
  options: UseFetchOptions<T> = {},
  retried = false,
): Promise<AsyncData<T, FetchError | null>> => {
  const config = useRuntimeConfig();
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;

  const queryString = QueryString.stringify(options.query, {
    allowDots: true,
    arrayFormat: 'brackets',
  }) as UseFetchOptions<T>;

  // Checks if the URL already has query params ('?')
  const finalUrl = `${url}${queryString ? '?': ''}${queryString}`;

  const result = await useFetch<T>(finalUrl, {
    baseURL: config.public.apiBase,
    credentials: 'include',
    headers: {
      ...cleanHeaders(headers),
      ...(options.headers as Record<string, string> | undefined),
      'Content-Type': 'application/json',
    },
  });

  const error = result.error.value;
  if (error && (error.status || error.statusCode) === 401 && !retried) {
    const refreshed = await refreshToken(config.public.apiBase, headers);
    if (refreshed) return useApiFetch(url, options, true);
    // if (import.meta.client) navigateTo('/signin')
  }

  return result as AsyncData<T, FetchError | null>;
};
