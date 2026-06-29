import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';
import AvailabilityManager from '@/components/AvailabilityManager';

interface AvailabilityBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

interface AvailabilityDialogProps {
  onClose: () => void;
}

export default function AvailabilityDialog({ onClose }: AvailabilityDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [mentorProfileId, setMentorProfileId] = useState('');
  const [availabilities, setAvailabilities] = useState<AvailabilityBlock[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiClient.get<any>('/auth/profile');
        const mp = res.data.mentorProfile;
        if (mp) {
          setMentorProfileId(mp.id);
          if (mp.availabilities) {
            setAvailabilities(
              mp.availabilities
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((a: any) => ({
                  day_of_week: a.dayOfWeek,
                  start_time: a.startTime,
                  end_time: a.endTime,
                }))
                .sort((a: AvailabilityBlock, b: AvailabilityBlock) => {
                  if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
                  return parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time);
                })
            );
          }
        }
      } catch (error) {
        toast.error(t('common.error') + ': Failed to load availabilities');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [t]);

  const handleSave = async () => {
    if (!mentorProfileId) return;
    try {
      setSaving(true);
      await apiClient.put(`/mentors/${mentorProfileId}/availability`, availabilities);
      toast.success(t('profile.edit.saved') || 'Availability updated successfully.');
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4 overflow-y-auto pt-10 pb-10">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-xl relative p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Manage Session Slots</h3>
        <p className="text-xs text-muted-foreground">
          Add or remove availability slots for your mentoring sessions.
        </p>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-rs-accent" />
          </div>
        ) : (
          <>
            <AvailabilityManager
              availabilities={availabilities}
              onChange={setAvailabilities}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border text-muted-foreground hover:bg-muted font-semibold text-sm rounded-xl transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-rs-accent text-white hover:bg-rs-accent-hover font-semibold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Slots
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
