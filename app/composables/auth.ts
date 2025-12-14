export interface IUser {
  _id?: string
  email?: string
  username?: string
  name?: string
  profile?: {
    status?: string
    bio?: string
  }
  avatar?: {
    public_domain?: string
    public_path?: string
  },
  private_account?: boolean
}

export const useAuthUser = () => useState<IUser | null>('authUser', () => null);
export const useAuthToken = () => useState<string | null>('authToken', () => null);

export const useAuth = () => {
  const user = useAuthUser();
  const token = useAuthToken();

  const isAuthenticated = computed(() => !!user.value);

  const updateUser = (data: IUser | null) => {
    user.value = data;
  };

  const signin = async (username: string, password: string) => {
    const config = useRuntimeConfig();
    const data = await $fetch<IUser>('/auth/signin', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { username, password },
      credentials: 'include',
    });
    updateUser(data);
    return data;
  };

  const me = async () => {
    const { data, error } = await useApiFetch<IUser>('/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
    updateUser(data.value);
    return { data, error };
  };

  const sendEmailVerification = async (username: string) => {
    return await useApiClientFetch('/auth/send-email-verification', {
      method: 'POST',
      credentials: 'include',
      body: {
        username,
      },
    });
  };

  const signout = async () => {
    const data = await useApiClientFetch('/auth/signout', { method: 'POST', credentials: 'include' });
    updateUser(null);
    return data;
  };

  const updateLastSeen = async () => {
    useApiClientFetch('/auth/update-last-seen', { method: 'POST' });
  };

  const signup = async (payload: Record<string, unknown>) => {
    return await useApiClientFetch('/auth/signup', { method: 'POST', body: payload });
  };

  const verifyEmail = async (code: string) => {
    return await useApiClientFetch('/auth/verify-email', { method: 'POST', body: { code } });
  };

  const requestPassword = async (email: string) => {
    return await useApiClientFetch('/auth/request-password', { method: 'POST', body: { email } });
  };

  const resetPassword = async (code: string, password: string) => {
    return await useApiClientFetch('/auth/reset-password', { method: 'POST', body: { code, password } });
  };

  return {
    me,
    user,
    updateUser,
    token,
    signup,
    verifyEmail,
    signin,
    signout,
    updateLastSeen,
    isAuthenticated,
    requestPassword,
    resetPassword,
    sendEmailVerification,
  };
};
