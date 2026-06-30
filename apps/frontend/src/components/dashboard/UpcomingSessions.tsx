import { useTranslation } from 'react-i18next';
import { Calendar, Video, Clock } from 'lucide-react';
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
  meetLink?: string | null;
  mentorName: string;
  mentorAvatar?: string;
  title: string;
  startTime: string;
  duration: number;
}

interface UpcomingSessionsProps {
  sessions: Session[];
  onCancel: (id: string) => Promise<void>;
  onFetchMeetLink?: (id: string) => Promise<string | null>;
  fetchingMeetLinkId?: string | null;
}

export default function UpcomingSessions({
  sessions,
  onCancel,
  onFetchMeetLink,
  fetchingMeetLinkId,
}: UpcomingSessionsProps) {
  const { t, i18n } = useTranslation();

  const isSameUTCDay = (a: Date, b: Date) => {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  };

  const getRelativeDateLabel = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    if (isSameUTCDay(date, now)) return t('dashboard.upcoming.today');
    if (isSameUTCDay(date, tomorrow)) return t('dashboard.upcoming.tomorrow');
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  /** Format a stored UTC ISO string as "h:mm AM/PM" */
  const formatDbTime = (isoString: string) => {
    const d = new Date(isoString);
    const hour = d.getUTCHours();
    const minute = d.getUTCMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-rs-accent" />
          {t('dashboard.upcoming.title')}
        </h2>
        <Link
          to="/dashboard/student/sessions"
          className="text-sm text-rs-accent hover:text-rs-accent-hover font-semibold transition-colors"
        >
          {t('dashboard.upcoming.viewCalendar')}
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-card/40 backdrop-blur-md border-2 border-dashed border-border rounded-3xl p-12 text-center shadow-inner">
          <Calendar className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium text-lg">{t('dashboard.upcoming.empty')}</p>
          <Link
            to="/mentors"
            className="inline-block mt-5 px-6 py-2.5 rounded-xl bg-rs-accent text-white font-semibold shadow-md shadow-rs-accent/20 hover:shadow-lg hover:shadow-rs-accent/30 hover:-translate-y-0.5 transition-all"
          >
            {t('dashboard.upcoming.findMentor')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {sessions.map((session, index) => {
            const startDb = formatDbTime(session.startTime);
            const endDb = formatDbTime(session.endsAt);
            const dateLabel = getRelativeDateLabel(session.startTime);
            const isPrimary = index === 0;

            return (
              <div
                key={session.id}
                className={`group relative bg-card/60 backdrop-blur-xl border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  isPrimary
                    ? 'border-rs-accent/50'
                    : 'border-border hover:border-rs-accent/30'
                }`}
              >
                {/* Background accent glow for next session */}
                {isPrimary && (
                  <div className="absolute inset-0 bg-gradient-to-r from-rs-accent/5 via-rs-accent/5 to-transparent pointer-events-none" />
                )}

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Info Section */}
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className="relative">
                      <MentorAvatar
                        name={session.mentorName}
                        avatarUrl={session.mentorAvatar}
                      />
                      {isPrimary && (
                        <div className="absolute -bottom-1 -end-1 w-3.5 h-3.5 bg-rs-success border-2 border-card rounded-full shadow-sm" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-foreground truncate group-hover:text-rs-accent transition-colors">
                        {session.mentorName}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground truncate mb-3">{session.title}</p>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rs-accent/10 text-rs-accent border border-rs-accent/20 shadow-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {startDb} – {endDb}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-3 md:flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onCancel(session.id)}
                      className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-rs-danger/20 text-rs-danger hover:bg-rs-danger/5 hover:border-rs-danger/40 transition-colors"
                    >
                      {t('dashboard.upcoming.cancelSession')}
                    </button>
                    {session.meetLink ? (
                      <a
                        href={session.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-rs-accent hover:bg-rs-accent-hover text-white transition-all shadow-md shadow-rs-accent/20 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        {t('dashboard.upcoming.joinMeeting')}
                      </a>
                    ) : onFetchMeetLink ? (
                      <button
                        type="button"
                        onClick={() => onFetchMeetLink(session.id)}
                        disabled={fetchingMeetLinkId === session.id}
                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-rs-accent hover:bg-rs-accent-hover text-white transition-all shadow-md shadow-rs-accent/20 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                        title={t('dashboard.upcoming.meetLinkPending')}
                      >
                        <Video className="w-4 h-4" />
                        {fetchingMeetLinkId === session.id
                          ? t('dashboard.upcoming.fetchingMeetLink')
                          : t('dashboard.upcoming.getMeetLink')}
                      </button>
                    ) : (
                      <span
                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-rs-accent/50 text-white/70 flex items-center gap-2 cursor-not-allowed"
                        title={t('dashboard.upcoming.meetLinkPending')}
                      >
                        <Video className="w-4 h-4" />
                        {t('dashboard.upcoming.joinMeeting')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
