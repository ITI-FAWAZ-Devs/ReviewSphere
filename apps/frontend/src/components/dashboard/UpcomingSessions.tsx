import { useTranslation } from 'react-i18next';
import { Calendar, Video } from 'lucide-react';
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

interface UpcomingSessionsProps {
  sessions: Session[];
  onCancel: (id: string) => Promise<void>;
}

export default function UpcomingSessions({ sessions, onCancel }: UpcomingSessionsProps) {
  const { t, i18n } = useTranslation();

  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getRelativeDateLabel = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isSameDay(date, now)) return t('dashboard.upcoming.today');
    if (isSameDay(date, tomorrow)) return t('dashboard.upcoming.tomorrow');
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDbTime = (isoString: string) => {
    const d = new Date(isoString);
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t('dashboard.upcoming.title')}</h2>
        <button
          type="button"
          className="text-sm text-rs-accent hover:text-rs-accent-hover font-medium transition-colors"
        >
          {t('dashboard.upcoming.viewCalendar')}
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <p className="text-muted-foreground">{t('dashboard.upcoming.empty')}</p>
          <Link
            to="/mentors"
            className="inline-block mt-4 text-sm font-medium text-rs-accent hover:text-rs-accent-hover"
          >
            {t('dashboard.upcoming.findMentor')} &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => {
            const startDb = formatDbTime(session.startTime);
            const endDb = formatDbTime(session.endsAt);
            const dateLabel = getRelativeDateLabel(session.startTime);
            const isPrimary = index === 0;

            return (
              <div
                key={session.id}
                className={`bg-card border rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                  isPrimary
                    ? 'border-s-4 border-s-rs-accent border-border'
                    : 'border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <MentorAvatar
                      name={session.mentorName}
                      avatarUrl={session.mentorAvatar}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {session.mentorName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{session.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-rs-accent/10 text-rs-accent border border-rs-accent/20">
                          {dateLabel}, {startDb} – {endDb}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {session.duration} {t('dashboard.upcoming.mins')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onCancel(session.id)}
                      className="px-4 py-2 text-sm font-semibold rounded-[10px] border border-rs-danger/30 text-rs-danger bg-rs-danger/5 hover:bg-rs-danger/10 transition-colors"
                    >
                      {t('dashboard.upcoming.cancelSession')}
                    </button>
                    {isPrimary && (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 text-sm font-semibold rounded-[10px] bg-rs-accent hover:bg-rs-accent-hover text-white disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <Video className="w-4 h-4" />
                        {t('dashboard.upcoming.joinMeeting')}
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
  );
}
