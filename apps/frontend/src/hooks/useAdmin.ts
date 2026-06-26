import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface AdminUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  name: string;
  title: string | null;
  isVerified: boolean | null;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface ListUsersResponse {
  data: AdminUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface UpdateUserStatusInput {
  id: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface CreateStackInput {
  name: string;
  description?: string;
}

export function useAdminUsers(params: ListUsersParams) {
  return useQuery<ListUsersResponse, Error>({
    queryKey: ['adminUsers', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ListUsersResponse>('/admin/users', { params });
      return data;
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, UpdateUserStatusInput>({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.put(`/admin/users/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useCreateStack() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, CreateStackInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post('/stacks', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] });
    },
  });
}

export function useDeleteStack() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/stacks/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] });
    },
  });
}
