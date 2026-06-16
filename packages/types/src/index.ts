export type Role = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface JwtPayload {
  sub: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface StackDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStackInput {
  name: string;
  description?: string;
}

export interface UpdateStackInput {
  name?: string;
  description?: string;
}
