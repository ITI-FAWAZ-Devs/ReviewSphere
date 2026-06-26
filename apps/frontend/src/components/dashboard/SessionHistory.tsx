import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import MentorAvatar from './MentorAvatar';

interface Session {
  id: string;
  mentorId: string;
  studentId: string;
  status: 'Scheduled' | 'Completed' | 'Canceled' | 'Cancelled';
  startsAt: string;
  endsAt: string;
  rating?: number | null;
  feedback?: string | null;
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

interface SessionHistoryProps {
  sessions: Session[];
  feedback: Record<string, FeedbackForm>;
  setFeedback: React.Dispatch<React.SetStateAction<Record<string, FeedbackForm>>>;
  submittingFeedback: Record<string, boolean>;
  historyFilter: 'all' | 'completed' | 'canceled';
  setHistoryFilter: (filter: 'all' | 'completed' | 'canceled') => void;
  expandedNotes: string | null;
  setExpandedNotes: (id: string | null) => void;
  onSubmitFeedback: (id: string) => Promise<void>;
}

export default function SessionHistory({
  sessions,
  feedback,
  setFeedback,
  submittingFeedback,
  historyFilter,
  setHistoryFilter,
  expandedNotes,
  setExpandedNotes,
  onSubmitFeedback,
}: SessionHistoryProps) {
  const { t, i18n } = useTranslation();

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
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

  const renderStars = (sessionId: string, currentRating: number, interactive = true) => {
    const fbData = feedback[sessionId];
    const displayRating = fbData?.rating ?? currentRating ?? 0;

    return (
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) =>
          interactive ? (
            <button
              key={star}
              type="button"
              onClick={() =>
                setFeedback((prev) => ({
                  ...prev,
                  [sessionId]: {
                    ...prev[sessionId],
                    rating: star,
                    text: prev[sessionId]?.text ?? '',
                  },
                }))
              }
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-5 h-5 ${
                  star <= displayRating
                    ? 'fill-rs-warning text-rs-warning'
                    : 'text-muted-foreground hover:text-rs-warning'
                }`}
              />
            </button>
          ) : (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= displayRating ? 'fill-rs-warning text-rs-warning' : 'text-muted-foreground/30'
              }`}
            />
          )
        )}
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">{t('dashboard.history.title')}</h2>
        <div className="flex items-center gap-3">
          <select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value as 'all' | 'completed' | 'canceled')}
            className="text-sm bg-muted border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-rs-accent cursor-pointer"
          >
            <option value="all">{t('dashboard.history.all')}</option>
            <option value="completed">{t('dashboard.history.completed')}</option>
            <option value="canceled">{t('dashboard.history.canceled')}</option>
          </select>
          <Link
            to="/mentors"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-rs-accent hover:border-rs-accent transition-colors"
            aria-label={t('dashboard.history.rateSession')}
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <p className="text-muted-foreground text-sm">{t('dashboard.history.empty')}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">
                    {t('dashboard.history.mentor')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">
                    {t('dashboard.history.date')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">
                    {t('dashboard.history.evaluation')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">
                    {t('dashboard.history.status')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">
                    {t('dashboard.history.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessions.map((session) => {
                  const { date } = formatDateTime(session.startTime);
                  const fbData = feedback[session.id];
                  const hasExistingFeedback = session.rating !== undefined;
                  const isEditingFeedback = !!fbData;
                  const isExpanded = expandedNotes === session.id;

                  return (
                    <Fragment key={session.id}>
                      <tr className="hover:bg-muted/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <MentorAvatar
                              name={session.mentorName}
                              avatarUrl={session.mentorAvatar}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-foreground">{session.mentorName}</p>
                              <p className="text-xs text-muted-foreground">{session.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap font-mono">{date}</td>
                        <td className="px-5 py-4">
                          {session.status === 'Completed' ? (
                            renderStars(session.id, session.rating ?? 0, false)
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              session.status === 'Completed'
                                ? 'bg-rs-success/10 text-rs-success border border-rs-success/20'
                                : 'bg-muted text-muted-foreground border border-border'
                            }`}
                          >
                            {session.status === 'Completed'
                              ? t('dashboard.history.completed')
                              : t('dashboard.history.canceled')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {session.status === 'Completed' ? (
                            <button
                              type="button"
                              onClick={() => setExpandedNotes(isExpanded ? null : session.id)}
                              className="text-sm font-medium text-rs-accent hover:text-rs-accent-hover transition-colors"
                            >
                              {isExpanded ? t('dashboard.history.hideNotes') : t('dashboard.history.viewNotes')}
                            </button>
                          ) : (
                            <span className="text-muted-foreground/30 text-sm">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && session.status === 'Completed' && (
                        <tr>
                          <td colSpan={5} className="px-5 pb-5 pt-0">
                            <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-4">
                              {hasExistingFeedback && !isEditingFeedback ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{t('dashboard.history.yourRating')}:</span>
                                    {renderStars(session.id, session.rating ?? 0, false)}
                                  </div>
                                  {session.feedback && (
                                    <p className="text-sm text-foreground">{session.feedback}</p>
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
                                    className="text-sm text-rs-accent hover:text-rs-accent-hover font-medium"
                                  >
                                    {t('dashboard.history.editFeedback')}
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                                      {t('dashboard.history.rateSession')}
                                    </label>
                                    {renderStars(session.id, session.rating || 0)}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                                      {t('dashboard.history.feedbackLabel')}
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
                                      placeholder={t('dashboard.history.feedbackPlaceholder')}
                                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-rs-accent focus:outline-none text-sm resize-none focus:ring-1 focus:ring-rs-accent/20"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      type="button"
                                      onClick={() => onSubmitFeedback(session.id)}
                                      disabled={submittingFeedback[session.id]}
                                      className="flex items-center gap-2 px-4 py-2 bg-rs-accent text-white hover:bg-rs-accent-hover disabled:opacity-50 rounded-xl text-sm font-semibold transition-all duration-150"
                                    >
                                      <Send className="w-4 h-4" />
                                      {t('dashboard.history.submit')}
                                    </button>
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
  );
}
