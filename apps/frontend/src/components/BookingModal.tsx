import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slot {
  start_time: string;
  end_time: string;
}

interface BookingModalProps {
  mentorName: string;
  date: string;
  slot: Slot;
  booking: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BookingModal({
  mentorName,
  date,
  slot,
  booking,
  onConfirm,
  onCancel,
}: BookingModalProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={() => !booking && onCancel()}
    >
      <div
        className="bg-card border border-border rounded-[20px] shadow-2xl w-full max-w-sm p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-foreground">
          {t('mentor.booking.confirmTitle')}
        </h3>
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
            {slot.start_time} - {slot.end_time}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onCancel}
            disabled={booking}
          >
            {t('mentor.booking.cancel')}
          </Button>
          <Button
            className="flex-1 rounded-xl bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold"
            onClick={onConfirm}
            disabled={booking}
          >
            {booking && <Loader2 className="w-4 h-4 animate-spin me-1.5" />}
            {booking ? t('mentor.booking.booking') : t('mentor.booking.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
