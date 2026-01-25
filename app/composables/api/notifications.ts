import type { IPagination } from '~/types/global';

export interface INotification {
  _id?: string
  type: string
  actor: IUser
  goal_id?: string
  message?: string
  is_read?: string
  thumbnail_url?: string
  entities?: Record<string, string>
  // Metadata
  created_at?: Date
  created_by?: string | IUser
}

export interface INotifications {
  data: INotification[]
  pagination: IPagination
}

export const useApiNotifications = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const create = async (payload: Partial<INotification>) => {
    return await useApiClientFetch<INotification>('/notifications', {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const retrieveAll = async (query?: Record<string, unknown>) => {
    return await useApiClientFetch<INotifications>('/notifications', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieveAllReactive = async (query?: Record<string, unknown>) => {
    return await useApiFetch<INotifications>('/notifications', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieve = async (id: string) => {
    return await useApiClientFetch<INotification>(`/notifications/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const retrieveReactive = async (id: string) => {
    return await useApiFetch<INotification>(`/notifications/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const update = async (id: string, payload: Partial<INotification>) => {
    return await useApiClientFetch<INotification>(`/notifications/${id}`, {
      baseURL,
      method: 'PATCH',
      body: payload,
      credentials: 'include',
    });
  };

  const updateRead = async () => {
    return await useApiClientFetch<INotification>('/notifications/update-read', {
      baseURL,
      method: 'POST',
      credentials: 'include',
    });
  };

  const remove = async (id: string) => {
    return await useApiClientFetch<{ success: boolean }>(`/notifications/${id}`, {
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
    updateRead,
    remove,
  };
};
