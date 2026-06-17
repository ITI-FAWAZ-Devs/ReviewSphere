import { useMutation, useQuery } from '@tanstack/react-query';
import type { AuthUser } from '@/context/AuthContext';

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface StudentRegisterInput {
  role: 'STUDENT';
  name: string;
  email: string;
  password: string;
}

interface MentorRegisterInput {
  role: 'MENTOR';
  name: string;
  email: string;
  password: string;
  title: string;
  bio: string;
  stackId: string;
}

export type RegisterInput = StudentRegisterInput | MentorRegisterInput;

export interface StackOption {
  id: string;
  name: string;
  description: string | null;
}

async function loginRequest(body: LoginInput): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Login failed');
  return data as AuthResponse;
}

async function registerRequest(body: RegisterInput): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Registration failed');
  return data as AuthResponse;
}

async function fetchStacks(): Promise<StackOption[]> {
  const res = await fetch('/api/stacks');
  if (!res.ok) throw new Error('Failed to load stacks');
  return res.json() as Promise<StackOption[]>;
}

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: loginRequest,
  });
}

export function useRegister() {
  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: registerRequest,
  });
}

export function useStacks() {
  return useQuery<StackOption[], Error>({
    queryKey: ['stacks'],
    queryFn: fetchStacks,
    staleTime: 1000 * 60 * 10,
  });
}
