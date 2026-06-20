import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  Calendar,
  ClipboardList,
  Clock,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings,
  Star,
  Video,
  Wallet,
  X,
} from 'lucide-react';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';
import { useAuth } from '@/context/AuthContext';

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
  status: 'Scheduled' | 'Completed' | 'Canceled';
  startsAt: string;
  endsAt: string;
  rating?: number;
  feedback?: string;
  mentor: MentorInfo;
}

interface Session extends ApiSession {
  mentorName: string;
  mentorAvatar?: string;
  title: string;
  startTime: string;
  duration: number;
}

interface FeedbackForm {
  rating: number;
  text: string;
}

const SIDEBAR_LINKS: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/mentors', label: 'Find Mentors', icon: Search },
  { to: '#', label: 'Messages', icon: MessageSquare, disabled: true },
  { to: '/dashboard', label: 'Sessions', icon: Video },
  { to: '#', label: 'Payments', icon: Wallet, disabled: true },
  { to: '/profile/edit', label: 'Settings', icon: Settings },
  { to: '#', label: 'Help Center', icon: HelpCircle, disabled: true },
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getRelativeDateLabel(dateTime: string) {
  const date = new Date(dateTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MentorAvatar({
  name,
  avatarUrl,
  size = 'md',
}: {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-slate-700/80`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-landing-primary to-primary-container flex items-center justify-center text-white font-semibold text-sm`}
    >
      {name.charAt(0)}
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, FeedbackForm>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<Record<string, boolean>>({});
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'canceled'>('all');
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const firstName = user?.name?.split(' ')[0] ?? 'Student';

  useEffect(() => {
    fetchSessions();
  }, []);

  const computeDuration = (startsAt: string, endsAt: string) =>
    Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);

  const flattenSession = (s: ApiSession): Session => ({
    ...s,
    mentorName: s.mentor?.name ?? 'Unknown',
    mentorAvatar: s.mentor?.avatarUrl ?? undefined,
    title: s.mentor?.title ?? '',
    startTime: s.startsAt,
    duration: computeDuration(s.startsAt, s.endsAt),
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/sessions');
      setSessions((response.data || []).map(flattenSession));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const upcomingSessions = sessions
    .filter((s) => s.status === 'Scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastSessions = sessions
    .filter((s) => s.status === 'Completed' || s.status === 'Canceled')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const filteredHistory = pastSessions.filter((s) => {
    if (historyFilter === 'completed') return s.status === 'Completed';
    if (historyFilter === 'canceled') return s.status === 'Canceled';
    return true;
  });

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'Completed');
    const hoursCompleted = completed.reduce((sum, s) => sum + s.duration, 0) / 60;
    const rated = completed.filter((s) => s.rating !== undefined);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length
        : 0;
    const uniqueStacks = new Set(
      completed.map((s) => s.mentor?.stack?.name).filter(Boolean)
    );
    const pendingFeedback = completed.filter((s) => s.rating === undefined).length;

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
      { name: 'Design Systems', percent: 72 },
      { name: 'Technical Strategy', percent: 45 },
      { name: 'Soft Skills', percent: 88 },
    ];
  }, [sessions]);

  const handleCancelSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;

    try {
      await apiClient.patch(`/sessions/${sessionId}/status`, { status: 'Canceled' });
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: 'Canceled' } : s))
      );
      toast.success('Session canceled successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel session';
      toast.error(message);
    }
  };

  const handleSubmitFeedback = async (sessionId: string) => {
    const feedbackData = feedback[sessionId];
    if (!feedbackData || feedbackData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmittingFeedback((prev) => ({ ...prev, [sessionId]: true }));
      await apiClient.post(`/sessions/${sessionId}/feedback`, {
        rating: feedbackData.rating,
        feedback: feedbackData.text,
      });

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, rating: feedbackData.rating, feedback: feedbackData.text }
            : s
        )
      );

      setFeedback((prev) => {
        const copy = { ...prev };
        delete copy[sessionId];
        return copy;
      });

      toast.success('Feedback submitted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit feedback';
      toast.error(message);
    } finally {
      setSubmittingFeedback((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatDbTime = (isoString: string) => {
    const d = new Date(isoString);
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const renderStars = (sessionId: string, currentRating: number, interactive = true) => {
    const fbData = feedback[sessionId];
    const displayRating = fbData?.rating ?? currentRating ?? 0;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) =>
          interactive ? (
            <button
              key={star}
              type="button"
              onClick={() =>
                setFeedback((prev) => ({
                  ...prev,
                  [sessionId]: { ...prev[sessionId], rating: star, text: prev[sessionId]?.text ?? '' },
                }))
              }
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-5 h-5 ${
                  star <= displayRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-600 hover:text-amber-300'
                }`}
              />
            </button>
          ) : (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= displayRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
              }`}
            />
          )
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d1117]">
        <div className="flex">
          <div className="hidden lg:block w-64 border-r border-slate-800/80 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-800 rounded-lg w-32" />
              <div className="h-4 bg-slate-800/60 rounded w-24" />
            </div>
          </div>
          <div className="flex-1 p-6 md:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-slate-800 rounded-xl w-64" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-slate-800/80 rounded-2xl" />
                ))}
              </div>
              <div className="h-64 bg-slate-800/60 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d1117] text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-slate-800/80 bg-[#0b1118] min-h-[calc(100vh-3.5rem)]">
          <div className="px-6 pt-8 pb-6 border-b border-slate-800/60">
            <p className="text-lg font-bold text-slate-50">ReviewSphere</p>
            <p className="text-xs text-slate-500 mt-0.5">Mentorship Portal</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {SIDEBAR_LINKS.map(({ to, label, icon: Icon, disabled }) => {
              const active = !disabled && location.pathname === to;
              const baseClass =
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative';
              const activeClass =
                'bg-indigo-500/10 text-primary-fixed-dim border-r-2 border-landing-primary mr-[-1px]';
              const inactiveClass = 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40';
              const disabledClass = 'text-slate-600 cursor-not-allowed opacity-60';

              if (disabled) {
                return (
                  <span key={label} className={`${baseClass} ${disabledClass}`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                );
              }

              return (
                <Link
                  key={label}
                  to={to}
                  className={`${baseClass} ${active ? activeClass : inactiveClass}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-6">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="flex items-start justify-between gap-4 px-6 md:px-8 pt-8 pb-6 border-b border-slate-800/60">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                You have{' '}
                <span className="text-slate-200 font-medium">{upcomingSessions.length}</span>{' '}
                upcoming session{upcomingSessions.length !== 1 ? 's' : ''} this week.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                className="relative p-2 rounded-xl border border-slate-800 bg-[#161b22] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {upcomingSessions.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {Math.min(upcomingSessions.length, 9)}
                  </span>
                )}
              </button>

              <Link
                to="/profile/edit"
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-800 bg-[#161b22] hover:border-slate-700 transition-colors"
              >
                <MentorAvatar name={user?.name ?? 'Student'} size="sm" />
                <span className="text-sm font-medium text-slate-200 hidden sm:inline">
                  {user?.name ?? 'Student'}
                </span>
              </Link>
            </div>
          </header>

          <div className="px-6 md:px-8 py-6 md:py-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Hours Completed', value: stats.hoursCompleted, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: 'Skills Mastered', value: stats.skillsMastered, icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Average Rating', value: stats.avgRating, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Pending Tasks', value: String(stats.pendingTasks).padStart(2, '0'), icon: ClipboardList, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-[#161b22] border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{label}</p>
                      <p className="text-2xl font-bold text-slate-50 mt-0.5">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sessions + sidebar widgets */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Upcoming sessions */}
              <section className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-100">Upcoming Sessions</h2>
                  <button
                    type="button"
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    View Calendar
                  </button>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="bg-[#161b22] border border-slate-800/80 rounded-2xl p-10 text-center">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
                    <p className="text-slate-400">No upcoming sessions scheduled</p>
                    <Link
                      to="/mentors"
                      className="inline-block mt-4 text-sm font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      Find a mentor →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session, index) => {
                      const startDb = formatDbTime(session.startTime);
                      const endDb = formatDbTime(session.endsAt);
                      const dateLabel = getRelativeDateLabel(session.startTime);
                      const isPrimary = index === 0;

                      return (
                        <div
                          key={session.id}
                          className={`bg-[#161b22] border rounded-2xl p-5 shadow-lg shadow-black/20 transition-colors ${
                            isPrimary
                              ? 'border-l-4 border-l-landing-primary border-slate-800/80'
                              : 'border-slate-800/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <MentorAvatar name={session.mentorName} avatarUrl={session.mentorAvatar} />
                              <div className="min-w-0">
                                <h3 className="font-semibold text-slate-100 truncate">
                                  {session.mentorName}
                                </h3>
                                <p className="text-sm text-slate-400 truncate">{session.title}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                                    {dateLabel}, {startDb} – {endDb}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {session.duration} mins
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCancelSession(session.id)}
                                className="px-4 py-2 text-sm font-medium rounded-xl border border-red-800/60 text-red-300 hover:bg-red-950/30 hover:border-red-700 transition-colors"
                              >
                                Cancel Session
                              </button>
                              {isPrimary && (
                                <button
                                  type="button"
                                  disabled
                                  className="px-4 py-2 text-sm font-medium rounded-xl bg-primary-container text-on-primary hover:bg-primary-container/90 disabled:opacity-60 transition-colors"
                                >
                                  Join Meeting
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Right widgets */}
              <aside className="space-y-4">
                {/* Learning progress */}
                <div className="bg-[#161b22] border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
                  <h3 className="text-base font-semibold text-slate-100 mb-4">Learning Progress</h3>
                  <div className="space-y-4">
                    {skillProgress.map(({ name, percent }) => (
                      <div key={name}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-slate-300">{name}</span>
                          <span className="text-slate-500 font-medium">{percent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-landing-primary to-primary-container transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full mt-5 py-2.5 text-sm font-medium rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/50 transition-colors"
                  >
                    View All Skills
                  </button>
                </div>

                {/* Find mentors CTA */}
                <div className="relative overflow-hidden bg-gradient-to-br from-landing-primary to-landing-secondary rounded-2xl p-6 shadow-lg shadow-indigo-950/40">
                  <Search className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" />
                  <h3 className="text-lg font-semibold text-white relative z-10">
                    Find New Mentors
                  </h3>
                  <p className="text-sm text-indigo-100/80 mt-2 relative z-10">
                    Discover experts tailored to your learning goals and career path.
                  </p>
                  <Link
                    to="/mentors"
                    className="inline-block mt-4 px-4 py-2 text-sm font-semibold rounded-xl bg-white text-landing-primary hover:bg-indigo-50 transition-colors relative z-10"
                  >
                    Explore Catalog
                  </Link>
                </div>
              </aside>
            </div>

            {/* Recent history table */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-semibold text-slate-100">Recent History</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={historyFilter}
                    onChange={(e) =>
                      setHistoryFilter(e.target.value as 'all' | 'completed' | 'canceled')
                    }
                    className="text-sm bg-[#161b22] border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Sessions</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                  <Link
                    to="/mentors"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-700 bg-[#161b22] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"
                    aria-label="Book new session"
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="bg-[#161b22] border border-slate-800/80 rounded-2xl p-10 text-center">
                  <p className="text-slate-400 text-sm">No session history yet</p>
                </div>
              ) : (
                <div className="bg-[#161b22] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-left">
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Mentor
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Date
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Evaluation
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Status
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredHistory.map((session) => {
                          const { date } = formatDateTime(session.startTime);
                          const fbData = feedback[session.id];
                          const hasExistingFeedback = session.rating !== undefined;
                          const isEditingFeedback = !!fbData;
                          const isExpanded = expandedNotes === session.id;

                          return (
                            <Fragment key={session.id}>
                              <tr className="hover:bg-slate-800/20 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <MentorAvatar
                                      name={session.mentorName}
                                      avatarUrl={session.mentorAvatar}
                                      size="sm"
                                    />
                                    <div>
                                      <p className="font-medium text-slate-200">{session.mentorName}</p>
                                      <p className="text-xs text-slate-500">{session.title}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-slate-400 whitespace-nowrap">{date}</td>
                                <td className="px-5 py-4">
                                  {session.status === 'Completed' ? (
                                    renderStars(session.id, session.rating ?? 0, false)
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      session.status === 'Completed'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-slate-700/40 text-slate-400 border border-slate-600/40'
                                    }`}
                                  >
                                    {session.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  {session.status === 'Completed' ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedNotes(isExpanded ? null : session.id)
                                      }
                                      className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                      {isExpanded ? 'Hide Notes' : 'View Notes'}
                                    </button>
                                  ) : (
                                    <span className="text-slate-600 text-sm">—</span>
                                  )}
                                </td>
                              </tr>

                              {isExpanded && session.status === 'Completed' && (
                                <tr>
                                  <td colSpan={5} className="px-5 pb-5 pt-0">
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
                                      {hasExistingFeedback && !isEditingFeedback ? (
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Your rating:</span>
                                            {renderStars(session.id, session.rating ?? 0, false)}
                                          </div>
                                          {session.feedback && (
                                            <p className="text-sm text-slate-300">{session.feedback}</p>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setFeedback((prev) => ({
                                                ...prev,
                                                [session.id]: {
                                                  rating: session.rating || 0,
                                                  text: session.feedback || '',
                                                },
                                              }))
                                            }
                                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                                          >
                                            Edit Feedback
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-2">
                                              Rate this session
                                            </label>
                                            {renderStars(session.id, session.rating || 0)}
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-2">
                                              Your feedback (optional)
                                            </label>
                                            <textarea
                                              value={fbData?.text || ''}
                                              onChange={(e) =>
                                                setFeedback((prev) => ({
                                                  ...prev,
                                                  [session.id]: {
                                                    rating: prev[session.id]?.rating || 0,
                                                    text: e.target.value,
                                                  },
                                                }))
                                              }
                                              placeholder="Share your experience with this mentor..."
                                              className="w-full px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm resize-none focus:ring-1 focus:ring-indigo-500/20"
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex gap-3">
                                            <button
                                              type="button"
                                              onClick={() => handleSubmitFeedback(session.id)}
                                              disabled={submittingFeedback[session.id]}
                                              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
                                            >
                                              <Send className="w-4 h-4" />
                                              Submit
                                            </button>
                                            {hasExistingFeedback && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setFeedback((prev) => {
                                                    const copy = { ...prev };
                                                    delete copy[session.id];
                                                    return copy;
                                                  })
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
                                              >
                                                <X className="w-4 h-4" />
                                                Cancel
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
