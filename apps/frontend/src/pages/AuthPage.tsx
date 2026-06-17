import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useLogin, useRegister, useStacks } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';
type RoleChoice = 'STUDENT' | 'MENTOR';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { data: stacks = [] } = useStacks();

  const [tab, setTab] = useState<Tab>('login');
  const [role, setRole] = useState<RoleChoice>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Mentor-only fields
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
      onSuccess: (data) => { login(data.user, data.token); navigate('/mentors'); },
    });
  }

  function handleRegister(e: FormEvent) {
    e.preventDefault();
    const base = { name, email, password };
    const payload = role === 'MENTOR'
      ? { ...base, role: 'MENTOR' as const, title, bio, stackId }
      : { ...base, role: 'STUDENT' as const };

    registerMutation.mutate(payload, {
      onSuccess: (data) => { login(data.user, data.token); navigate('/mentors'); },
    });
  }

  const error = tab === 'login'
    ? (loginMutation.isError ? loginMutation.error?.message : null)
    : (registerMutation.isError ? registerMutation.error?.message : null);

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const inputClass = "bg-transparent border-0 border-b border-slate-600 rounded-none px-0 text-slate-100 placeholder-slate-500 focus-visible:ring-0 focus-visible:border-indigo-500 transition-colors text-sm";

  return (
    // Full viewport, scrollable when content exceeds height
    <div className="min-h-screen bg-[#0d1117] overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#0d1117] px-6 py-4 border-b border-slate-800/60">
        <span className="text-white font-bold text-lg tracking-tight">ReviewSphere</span>
      </div>

      {/* Centered content area — grows to fill remaining viewport height */}
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-[#161b22] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-slate-700/50">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={cn(
                    'flex-1 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors',
                    tab === t
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-slate-500 hover:text-slate-300',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Role selector — register only */}
              {tab === 'register' && (
                <>
                  <p className="text-slate-400 text-xs text-center mb-3">Select your path</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {(['STUDENT', 'MENTOR'] as RoleChoice[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-sm font-medium',
                          role === r
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300',
                        )}
                      >
                        {r === 'STUDENT'
                          ? <GraduationCap className="w-4 h-4" />
                          : <Lightbulb className="w-4 h-4" />}
                        {r === 'STUDENT' ? 'Student' : 'Mentor'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="text-red-400 text-xs text-center bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2 mb-4">
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Work Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" className={inputClass} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Password</Label>
                      <button type="button" className="text-slate-500 hover:text-indigo-400 text-[10px] tracking-widest uppercase transition-colors">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className={cn(inputClass, 'pr-7')} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-colors">
                    {isPending ? 'Signing in…' : 'Continue'}
                  </Button>
                </form>
              )}

              {/* REGISTER FORM */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Full Name</Label>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" className={inputClass} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Work Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" className={inputClass} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className={cn(inputClass, 'pr-7')} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Mentor-only fields */}
                  {role === 'MENTOR' && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Professional Title</Label>
                        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Senior React Engineer" className={inputClass} />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Bio</Label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          required
                          minLength={10}
                          placeholder="Tell students about your expertise…"
                          rows={2}
                          className="w-full bg-transparent border-0 border-b border-slate-600 rounded-none px-0 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-500 text-[10px] tracking-widest uppercase">Tech Stack</Label>
                        <select
                          value={stackId}
                          onChange={(e) => setStackId(e.target.value)}
                          required
                          className="w-full bg-transparent border-0 border-b border-slate-600 rounded-none px-0 py-1 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm appearance-none"
                        >
                          <option value="" disabled className="bg-slate-900">Select a stack…</option>
                          {stacks.map((s) => (
                            <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                          ))}
                        </select>
                        {stacks.length === 0 && (
                          <p className="text-slate-600 text-xs mt-0.5">No stacks yet — ask an admin to add some.</p>
                        )}
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-colors !mt-4">
                    {isPending ? 'Creating account…' : 'Continue'}
                  </Button>
                </form>
              )}

              {/* SSO divider */}
              <div className="mt-4">
                <p className="text-center text-slate-600 text-xs mb-2.5">or access via SSO</p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                    <GoogleIcon />
                  </button>
                  <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                    <GitHubIcon />
                  </button>
                </div>
              </div>

              {/* Terms */}
              <p className="text-center text-slate-600 text-[11px] mt-4 leading-relaxed">
                By continuing, you agree to ReviewSphere's{' '}
                <a href="#" className="underline hover:text-slate-400 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="underline hover:text-slate-400 transition-colors">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
