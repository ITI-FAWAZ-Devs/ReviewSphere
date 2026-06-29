import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Video,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { useAuth } from '@/context/AuthContext';
import { useUserSessions, useUpdateSessionStatus, useSubmitFeedback, useSessionMeetLink } from '@/hooks/useSessions';

import DashboardStats from '@/components/dashboard/DashboardStats';
import UpcomingSessions from '@/components/dashboard/UpcomingSessions';
import SessionHistory from '@/components/dashboard/SessionHistory';
import MentorAvatar from '@/components/dashboard/MentorAvatar';

interface MentorInfo {
  id: string;
  name: string;
  title: string;
  avatarUrl: string | null;
  stack?: { name: string };
}

interface ApiSession {
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
  mentor: MentorInfo;
}

interface Session extends ApiSession {
  mentorName: string;
  mentorAvatar?: string;
  title: string;
  startTime: string;
  duration: number;
  meetLink?: string | null;
}

interface FeedbackForm {
  rating: number;
  text: string;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const isSessionsPage = location.pathname === '/dashboard/student/sessions';

  const { data: apiSessions = [], isLoading, error } = useUserSessions();
  const updateStatusMutation = useUpdateSessionStatus();
  const submitFeedbackMutation = useSubmitFeedback();
  const fetchMeetLinkMutation = useSessionMeetLink();

  const [feedback, setFeedback] = useState<Record<string, FeedbackForm>>({});
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'canceled'>('all');
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const submittingFeedback = useMemo(() => {
    if (submitFeedbackMutation.isPending && submitFeedbackMutation.variables?.id) {
      return { [submitFeedbackMutation.variables.id]: true };
    }
    return {};
  }, [submitFeedbackMutation.isPending, submitFeedbackMutation.variables]);

  const firstName = user?.name?.split(' ')[0] ?? t('auth.student');

  const SIDEBAR_LINKS = useMemo(() => [
    { to: '/dashboard/student', label: t('dashboard.sidebar.dashboard'), icon: LayoutDashboard },
    { to: '/mentors', label: t('dashboard.sidebar.findMentors'), icon: Search },
    { to: '/dashboard/student/sessions', label: t('dashboard.sidebar.sessions'), icon: Video },
    { to: '/profile/edit', label: t('dashboard.sidebar.settings'), icon: Settings },
  ], [t]);

  const computeDuration = (startsAt: string, endsAt: string) =>
    Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);

  const sessions: Session[] = useMemo(() => {
    return apiSessions.map((s) => ({
      ...s,
      mentorName: s.mentor?.name ?? 'Unknown',
      mentorAvatar: s.mentor?.avatarUrl ?? undefined,
      title: s.mentor?.title ?? '',
      startTime: s.startsAt,
      duration: computeDuration(s.startsAt, s.endsAt),
    }));
  }, [apiSessions]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter((s) => s.status === 'Scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [sessions]);

  const pastSessions = useMemo(() => {
    return sessions
      .filter((s) => s.status === 'Completed' || s.status === 'Canceled' || s.status === 'Cancelled')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [sessions]);

  const filteredHistory = useMemo(() => {
    return pastSessions.filter((s) => {
      if (historyFilter === 'completed') return s.status === 'Completed';
      if (historyFilter === 'canceled') return s.status === 'Canceled' || s.status === 'Cancelled';
      return true;
    });
  }, [pastSessions, historyFilter]);

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'Completed');
    const hoursCompleted = completed.reduce((sum, s) => sum + s.duration, 0) / 60;
    const rated = completed.filter((s) => s.rating !== undefined && s.rating !== null);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length
        : 0;
    const uniqueStacks = new Set(
      completed.map((s) => s.mentor?.stack?.name).filter(Boolean)
    );
    const pendingFeedback = completed.filter((s) => s.rating === undefined || s.rating === null).length;

    return {
      hoursCompleted: hoursCompleted.toFixed(1),
      skillsMastered: uniqueStacks.size,
      avgRating: avgRating > 0 ? avgRating.toFixed(1) : '—',
      pendingTasks: upcomingSessions.length + pendingFeedback,
    };
  }, [sessions, upcomingSessions.length]);

  const skillProgress = useMemo(() => {
    const stacks = new Map<string, { completed: number; total: number }>();
    sessions.forEach((s) => {
      const stack = s.mentor?.stack?.name;
      if (!stack) return;
      const entry = stacks.get(stack) ?? { completed: 0, total: 0 };
      entry.total += 1;
      if (s.status === 'Completed') entry.completed += 1;
      stacks.set(stack, entry);
    });

    const items = Array.from(stacks.entries()).map(([name, { completed, total }]) => ({
      name,
      percent: total ? Math.round((completed / total) * 100) : 0,
    }));

    if (items.length > 0) return items.slice(0, 3);

    return [
      { name: 'React.js', percent: 72 },
      { name: 'Node.js', percent: 45 },
      { name: 'PostgreSQL', percent: 88 },
    ];
  }, [sessions]);

  const handleCancelSession = async (sessionId: string) => {
    if (!window.confirm(t('dashboard.upcoming.cancelSession') + '?')) return;

    updateStatusMutation.mutate(
      { id: sessionId, status: 'Canceled' },
      {
        onSuccess: () => {
          toast.success(t('dashboard.upcoming.cancelSession') + ' ' + t('dashboard.history.completed'));
        },
        onError: (err) => {
          toast.error(err.message || t('common.error'));
        },
      }
    );
  };

  const handleFetchMeetLink = async (sessionId: string) => {
    try {
      const result = await fetchMeetLinkMutation.mutateAsync(sessionId);
      if (result.meetLink) {
        window.open(result.meetLink, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(t('dashboard.upcoming.meetLinkUnavailable'));
      }
      return result.meetLink;
    } catch (err) {
      toast.error((err as Error).message || t('dashboard.upcoming.meetLinkUnavailable'));
      return null;
    }
  };

  const handleSubmitFeedback = async (sessionId: string) => {
    const feedbackData = feedback[sessionId];
    if (!feedbackData || feedbackData.rating === 0) {
      toast.error(t('dashboard.history.ratingRequired'));
      return;
    }

    submitFeedbackMutation.mutate(
      { id: sessionId, rating: feedbackData.rating, feedback: feedbackData.text },
      {
        onSuccess: () => {
          setFeedback((prev) => {
            const copy = { ...prev };
            delete copy[sessionId];
            return copy;
          });
          toast.success(t('dashboard.history.feedbackSuccess'));
        },
        onError: (err) => {
          toast.error(err.message || t('common.error'));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-rs-accent" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-e border-border bg-card/60 backdrop-blur-3xl min-h-screen sticky top-0">
          <div className="px-6 pt-8 pb-6">
            <p className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              {t('common.appName')}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-widest">{t('dashboard.portal')}</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              const baseClass =
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden group';
              const activeClass =
                'bg-rs-accent text-white shadow-md shadow-rs-accent/20';
              const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-muted/60';

              return (
                <Link
                  key={label}
                  to={to}
                  className={`${baseClass} ${active ? activeClass : inactiveClass}`}
                >
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-6">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-rs-danger hover:bg-rs-danger/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('dashboard.sidebar.logout')}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header Banner */}
          <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 md:px-10 pt-12 pb-10 border-b border-border bg-gradient-to-r from-rs-accent/10 via-background to-background">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {isSessionsPage ? t('dashboard.sidebar.sessions') : t('dashboard.welcome', { name: firstName })}
              </h1>
              <p className="text-base text-muted-foreground mt-2 font-medium">
                {isSessionsPage ? 'Manage all your booked sessions and history.' : t('dashboard.upcomingCount', { count: upcomingSessions.length })}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4 flex-shrink-0">
              <Link
                to="/profile/edit"
                className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full border-2 border-border/60 bg-card/50 backdrop-blur-md hover:border-rs-accent/50 hover:bg-card transition-all shadow-sm group"
              >
                <MentorAvatar name={user?.name ?? 'Student'} size="sm" />
                <span className="text-sm font-bold text-foreground group-hover:text-rs-accent transition-colors">
                  {user?.name ?? 'Student'}
                </span>
              </Link>
            </div>
          </header>

          <div className="px-6 md:px-10 py-8 md:py-10 space-y-10">
            {error && (
              <div className="p-4 bg-rs-danger/10 border border-rs-danger/30 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rs-danger flex-shrink-0" />
                <p className="text-rs-danger text-sm font-medium">{error.message}</p>
              </div>
            )}

            {/* Stat cards */}
            {!isSessionsPage && <DashboardStats stats={stats} />}

            {/* Sessions + sidebar widgets */}
            <div className={isSessionsPage ? "space-y-8" : "grid grid-cols-1 xl:grid-cols-3 gap-8"}>
              {/* Upcoming sessions */}
              <div className={isSessionsPage ? "" : "xl:col-span-2"}>
                <UpcomingSessions
                  sessions={upcomingSessions}
                  onCancel={handleCancelSession}
                  onFetchMeetLink={handleFetchMeetLink}
                  fetchingMeetLinkId={
                    fetchMeetLinkMutation.isPending
                      ? (fetchMeetLinkMutation.variables ?? null)
                      : null
                  }
                />
              </div>

              {/* Right widgets */}
              {!isSessionsPage && (
                <aside className="space-y-6">
                  {/* Learning progress */}
                  <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-rs-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <h3 className="text-lg font-bold text-foreground mb-6 relative z-10">{t('dashboard.progress.title')}</h3>
                    <div className="space-y-5 relative z-10">
                      {skillProgress.map(({ name, percent }) => (
                        <div key={name} className="group">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-foreground font-bold tracking-tight">{name}</span>
                            <span className="text-rs-accent font-bold">{percent}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden shadow-inner">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-rs-accent to-rs-accent-hover transition-all duration-500 ease-out group-hover:scale-y-110"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="w-full mt-8 py-3 text-sm font-bold rounded-xl bg-muted/50 border border-border text-foreground hover:bg-muted hover:border-rs-accent/30 transition-all relative z-10"
                    >
                      {t('dashboard.progress.viewAll')}
                    </button>
                  </div>
                </aside>
              )}
            </div>

            {/* Recent history table */}
            <SessionHistory
              sessions={filteredHistory}
              feedback={feedback}
              setFeedback={setFeedback}
              submittingFeedback={submittingFeedback}
              historyFilter={historyFilter}
              setHistoryFilter={setHistoryFilter}
              expandedNotes={expandedNotes}
              setExpandedNotes={setExpandedNotes}
              onSubmitFeedback={handleSubmitFeedback}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
