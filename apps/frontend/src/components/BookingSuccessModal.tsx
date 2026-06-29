import { useTranslation } from 'react-i18next';
import { CheckCircle, Copy, ExternalLink, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface BookingSuccessModalProps {
  mentorName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink?: string | null;
  onClose: () => void;
}

export default function BookingSuccessModal({
  mentorName,
  date,
  startTime,
  endTime,
  meetLink,
  onClose,
}: BookingSuccessModalProps) {
  const { t } = useTranslation();

  const copyMeetLink = async () => {
    if (!meetLink) return;
    try {
      await navigator.clipboard.writeText(meetLink);
      toast.success(t('mentor.booking.meetLinkCopied'));
    } catch {
      toast.error(t('mentor.booking.copyFailed'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-[20px] shadow-2xl w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-rs-success flex-shrink-0" />
          <h3 className="text-lg font-bold text-foreground">
            {t('mentor.booking.success')}
          </h3>
        </div>

        <div className="space-y-2 text-sm text-foreground">
          <p>
            <span className="text-muted-foreground">{t('mentor.booking.mentor')}</span>{' '}
            {mentorName}
          </p>
          <p>
            <span className="text-muted-foreground">{t('mentor.booking.date')}</span>{' '}
            {date}
          </p>
          <p>
            <span className="text-muted-foreground">{t('mentor.booking.time')}</span>{' '}
            {startTime} - {endTime}
          </p>
        </div>

        {meetLink ? (
          <div className="space-y-3 rounded-xl bg-rs-success/5 border border-rs-success/20 p-4">
            <p className="text-sm text-muted-foreground">{t('mentor.booking.meetLinkSent')}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-[10px] bg-rs-accent hover:bg-rs-accent-hover text-white transition-colors"
              >
                <Video className="w-4 h-4" />
                {t('mentor.booking.joinMeet')}
              </a>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-[10px]"
                onClick={copyMeetLink}
              >
                <Copy className="w-4 h-4 me-1.5" />
                {t('mentor.booking.copyMeetLink')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('mentor.booking.meetLinkPending')}</p>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            {t('mentor.booking.close')}
          </Button>
          <Button
            asChild
            className="flex-1 rounded-xl bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold"
          >
            <a href="/dashboard/student">
              <ExternalLink className="w-4 h-4 me-1.5" />
              {t('mentor.booking.goToDashboard')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
