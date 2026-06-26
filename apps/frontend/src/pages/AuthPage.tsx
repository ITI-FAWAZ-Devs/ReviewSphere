import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, GraduationCap, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useLogin, useRegister, useStacks } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';
type RoleChoice = 'STUDENT' | 'MENTOR';

type AuthPageProps = {
  mode?: Tab;
};

export default function AuthPage({ mode = 'login' }: AuthPageProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { data: stacks = [] } = useStacks();

  const [tab, setTab] = useState<Tab>(mode);
  const [role, setRole] = useState<RoleChoice>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [stackId, setStackId] = useState('');

  function resetForm() {
    setEmail(''); setPassword(''); setName('');
    setTitle(''); setBio(''); setStackId('');
    setShowPassword(false);
  }

  function switchTab(t: Tab) {
    setTab(t);
    resetForm();
    loginMutation.reset();
    registerMutation.reset();
  }

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password }, {
      onSuccess: (data) => {
        login(data.user, data.token);
        navigate(data.user.role === 'STUDENT' ? '/dashboard' : '/mentors');
      },
    });
  }

  function handleRegister(e: FormEvent) {
    e.preventDefault();
    const base = { name, email, password };
    const payload = role === 'MENTOR'
      ? { ...base, role: 'MENTOR' as const, title, bio, stackId }
      : { ...base, role: 'STUDENT' as const };

    registerMutation.mutate(payload, {
      onSuccess: (data) => {
        login(data.user, data.token);
        navigate(data.user.role === 'STUDENT' ? '/dashboard' : '/mentors');
      },
    });
  }

  const error = tab === 'login'
    ? (loginMutation.isError ? loginMutation.error?.message : null)
    : (registerMutation.isError ? registerMutation.error?.message : null);

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const inputClass = 'bg-transparent border-0 border-b border-border rounded-none px-0 text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:border-rs-accent transition-colors text-sm';

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background px-6 py-4 border-b border-border">
        <span className="text-foreground font-bold text-lg tracking-tight">{t('common.appName')}</span>
      </div>

      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {(['login', 'register'] as Tab[]).map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => switchTab(tabKey)}
                  className={cn(
                    'flex-1 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors',
                    tab === tabKey
                      ? 'text-foreground border-b-2 border-rs-accent'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(`auth.${tabKey}`)}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Role selector */}
              {tab === 'register' && (
                <>
                  <p className="text-muted-foreground text-xs text-center mb-3">{t('auth.selectPath')}</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {(['STUDENT', 'MENTOR'] as RoleChoice[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-sm font-medium',
                          role === r
                            ? 'bg-rs-accent border-rs-accent text-white shadow-lg'
                            : 'bg-muted border-border text-muted-foreground hover:border-rs-accent/50 hover:text-foreground',
                        )}
                      >
                        {r === 'STUDENT' ? <GraduationCap className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                        {t(`auth.${r.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="text-rs-danger text-xs text-center bg-rs-danger/10 border border-rs-danger/20 rounded-lg px-3 py-2 mb-4">
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.email')}</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.emailPlaceholder')} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.password')}</Label>
                      <button type="button" className="text-muted-foreground hover:text-rs-accent text-[10px] tracking-widest uppercase transition-colors">{t('auth.forgot')}</button>
                    </div>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('auth.passwordPlaceholder')} className={cn(inputClass, 'pe-7')} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute end-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold py-2.5 rounded-xl transition-colors">
                    {isPending ? t('auth.signingIn') : t('auth.continue')}
                  </Button>
                </form>
              )}

              {/* REGISTER FORM */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.fullName')}</Label>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('auth.namePlaceholder')} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.email')}</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.emailPlaceholder')} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('auth.passwordPlaceholder')} className={cn(inputClass, 'pe-7')} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute end-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {role === 'MENTOR' && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.professionalTitle')}</Label>
                        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={t('auth.titlePlaceholder')} className={inputClass} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.bio')}</Label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} required minLength={10} placeholder={t('auth.bioPlaceholder')} rows={2} className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 text-foreground placeholder-muted-foreground focus:outline-none focus:border-rs-accent transition-colors text-sm resize-none" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('auth.techStack')}</Label>
                        <select value={stackId} onChange={(e) => setStackId(e.target.value)} required className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-1 text-foreground focus:outline-none focus:border-rs-accent transition-colors text-sm appearance-none">
                          <option value="" disabled className="bg-card">{t('auth.selectStack')}</option>
                          {stacks.map((s) => (
                            <option key={s.id} value={s.id} className="bg-card">{s.name}</option>
                          ))}
                        </select>
                        {stacks.length === 0 && (
                          <p className="text-muted-foreground text-xs mt-0.5">{t('auth.noStacks')}</p>
                        )}
                      </div>
                    </>
                  )}
                  <Button type="submit" disabled={isPending} className="w-full bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold py-2.5 rounded-xl transition-colors !mt-4">
                    {isPending ? t('auth.creatingAccount') : t('auth.continue')}
                  </Button>
                </form>
              )}

              {/* SSO */}
              <div className="mt-5 space-y-3">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground text-[11px] uppercase tracking-wider">{t('auth.orContinueWith')}</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-white text-[#3C4043] hover:bg-gray-50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {/* <span>{t('auth.continueWithGoogle')}</span> */}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/api/auth/github'}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-[#24292E] text-white hover:bg-[#2c3238] dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    {/* <span>{t('auth.continueWithGitHub')}</span> */}
                  </button>
                </div>
                
                {tab === 'register' && (
                  <p className="text-[10px] text-center text-muted-foreground bg-muted/50 border border-border/40 rounded-lg p-2 mt-2 leading-relaxed">
                    💡 {t('auth.oauthRoleNote')}
                  </p>
                )}
              </div>

              {/* Terms */}
              <p className="text-center text-muted-foreground text-[11px] mt-4 leading-relaxed">
                {t('auth.terms')}{' '}
                <a href="#" className="underline hover:text-foreground transition-colors">{t('auth.termsLink')}</a>
                {' '}{t('auth.and')}{' '}
                <a href="#" className="underline hover:text-foreground transition-colors">{t('auth.privacyLink')}</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
