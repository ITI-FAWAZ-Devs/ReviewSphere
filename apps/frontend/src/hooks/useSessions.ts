import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface Session {
  id: string;
  mentorId: string;
  studentId: string;
  status: 'Scheduled' | 'Completed' | 'Canceled' | 'Cancelled';
  startsAt: string;
  endsAt: string;
  rating?: number | null;
  feedback?: string | null;
  evaluationNotes?: string | null;
  meetLink?: string | null;
  mentor: {
    id: string;
    name: string;
    title: string;
    avatarUrl: string | null;
    stack?: { name: string };
    user: { email: string };
  };
  student: {
    id: string;
    name: string;
    user: { email: string };
  };
}

export interface BookSessionInput {
  mentor_id: string;
  start_time: string;
  end_time: string;
  description?: string;
}

export interface UpdateSessionStatusInput {
  id: string;
  status: 'Scheduled' | 'Completed' | 'Canceled' | 'Cancelled';
  evaluationNotes?: string;
}

export interface SubmitFeedbackInput {
  id: string;
  rating: number;
  feedback: string;
}

export interface SessionAuditLog {
  id: string;
  sessionId: string;
  action: string;
  payload: any;
  performedBy: string;
  createdAt: string;
}

export function useUserSessions() {
  return useQuery<Session[], Error>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await apiClient.get<Session[]>('/sessions');
      return data;
    },
  });
}

export function useBookSession() {
  const queryClient = useQueryClient();
  return useMutation<Session, Error, BookSessionInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post<Session>('/sessions/book', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['mentorAvailability'] });
    },
  });
}

export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation<Session, Error, UpdateSessionStatusInput>({
    mutationFn: async ({ id, status, evaluationNotes }) => {
      const { data } = await apiClient.put<Session>(`/sessions/${id}/status`, { status, evaluationNotes });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation<Session, Error, SubmitFeedbackInput>({
    mutationFn: async ({ id, rating, feedback }) => {
      const { data } = await apiClient.post<Session>(`/sessions/${id}/feedback`, { rating, feedback });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useSessionAudit(id: string) {
  return useQuery<SessionAuditLog[], Error>({
    queryKey: ['sessionAudit', id],
    queryFn: async () => {
      const { data } = await apiClient.get<SessionAuditLog[]>(`/sessions/${id}/audit`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSessionMeetLink() {
  const queryClient = useQueryClient();
  return useMutation<{ meetLink: string | null }, Error, string>({
    mutationFn: async (sessionId) => {
      const { data } = await apiClient.get<{ meetLink: string | null }>(
        `/sessions/${sessionId}/meet-link`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
