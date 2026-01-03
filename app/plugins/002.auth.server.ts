import type { FetchError } from 'ofetch';
import { ofetch } from 'ofetch';
import { appendResponseHeader } from 'h3';

export default defineNuxtPlugin(async () => {
  const { user, updateUser } = useAuth();
  if (user.value) return; // 🟢 Already authenticated, skip SSR fetch

  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;
  const headers = useRequestHeaders(['cookie']);
  const event = useRequestEvent();

  /**
   * Fetch user session info from backend.
   * Returns:
   *  - true  → user loaded successfully
   *  - false → token expired (401)
   *  - null  → unexpected error (do nothing)
   */
  const fetchUser = async (accessToken?: string) => {
    try {
      const data = await $fetch<IUser>('/auth/me', {
        baseURL,
        method: 'GET',
        credentials: 'include',
        headers: useRequestHeaders(['cookie']),
      });

      updateUser(data);
      console.info(accessToken ? '✅ User loaded after refresh (SSR)' : '✅ User loaded (SSR)');
      return true;
    } catch (error) {
      const err = error as FetchError;
      if (err.status === 401 || err.statusCode === 401) return false;
      console.error('💥 Unexpected error while fetching user:', err);
      return null;
    }
  };

  /**
   * Refresh access token using the refresh token cookie.
   * Forwards any `Set-Cookie` header from backend → SSR response.
   */
  const refreshToken = async () => {
    try {
      const res = await ofetch.raw('/auth/refresh', {
        baseURL,
        method: 'POST',
        credentials: 'include',
        headers,
      });

      const setCookie = res.headers.get('set-cookie');
      if (setCookie && event) appendResponseHeader(event, 'set-cookie', setCookie);

      console.info('🔁 Token refreshed successfully');
      return res._data; // may include new access_token
    } catch {
      console.warn('🚫 Token refresh failed');
      return null;
    }
  };

  /**
   * Auth flow:
   * 1. Try fetching user info
   * 2a. If successful, we're done
   * 2b. If 401, try refreshing token
   * 3a. If refresh successful, try fetching user info again
   * 3b. If refresh fails, we're done (unauthenticated)
   */
  const result = await fetchUser();
  if (result === true || result === null) return; // Done or unrecoverable

  console.warn('⚠️ Token expired, attempting refresh...');
  const refreshed = await refreshToken();
  if (!refreshed) return console.warn('🚫 Unable to refresh token (SSR)');

  await fetchUser(refreshed.access_token);
});
