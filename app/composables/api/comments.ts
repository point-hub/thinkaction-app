import type { IPagination } from '~/types/global';

export interface IComment {
  _id?: string
  goal_id?: string
  parent_id?: string // null = top level comment
  comment?: string
  mentions?: {
    _id: string
    label: string
    link?: string
  }[]
  // Metadata
  created_at?: Date
  updated_at?: Date
  created_by_id?: string
  created_by?: IUser
}

export interface IComments {
  data: IComment[]
  pagination: IPagination
}

export const useApiComments = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const create = async (payload: Partial<IComment>) => {
    return await useApiClientFetch<IComment>('/comments', {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const retrieveAll = async (query?: Record<string, unknown>) => {
    return await useApiClientFetch<IComments>('/comments', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieveAllReactive = async (query?: Record<string, unknown>) => {
    return await useApiFetch<IComments>('/comments', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieve = async (id: string) => {
    return await useApiClientFetch<IComment>(`/comments/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const retrieveReactive = async (id: string) => {
    return await useApiFetch<IComment>(`/comments/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const update = async (id: string, payload: Partial<IComment>) => {
    return await useApiClientFetch<IComment>(`/comments/${id}`, {
      baseURL,
      method: 'PATCH',
      body: payload,
      credentials: 'include',
    });
  };

  const updatePassword = async (id: string, payload: { current_password: string, password: string }) => {
    return await useApiClientFetch<IComment>(`/comments/${id}/update-password`, {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const remove = async (id: string) => {
    return await useApiClientFetch<{ success: boolean }>(`/comments/${id}`, {
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
