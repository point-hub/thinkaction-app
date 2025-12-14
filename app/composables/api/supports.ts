import type { IPagination } from '~/types/global';

export interface ISupport {
  _id?: string
  supporter_id?: string
  supporter?: IUser
  supporting_id?: string
  supporting?: IUser
  // Metadata
  created_at?: Date
}

export interface ISupports {
  data: ISupport[]
  pagination: IPagination
}

export const useApiSupports = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const create = async (payload: Partial<ISupport>) => {
    return await useApiClientFetch<ISupport>('/supports', {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const retrieveAll = async (query?: Record<string, unknown>) => {
    return await useApiClientFetch<ISupports>('/supports', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieveAllReactive = async (query?: Record<string, unknown>) => {
    return await useApiFetch<ISupports>('/supports', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieve = async (id: string) => {
    return await useApiClientFetch<ISupport>(`/supports/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const retrieveReactive = async (id: string) => {
    return await useApiFetch<ISupport>(`/supports/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const update = async (id: string, payload: Partial<ISupport>) => {
    return await useApiClientFetch<ISupport>(`/supports/${id}`, {
      baseURL,
      method: 'PATCH',
      body: payload,
      credentials: 'include',
    });
  };

  const updatePassword = async (id: string, payload: { current_password: string, password: string }) => {
    return await useApiClientFetch<ISupport>(`/supports/${id}/update-password`, {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const remove = async (id: string) => {
    return await useApiClientFetch<{ success: boolean }>(`/supports/${id}`, {
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
