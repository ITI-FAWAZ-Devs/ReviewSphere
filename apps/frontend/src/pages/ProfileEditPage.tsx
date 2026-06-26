import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Settings, Briefcase, FileText, DollarSign, Layers } from 'lucide-react';
import AvailabilityManager from '@/components/AvailabilityManager';

interface Stack {
  id: string;
  name: string;
  description: string | null;
}

interface AvailabilityBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/* ── Skeleton ───────────────────────────────────────────────── */
function EditSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-card border border-border rounded-2xl p-6 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded-[10px]" />
            <div className="h-10 bg-muted rounded-[10px]" />
            <div className="h-24 bg-muted rounded-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, token, login } = useAuthStore();
  const { t } = useTranslation();

  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loadingStacks, setLoadingStacks] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student fields
  const [name, setName] = useState('');

  // Mentor fields
  const [mentorProfileId, setMentorProfileId] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [stackId, setStackId] = useState('');
  const [availabilities, setAvailabilities] = useState<AvailabilityBlock[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error(t('profile.edit.loginRequired'));
      navigate('/login');
    }
  }, [user, navigate, t]);

  // Load initial form data
  useEffect(() => {
    if (!user) return;

    if (user.role === 'STUDENT') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name || '');
    }

    if (user.role === 'MENTOR') {
      async function loadMentorData() {
        try {
          setLoadingStacks(true);
          const [stacksRes, profileRes] = await Promise.all([
            apiClient.get<Stack[]>('/stacks'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiClient.get<any>('/auth/profile'),
          ]);
          setStacks(stacksRes.data);

          const mp = profileRes.data.mentorProfile;
          if (mp) {
            setMentorProfileId(mp.id);
            setTitle(mp.title || '');
            setBio(mp.bio || '');
            setHourlyRate(mp.hourlyRate || 0);
            setStackId(mp.stackId || '');
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
        } catch {
          toast.error(t('profile.edit.loadError'));
        } finally {
          setLoadingStacks(false);
        }
      }
      loadMentorData();
    }
  }, [user, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    try {
      setSaving(true);

      if (user.role === 'STUDENT') {
        if (!name.trim()) {
          toast.error(t('profile.edit.nameRequired'));
          return;
        }
        await apiClient.put('/auth/profile', { name });
      } else if (user.role === 'MENTOR') {
        if (!title.trim()) { toast.error(t('profile.edit.titleRequired')); return; }
        if (!bio.trim() || bio.length < 10) { toast.error(t('profile.edit.bioMinLength')); return; }
        if (hourlyRate < 0) { toast.error(t('profile.edit.rateNegative')); return; }
        if (!stackId) { toast.error(t('profile.edit.stackRequired')); return; }

        await Promise.all([
          apiClient.put('/auth/profile', {
            title,
            bio,
            hourly_rate: hourlyRate,
            stack_id: stackId,
          }),
          apiClient.put(`/mentors/${mentorProfileId}/availability`, availabilities),
        ]);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileRes = await apiClient.get<any>('/auth/profile');
      login(profileRes.data, token);
      toast.success(t('profile.edit.saved'));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  if (loadingStacks) return <EditSkeleton />;

  const inputClass =
    'bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-rs-accent/20 focus-visible:border-rs-accent transition-colors text-sm rounded-[10px] py-2.5';

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Card className="bg-card border-border shadow-lg relative overflow-hidden">
          <div className="absolute top-0 start-0 w-full h-[4px] bg-rs-accent" />
          <CardHeader className="pt-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-rs-accent" /> {t('profile.edit.title')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('profile.edit.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STUDENT FORM */}
              {user.role === 'STUDENT' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {t('profile.edit.name')}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t('auth.namePlaceholder')}
                    className={inputClass}
                  />
                </div>
              )}

              {/* MENTOR FORM */}
              {user.role === 'MENTOR' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> {t('profile.edit.professionalTitle')}
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder={t('profile.edit.titlePlaceholder')}
                        className={inputClass}
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> {t('profile.edit.bio')}
                      </Label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                        minLength={10}
                        rows={4}
                        placeholder={t('profile.edit.bioPlaceholder')}
                        className="w-full bg-background border border-border rounded-[10px] px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-rs-accent transition-colors text-sm resize-none focus:ring-1 focus:ring-rs-accent/20"
                      />
                    </div>

                    {/* Price & Stack Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> {t('profile.edit.hourlyRate')}
                        </Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          min="0"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(Number(e.target.value))}
                          required
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stack" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" /> {t('profile.edit.techStack')}
                        </Label>
                        <select
                          id="stack"
                          value={stackId}
                          onChange={(e) => setStackId(e.target.value)}
                          required
                          className="w-full h-10 bg-background border border-border rounded-[10px] px-3 text-foreground focus:outline-none focus:border-rs-accent transition-colors text-sm focus:ring-1 focus:ring-rs-accent/20"
                        >
                          <option value="" disabled>{t('profile.edit.selectStack')}</option>
                          {stacks.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* AVAILABILITY MANAGER */}
                  <AvailabilityManager
                    availabilities={availabilities}
                    onChange={setAvailabilities}
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/mentors')}
                  className="rounded-xl"
                >
                  {t('profile.edit.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={saving || loadingStacks}
                  className="bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold px-6 rounded-xl"
                >
                  {saving ? t('profile.edit.saving') : t('profile.edit.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
