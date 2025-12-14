interface IUser {
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

export interface IUsers {
  data: IUser[]
  pagination: {
    page: number
    page_size: number
    page_count: number
    total_document: number
  }
}

export const useApiUsers = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const create = async (payload: Partial<IUser>) => {
    return await useApiClientFetch<IUser>('/users', {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const retrieveAll = async (query?: Record<string, unknown>) => {
    return await useApiClientFetch<IUsers>('/users', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieveAllReactive = async (query?: Record<string, unknown>) => {
    return await useApiFetch<IUsers>('/users', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieve = async (id: string) => {
    return await useApiClientFetch<IUser>(`/users/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const retrieveReactive = async (id: string) => {
    return await useApiFetch<IUser>(`/users/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const update = async (id: string, payload: Partial<IUser>) => {
    return await useApiClientFetch<IUser>(`/users/${id}`, {
      baseURL,
      method: 'PATCH',
      body: payload,
      credentials: 'include',
    });
  };

  const updatePassword = async (id: string, payload: { current_password: string, password: string }) => {
    return await useApiClientFetch<IUser>(`/users/${id}/update-password`, {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const remove = async (id: string) => {
    return await useApiClientFetch<{ success: boolean }>(`/users/${id}`, {
      baseURL,
      method: 'DELETE',
      credentials: 'include',
    });
  };

  return {
    create,
    retrieveAll,
    retrieveAllReactive,
    retrieve,
    retrieveReactive,
    update,
    updatePassword,
    remove,
  };
};
