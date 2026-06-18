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

export interface MentorAvailabilityDto {
  id: string;
  mentorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorAvailabilityInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface ReviewSessionDto {
  id: string;
  mentorId: string;
  studentId: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  title?: string;
  bio?: string;
  hourly_rate?: number;
  hourlyRate?: number;
  stack_id?: string;
  stackId?: string;
}
