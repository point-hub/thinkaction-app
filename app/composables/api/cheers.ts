import type { IPagination } from '~/types/global';

export interface ICheer {
  _id?: string
  goal_id?: string
  user?: IUser
  created_at?: Date
}

export interface ICheers {
  data: ICheer[]
  pagination: IPagination
  my_cheered_id: string
}

export const useApiCheers = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const create = async (payload: Partial<ICheer>) => {
    return await useApiClientFetch<{ inserted_id: string }>('/cheers', {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const retrieveAll = async (query?: Record<string, unknown>) => {
    return await useApiClientFetch<ICheers>('/cheers', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieveAllReactive = async (query?: Record<string, unknown>) => {
    return await useApiFetch<ICheers>('/cheers', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieve = async (id: string) => {
    return await useApiClientFetch<ICheer>(`/cheers/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const retrieveReactive = async (id: string) => {
    return await useApiFetch<ICheer>(`/cheers/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const update = async (id: string, payload: Partial<ICheer>) => {
    return await useApiClientFetch<ICheer>(`/cheers/${id}`, {
      baseURL,
      method: 'PATCH',
      body: payload,
      credentials: 'include',
    });
  };

  const updatePassword = async (id: string, payload: { current_password: string, password: string }) => {
    return await useApiClientFetch(`/cheers/${id}/update-password`, {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const remove = async (id: string) => {
    return await useApiClientFetch(`/cheers/${id}`, {
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
