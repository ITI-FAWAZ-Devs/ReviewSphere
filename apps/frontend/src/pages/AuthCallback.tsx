import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loginState = useAuthStore((s) => s.login);
  const isHandling = useRef(false);

  useEffect(() => {
    if (isHandling.current) return;
    isHandling.current = true;

    const token = searchParams.get('token') || '';
    const error = searchParams.get('error') || '';

    if (error || !token) {
      toast.error(t('common.error'));
      navigate('/login', { replace: true });
      return;
    }

    async function fetchProfileAndLogin() {
      try {
        // Log in with temporary values to load profile
        loginState(
          {
            id: '',
            email: '',
            name: '',
            role: 'STUDENT',
            createdAt: new Date(),
          },
          token
        );

        const { data: profile } = await apiClient.get('/auth/profile');

        const realUser = {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          name: profile.name,
          createdAt: new Date(profile.createdAt),
        };

        loginState(realUser, token);
        toast.success(t('dashboard.welcome', { name: profile.name }));

        if (profile.role === 'ADMIN') {
          navigate('/dashboard/admin', { replace: true });
        } else if (profile.role === 'MENTOR') {
          navigate('/dashboard/mentor', { replace: true });
        } else {
          navigate('/dashboard/student', { replace: true });
        }
      } catch {
        toast.error('Authentication failed. Please try again.');
        useAuthStore.getState().logout();
      }
    }

    fetchProfileAndLogin();
  }, [searchParams, navigate, loginState, t]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-rs-accent" />
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}
