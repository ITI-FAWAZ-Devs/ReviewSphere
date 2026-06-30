import { useEffect, useRef, useState } from 'react';
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
import { User, Settings, Briefcase, FileText, DollarSign, Layers, Camera, Loader2, X } from 'lucide-react';

interface Stack {
  id: string;
  name: string;
  description: string | null;
}

/* ── Skeleton ───────────────────────────────────────────────── */
function EditSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-card border border-border rounded-2xl p-6 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64" />
          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full bg-muted" />
          </div>
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

/** Convert file to base64 data URL */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, token, login } = useAuthStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loadingStacks, setLoadingStacks] = useState(false);
  const [saving, setSaving] = useState(false);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [clearAvatar, setClearAvatar] = useState(false);

  // Student fields
  const [name, setName] = useState('');

  // Mentor fields
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [stackId, setStackId] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error(t('profile.edit.loginRequired'));
      navigate('/login');
    }
  }, [user, navigate, t]);

  // Load initial form data from API
  useEffect(() => {
    if (!user) return;

    async function loadProfileData() {
      try {
        setLoadingStacks(true);

        if (user!.role === 'STUDENT') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profileRes = await apiClient.get<any>('/auth/profile');
          setName(profileRes.data.studentProfile?.name || user!.name || '');
          const existingAvatar = profileRes.data.studentProfile?.avatarUrl;
          if (existingAvatar) setAvatarPreview(existingAvatar);
        }

        if (user!.role === 'MENTOR') {
          const [stacksRes, profileRes] = await Promise.all([
            apiClient.get<Stack[]>('/stacks'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiClient.get<any>('/auth/profile'),
          ]);
          setStacks(stacksRes.data);

          const mp = profileRes.data.mentorProfile;
          if (mp) {
            setTitle(mp.title || '');
            setBio(mp.bio || '');
            setHourlyRate(mp.hourlyRate || 0);
            setStackId(mp.stackId || '');
            if (mp.avatarUrl) setAvatarPreview(mp.avatarUrl);
          }
        }
      } catch {
        toast.error(t('profile.edit.loadError'));
        // Fallback: use store data for name at least
        if (user!.role === 'STUDENT') setName(user!.name || '');
      } finally {
        setLoadingStacks(false);
      }
    }

    loadProfileData();
  }, [user, t]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be under 2 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const base64 = await fileToBase64(file);
    setAvatarPreview(base64);
    setAvatarBase64(base64);
    setClearAvatar(false);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarBase64(null);
    setClearAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getInitials = (n: string) =>
    n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    try {
      setSaving(true);

      // Build the avatar_url payload value
      const avatar_url = clearAvatar ? '' : avatarBase64 ?? undefined;

      if (user.role === 'STUDENT') {
        if (!name.trim()) {
          toast.error(t('profile.edit.nameRequired'));
          return;
        }
        await apiClient.put('/auth/profile', { name, ...(avatar_url !== undefined ? { avatar_url } : {}) });
      } else if (user.role === 'MENTOR') {
        if (!title.trim()) { toast.error(t('profile.edit.titleRequired')); return; }
        if (!bio.trim() || bio.length < 10) { toast.error(t('profile.edit.bioMinLength')); return; }
        if (hourlyRate < 0) { toast.error(t('profile.edit.rateNegative')); return; }
        if (!stackId) { toast.error(t('profile.edit.stackRequired')); return; }

        await apiClient.put('/auth/profile', {
          title,
          bio,
          hourly_rate: hourlyRate,
          stack_id: stackId,
          ...(avatar_url !== undefined ? { avatar_url } : {}),
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileRes = await apiClient.get<any>(`/auth/profile?t=${Date.now()}`);
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

              {/* ── Avatar Upload ────────────────────────────────── */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-28 h-28 rounded-full object-cover border-4 border-border shadow-md"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-rs-accent to-rs-accent/60 flex items-center justify-center text-3xl font-extrabold text-white border-4 border-border shadow-md">
                      {getInitials(user.name || 'U')}
                    </div>
                  )}

                  {/* Camera overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change photo"
                  >
                    <Camera className="w-7 h-7 text-white" />
                  </button>

                  {/* Remove button */}
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rs-danger text-white flex items-center justify-center shadow-md hover:bg-rs-danger/80 transition-colors z-10"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <p className="text-xs text-muted-foreground text-center">
                  Click the photo to change · Max 2 MB · JPG, PNG, WebP
                </p>
              </div>

              {/* ── STUDENT FORM ─────────────────────────────────── */}
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

              {/* ── MENTOR FORM ──────────────────────────────────── */}
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
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="rounded-xl"
                >
                  {t('profile.edit.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={saving || loadingStacks}
                  className="bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold px-6 rounded-xl flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
