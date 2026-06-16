import { useMutation } from '@tanstack/react-query';
import type { AuthUser } from '@/context/AuthContext';

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
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
