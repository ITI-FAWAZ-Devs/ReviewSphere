import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Send, History } from 'lucide-react';
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
  evaluationNotes?: string | null;
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
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      time: date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
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
                    ? 'fill-rs-warning text-rs-warning drop-shadow-sm'
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
    <section className="space-y-6 pt-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-rs-accent" />
          {t('dashboard.history.title')}
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value as 'all' | 'completed' | 'canceled')}
            className="text-sm font-semibold bg-card border-2 border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-rs-accent cursor-pointer shadow-sm"
          >
            <option value="all">{t('dashboard.history.all')}</option>
            <option value="completed">{t('dashboard.history.completed')}</option>
            <option value="canceled">{t('dashboard.history.canceled')}</option>
          </select>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-card/40 backdrop-blur-md border-2 border-dashed border-border rounded-3xl p-12 text-center shadow-inner">
          <History className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium text-lg">{t('dashboard.history.empty')}</p>
        </div>
      ) : (
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start bg-muted/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-start">
                    {t('dashboard.history.mentor')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-start">
                    {t('dashboard.history.date')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-start">
                    {t('dashboard.history.evaluation')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-start">
                    {t('dashboard.history.status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-start">
                    {t('dashboard.history.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sessions.map((session) => {
                  const { date } = formatDateTime(session.startTime);
                  const fbData = feedback[session.id];
                  const hasExistingFeedback = session.rating !== undefined && session.rating !== null;
                  const isEditingFeedback = !!fbData;
                  const isExpanded = expandedNotes === session.id;

                  return (
                    <Fragment key={session.id}>
                      <tr className="hover:bg-muted/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <MentorAvatar
                              name={session.mentorName}
                              avatarUrl={session.mentorAvatar}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-foreground group-hover:text-rs-accent transition-colors">{session.mentorName}</p>
                              <p className="text-xs font-medium text-muted-foreground">{session.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-muted-foreground whitespace-nowrap font-mono font-medium">{date}</td>
                        <td className="px-6 py-5">
                          {session.status === 'Completed' ? (
                            renderStars(session.id, session.rating ?? 0, false)
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                              session.status === 'Completed'
                                ? 'bg-rs-success/10 text-rs-success border border-rs-success/20 shadow-sm'
                                : 'bg-muted text-muted-foreground border border-border shadow-sm'
                            }`}
                          >
                            {session.status === 'Completed'
                              ? t('dashboard.history.completed')
                              : t('dashboard.history.canceled')}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {session.status === 'Completed' ? (
                            <button
                              type="button"
                              onClick={() => setExpandedNotes(isExpanded ? null : session.id)}
                              className="text-sm font-bold text-rs-accent hover:text-rs-accent-hover transition-colors px-3 py-1.5 rounded-lg hover:bg-rs-accent/10"
                            >
                              {isExpanded ? t('dashboard.history.hideNotes') : t('dashboard.history.viewNotes')}
                            </button>
                          ) : (
                            <span className="text-muted-foreground/30 text-sm font-medium">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && session.status === 'Completed' && (
                        <tr>
                          <td colSpan={5} className="px-6 pb-6 pt-0 border-b-0">
                            <div className="bg-background border-2 border-border rounded-2xl p-6 space-y-6 shadow-inner mt-2">
                              {session.evaluationNotes && (
                                <div className="space-y-3 pb-6 border-b border-border">
                                  <h4 className="text-xs font-bold text-rs-accent uppercase tracking-widest flex items-center gap-2">
                                    <Star className="w-3.5 h-3.5" />
                                    {t('dashboard.history.evaluationNotes', 'Evaluation Notes')}
                                  </h4>
                                  <p className="text-sm text-foreground font-medium whitespace-pre-wrap leading-relaxed">{session.evaluationNotes}</p>
                                </div>
                              )}
                              
                              {hasExistingFeedback && !isEditingFeedback ? (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('dashboard.history.yourRating')}:</span>
                                    {renderStars(session.id, session.rating ?? 0, false)}
                                  </div>
                                  {session.feedback && (
                                    <p className="text-sm text-foreground font-medium leading-relaxed italic border-s-4 border-rs-accent/30 pl-4 py-1">{session.feedback}</p>
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
                                    className="text-sm text-rs-accent hover:text-rs-accent-hover font-bold inline-flex items-center gap-1 mt-2"
                                  >
                                    {t('dashboard.history.editFeedback')}
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-5 bg-card border border-border rounded-xl p-5 shadow-sm">
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                      {t('dashboard.history.rateSession')}
                                    </label>
                                    {renderStars(session.id, session.rating || 0)}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
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
                                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-foreground font-medium placeholder-muted-foreground focus:border-rs-accent focus:outline-none text-sm resize-none focus:ring-1 focus:ring-rs-accent/20 transition-all"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      type="button"
                                      onClick={() => onSubmitFeedback(session.id)}
                                      disabled={submittingFeedback[session.id]}
                                      className="flex items-center gap-2 px-5 py-2.5 bg-rs-accent text-white hover:bg-rs-accent-hover disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-md shadow-rs-accent/20 hover:shadow-lg"
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
