import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { Role, AuthUser } from '@reviewsphere/types';

export type { Role, AuthUser };

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, login, logout } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
