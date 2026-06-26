import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Clock } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AvailabilityBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface AvailabilityManagerProps {
  availabilities: AvailabilityBlock[];
  onChange: (next: AvailabilityBlock[]) => void;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export default function AvailabilityManager({
  availabilities,
  onChange,
}: AvailabilityManagerProps) {
  const { t } = useTranslation();
  const [newDay, setNewDay] = useState<number>(1);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');

  const handleAddSlot = () => {
    const startMin = parseTimeToMinutes(newStartTime);
    const endMin = parseTimeToMinutes(newEndTime);

    if (startMin >= endMin) {
      toast.error(t('profile.availability.timeOrderError'));
      return;
    }
    if (endMin - startMin < 45) {
      toast.error(t('profile.availability.durationError'));
      return;
    }
    const hasOverlap = availabilities.some(
      (a) =>
        a.day_of_week === newDay &&
        startMin < parseTimeToMinutes(a.end_time) &&
        endMin > parseTimeToMinutes(a.start_time)
    );
    if (hasOverlap) {
      toast.error(t('profile.availability.overlapError'));
      return;
    }

    const next = [
      ...availabilities,
      { day_of_week: newDay, start_time: newStartTime, end_time: newEndTime },
    ].sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
      return parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time);
    });

    onChange(next);
    toast.success(t('profile.availability.slotAdded'));
  };

  const handleRemoveSlot = (index: number) => {
    onChange(availabilities.filter((_, i) => i !== index));
  };

  const getDayLabel = (day: number) => t(`profile.availability.days.${day}`);

  return (
    <div className="border-t border-border pt-6 space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4 text-rs-accent" /> {t('profile.availability.title')}
      </h3>

      {/* Add Slot Panel */}
      <div className="bg-muted border border-border rounded-xl p-4 space-y-4">
        <p className="text-xs text-muted-foreground">{t('profile.availability.description')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('profile.availability.day')}</Label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="w-full h-9 bg-background border border-border rounded-lg px-2 text-xs text-foreground focus:outline-none focus:border-rs-accent"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>{getDayLabel(d)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('profile.availability.startTime')}</Label>
            <input
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              className="w-full h-9 bg-background border border-border rounded-lg px-3 text-xs text-foreground focus:outline-none focus:border-rs-accent"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('profile.availability.endTime')}</Label>
            <input
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="w-full h-9 bg-background border border-border rounded-lg px-3 text-xs text-foreground focus:outline-none focus:border-rs-accent"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddSlot}
          className="w-full h-9 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {t('profile.availability.addRange')}
        </Button>
      </div>

      {/* Saved Slots List */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">{t('profile.availability.configuredSlots')}</Label>
        {availabilities.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pe-1 scrollbar-thin">
            {availabilities.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted border border-border text-xs"
              >
                <span className="font-semibold text-rs-accent">{getDayLabel(slot.day_of_week)}</span>
                <span className="text-foreground font-medium ms-2 me-auto font-mono">
                  {slot.start_time} - {slot.end_time}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(index)}
                  className="text-muted-foreground hover:text-rs-danger transition-colors p-1"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-border rounded-xl">
            <Clock className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">{t('profile.availability.noSlots')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
