import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Star,
  Settings,
  LayoutDashboard,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2,
  Video,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserSessions, useUpdateSessionStatus } from '@/hooks/useSessions';
import { toast } from '@/lib/toast';
import MentorAvatar from '@/components/dashboard/MentorAvatar';
import { Button } from '@/components/ui/button';

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const { data: apiSessions = [], isLoading, error } = useUserSessions();
  const updateStatusMutation = useUpdateSessionStatus();

  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'canceled'>('all');
  const [evaluationSessionId, setEvaluationSessionId] = useState<string | null>(null);
  const [evalNotes, setEvalNotes] = useState('');

  const firstName = user?.name?.split(' ')[0] ?? t('auth.mentor');

  const SIDEBAR_LINKS = useMemo(() => [
    { to: '/dashboard/mentor', label: t('dashboard.sidebar.dashboard'), icon: LayoutDashboard },
    { to: '/profile/edit', label: t('dashboard.sidebar.settings'), icon: Settings },
  ], [t]);

  const computeDuration = (startsAt: string, endsAt: string) =>
    Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);

  const sessions = useMemo(() => {
    return apiSessions.map((s) => ({
      ...s,
      studentName: s.student?.name ?? 'Unknown Student',
      studentEmail: s.student?.user?.email ?? '',
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
    const rated = completed.filter((s) => s.rating != null);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length
        : 0;

    return {
      hoursCompleted: hoursCompleted.toFixed(1),
      skillsMastered: completed.length, // Total sessions completed
      avgRating: avgRating > 0 ? avgRating.toFixed(1) : '—',
      pendingTasks: upcomingSessions.length,
    };
  }, [sessions, upcomingSessions.length]);

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

  const handleCompleteSessionSubmit = () => {
    if (!evaluationSessionId) return;

    updateStatusMutation.mutate(
      { id: evaluationSessionId, status: 'Completed', evaluationNotes: evalNotes },
      {
        onSuccess: () => {
          toast.success('Session completed with evaluation notes.');
          setEvaluationSessionId(null);
          setEvalNotes('');
        },
        onError: (err) => {
          toast.error(err.message || t('common.error'));
        },
      }
    );
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
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
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-e border-border bg-card h-full min-h-[calc(100vh-3.5rem)]">
          <div className="flex-1 py-6 px-4 space-y-7">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                {t('dashboard.portal')}
              </p>
              <nav className="space-y-1">
                {SIDEBAR_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                        isActive
                          ? 'bg-rs-accent/15 text-rs-accent font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="p-4 border-t border-border">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-muted-foreground hover:text-rs-danger hover:bg-rs-danger/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('dashboard.sidebar.logout')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card/45 backdrop-blur-md px-6 md:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t('dashboard.welcome', { name: firstName })}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your scheduled code reviews and mentor evaluations.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/profile/edit">
                <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Update Settings
                </Button>
              </Link>
            </div>
          </header>

          <div className="px-6 md:px-8 py-6 md:py-8 space-y-8">
            {error && (
              <div className="p-4 bg-rs-danger/10 border border-rs-danger/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rs-danger flex-shrink-0" />
                <p className="text-rs-danger text-sm">{error.message}</p>
              </div>
            )}

            {/* Performance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rs-accent/10 flex items-center justify-center text-rs-accent">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('dashboard.stats.avgRating')}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{stats.avgRating}</p>
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rs-success/10 flex items-center justify-center text-rs-success">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('dashboard.stats.hoursCompleted')}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{stats.hoursCompleted}h</p>
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rs-warning/10 flex items-center justify-center text-rs-warning">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Sessions</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{stats.skillsMastered}</p>
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('dashboard.stats.pendingTasks')}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{stats.pendingTasks}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Student Sessions */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Student Bookings</h2>
              {upcomingSessions.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-10 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
                  <p className="text-muted-foreground">No upcoming student sessions booked yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => {
                    const startInfo = formatDateTime(session.startTime);
                    const endInfo = formatDateTime(session.endsAt);
                    return (
                      <div key={session.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <MentorAvatar name={session.studentName} />
                            <div>
                              <h3 className="font-semibold text-foreground">{session.studentName}</h3>
                              <p className="text-xs text-muted-foreground font-mono">{session.studentEmail}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rs-accent/10 text-rs-accent border border-rs-accent/20">
                                  {startInfo.date}, {startInfo.time} - {endInfo.time}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">{session.duration} mins</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.meetLink && (
                              <a
                                href={session.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rs-success hover:bg-rs-success/90 text-white transition-colors flex items-center gap-1.5"
                              >
                                <Video className="w-3.5 h-3.5" />
                                {t('dashboard.upcoming.joinGoogleMeet')}
                              </a>
                            )}
                            <button
                              onClick={() => handleCancelSession(session.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rs-danger/30 text-rs-danger hover:bg-rs-danger/10 transition-colors"
                            >
                              Cancel Booking
                            </button>
                            <button
                              onClick={() => setEvaluationSessionId(session.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rs-accent hover:bg-rs-accent-hover text-white transition-colors"
                            >
                              Complete & Evaluate
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Session History & Student Feedback */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-semibold text-foreground">Session History & Reviews</h2>
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as any)}
                  className="text-sm bg-muted border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-rs-accent cursor-pointer"
                >
                  <option value="all">All Logs</option>
                  <option value="completed">Completed Only</option>
                  <option value="canceled">Canceled Only</option>
                </select>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-10 text-center">
                  <p className="text-muted-foreground text-sm">No session history matches this filter.</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-start">
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Student</th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Date</th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Student Rating</th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Evaluation Notes</th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredHistory.map((session) => {
                          const { date } = formatDateTime(session.startTime);
                          return (
                            <tr key={session.id} className="hover:bg-muted/40 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <MentorAvatar name={session.studentName} size="sm" />
                                  <div>
                                    <p className="font-medium text-foreground">{session.studentName}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{session.studentEmail}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-muted-foreground whitespace-nowrap font-mono">{date}</td>
                              <td className="px-5 py-4">
                                {session.status === 'Completed' && session.rating != null ? (
                                  <div className="flex gap-0.5 text-rs-warning">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={`w-4 h-4 ${i < (session.rating ?? 0) ? 'fill-current' : 'opacity-20'}`} />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/30">—</span>
                                )}
                                {session.feedback && (
                                  <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">{session.feedback}</p>
                                )}
                              </td>
                              <td className="px-5 py-4 text-muted-foreground max-w-xs">
                                {session.evaluationNotes ? (
                                  <p className="text-sm font-medium text-foreground line-clamp-2">{session.evaluationNotes}</p>
                                ) : (
                                  <span className="text-muted-foreground/35 italic">No evaluation notes added</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  session.status === 'Completed'
                                    ? 'bg-rs-success/10 text-rs-success border border-rs-success/20'
                                    : 'bg-muted text-muted-foreground border border-border'
                                }`}>
                                  {session.status === 'Completed' ? 'Completed' : 'Cancelled'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Complete & Evaluate Modal */}
      {evaluationSessionId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Session Evaluation Notes</h3>
            <p className="text-xs text-muted-foreground">
              Provide feedback and summary notes regarding the student's progress or issues reviewed during this session.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Evaluation Notes
              </label>
              <textarea
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                placeholder="Write technical feedback, recommendations, or review summaries..."
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-rs-accent focus:outline-none text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setEvaluationSessionId(null);
                  setEvalNotes('');
                }}
                className="px-4 py-2 border border-border text-muted-foreground hover:bg-muted font-semibold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSessionSubmit}
                disabled={!evalNotes.trim() || updateStatusMutation.isPending}
                className="px-4 py-2 bg-rs-accent text-white hover:bg-rs-accent-hover font-semibold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Complete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
