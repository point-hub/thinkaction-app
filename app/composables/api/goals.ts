import type { IPagination } from '~/types/global';
import type { ICheer } from './cheers';

export interface IGoalComment {
  _id?: string
  goal_id?: string
  parent_id?: string
  comment?: string
  mentions?: {
    _id: string
    label: string
    link?: string
  }[]
  created_at?: Date
  updated_at?: Date
  created_by?: IUser
}

export interface IGoalProgress {
  _id?: string
  goal_id?: string
  caption?: string
  media_url?: string
  thumbnail_url?: string
  created_at?: Date
  created_by?: IUser
}

export interface IGoal {
  _id?: string
  specific?: string
  measurable?: string
  relevant?: string
  achievable?: string
  time?: Date
  visibility?: 'public' | 'private' | 'supporters'
  thumbnail_url?: string
  status?: 'achieved' | 'in-progress' | 'failed'
  progress?: IGoalProgress[]
  // Cheers
  cheers: ICheer[]
  total_cheers: number,
  my_cheered_id: string,
  // Comments
  total_comments: number,
  comments: IGoalComment[],
  // Metadata
  created_at?: Date
  updated_at?: Date
  created_by?: IUser
}

export interface IGoals {
  data: IGoal[]
  pagination: IPagination
}

export const useApiGoals = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const create = async (payload: Partial<IGoal>) => {
    return await useApiClientFetch<IGoal>('/goals', {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const createProgress = async (id: string, payload: Partial<IGoal>) => {
    return await useApiClientFetch<IGoal>(`/goals/${id}/progress`, {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const retrieveAll = async (query?: Record<string, unknown>) => {
    return await useApiClientFetch<IGoals>('/goals', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieveAllReactive = async (query?: Record<string, unknown>) => {
    return await useApiFetch<IGoals>('/goals', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieveAllProgress = async (query?: Record<string, unknown>) => {
    return await useApiClientFetch<IGoals>('/goals/progress', {
      baseURL,
      method: 'GET',
      query,
      credentials: 'include',
    });
  };

  const retrieve = async (id: string) => {
    return await useApiClientFetch<IGoal>(`/goals/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const retrieveReactive = async (id: string) => {
    return await useApiFetch<IGoal>(`/goals/${id}`, {
      baseURL,
      method: 'GET',
      credentials: 'include',
    });
  };

  const update = async (id: string, payload: Partial<IGoal>) => {
    return await useApiClientFetch<IGoal>(`/goals/${id}`, {
      baseURL,
      method: 'PATCH',
      body: payload,
      credentials: 'include',
    });
  };

  const updatePassword = async (id: string, payload: { current_password: string, password: string }) => {
    return await useApiClientFetch<IGoal>(`/goals/${id}/update-password`, {
      baseURL,
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
  };

  const remove = async (id: string) => {
    return await useApiClientFetch<{ success: boolean }>(`/goals/${id}`, {
      baseURL,
      method: 'DELETE',
      credentials: 'include',
    });
  };

  return {
    create,
    createProgress,
    retrieveAll,
    retrieveAllReactive,
    retrieveAllProgress,
    retrieve,
    retrieveReactive,
    update,
    updatePassword,
    remove,
  };
};
