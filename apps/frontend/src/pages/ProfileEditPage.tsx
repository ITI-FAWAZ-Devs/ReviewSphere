import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Settings, Briefcase, FileText, DollarSign, Layers, Plus, Trash2, Clock } from 'lucide-react';

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

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, token, login } = useAuthStore();

  // Stacks for Mentors
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loadingStacks, setLoadingStacks] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student Form fields
  const [name, setName] = useState('');

  // Mentor Form fields
  const [mentorProfileId, setMentorProfileId] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [stackId, setStackId] = useState('');

  // Availability state
  const [availabilities, setAvailabilities] = useState<AvailabilityBlock[]>([]);
  const [newDay, setNewDay] = useState<number>(1);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('You must be logged in to edit your profile.');
      navigate('/login');
    }
  }, [user, navigate]);

  // Load initial form data and stacks
  useEffect(() => {
    if (!user) return;

    // Load initial student details
    if (user.role === 'STUDENT') {
      setName(user.name || '');
    }

    // Load initial mentor details
    if (user.role === 'MENTOR') {
      async function loadMentorDataAndStacks() {
        try {
          setLoadingStacks(true);
          const [stacksRes, profileRes] = await Promise.all([
            apiClient.get<Stack[]>('/stacks'),
            apiClient.get<any>('/auth/profile'),
          ]);

          setStacks(stacksRes.data);

          const mentorProfile = profileRes.data.mentorProfile;
          if (mentorProfile) {
            setMentorProfileId(mentorProfile.id);
            setTitle(mentorProfile.title || '');
            setBio(mentorProfile.bio || '');
            setHourlyRate(mentorProfile.hourlyRate || 0);
            setStackId(mentorProfile.stackId || '');
            
            if (mentorProfile.availabilities) {
              setAvailabilities(
                mentorProfile.availabilities.map((a: any) => ({
                  day_of_week: a.dayOfWeek,
                  start_time: a.startTime,
                  end_time: a.endTime,
                })).sort((a: AvailabilityBlock, b: AvailabilityBlock) => {
                  if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
                  return parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time);
                })
              );
            }
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to load profile settings.');
        } finally {
          setLoadingStacks(false);
        }
      }

      loadMentorDataAndStacks();
    }
  }, [user]);

  const handleAddSlot = () => {
    const startMin = parseTimeToMinutes(newStartTime);
    const endMin = parseTimeToMinutes(newEndTime);

    if (startMin >= endMin) {
      toast.error('Start time must be before end time.');
      return;
    }

    if (endMin - startMin < 45) {
      toast.error('Slot duration must be at least 45 minutes.');
      return;
    }

    // Overlap check
    const hasOverlap = availabilities.some(
      (a) =>
        a.day_of_week === newDay &&
        startMin < parseTimeToMinutes(a.end_time) &&
        endMin > parseTimeToMinutes(a.start_time)
    );

    if (hasOverlap) {
      toast.error('This range overlaps with an existing availability slot.');
      return;
    }

    const nextAvailabilities = [
      ...availabilities,
      { day_of_week: newDay, start_time: newStartTime, end_time: newEndTime },
    ].sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
      return parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time);
    });

    setAvailabilities(nextAvailabilities);
    toast.success('Availability block added to list!');
  };

  const handleRemoveSlot = (index: number) => {
    setAvailabilities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    try {
      setSaving(true);

      if (user.role === 'STUDENT') {
        if (!name.trim()) {
          toast.error('Name is required.');
          return;
        }
        await apiClient.put('/auth/profile', { name });
      } else if (user.role === 'MENTOR') {
        if (!title.trim()) {
          toast.error('Title is required.');
          return;
        }
        if (!bio.trim() || bio.length < 10) {
          toast.error('Bio must be at least 10 characters.');
          return;
        }
        if (hourlyRate < 0) {
          toast.error('Hourly rate cannot be negative.');
          return;
        }
        if (!stackId) {
          toast.error('Stack is required.');
          return;
        }

        // Save mentor profile and availability slots concurrently
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

      // Re-fetch unified profile to update Zustand auth store
      const profileRes = await apiClient.get<any>('/auth/profile');
      login(profileRes.data, token);

      toast.success('Profile and availability settings updated successfully!');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save settings.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const inputClass = "bg-[#161b22] border-slate-700/60 text-slate-100 placeholder-slate-500 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-colors text-sm rounded-xl py-2.5";

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Card className="bg-[#161b22] border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardHeader className="pt-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-400" /> Customize Profile
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your account details and profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STUDENT FORM */}
              {user.role === 'STUDENT' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                    className={inputClass}
                  />
                </div>
              )}

              {/* MENTOR FORM */}
              {user.role === 'MENTOR' && (
                <div className="space-y-6">
                  {/* Basic settings group */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Professional Title
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="e.g. Senior Frontend Architect"
                        className={inputClass}
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Bio
                      </Label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                        minLength={10}
                        rows={4}
                        placeholder="Tell students about your background, experience, and mentoring style..."
                        className="w-full bg-[#161b22] border border-slate-700/60 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none focus:ring-1 focus:ring-indigo-500/20"
                      />
                    </div>

                    {/* Price & Stack Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Hourly Rate */}
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> Hourly Rate ($)
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

                      {/* Stack */}
                      <div className="space-y-2">
                        <Label htmlFor="stack" className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" /> Tech Stack
                        </Label>
                        <select
                          id="stack"
                          value={stackId}
                          onChange={(e) => setStackId(e.target.value)}
                          required
                          disabled={loadingStacks}
                          className="w-full h-10 bg-[#161b22] border border-slate-700/60 rounded-xl px-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm focus:ring-1 focus:ring-indigo-500/20"
                        >
                          <option value="" disabled>Select a stack...</option>
                          {stacks.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* WEEKLY AVAILABILITY MANAGER */}
                  <div className="border-t border-slate-800/80 pt-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" /> Weekly Availability Manager
                    </h3>
                    
                    {/* Add Slot Panel */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 space-y-4">
                      <p className="text-xs text-slate-500">Configure weekly timeframes for student bookings.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        {/* Day of Week */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-400">Day</Label>
                          <select
                            value={newDay}
                            onChange={(e) => setNewDay(Number(e.target.value))}
                            className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Start Time */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-400">Start Time</Label>
                          <input
                            type="time"
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                            className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* End Time */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-400">End Time</Label>
                          <input
                            type="time"
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                            className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddSlot}
                        className="w-full h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-semibold text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Time Range
                      </Button>
                    </div>

                    {/* Saved Slots List */}
                    <div className="space-y-3">
                      <Label className="text-xs text-slate-500">Configured Slots</Label>
                      {availabilities.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {availabilities.map((slot, index) => {
                            const dayLabel = DAYS_OF_WEEK.find((d) => d.value === slot.day_of_week)?.label || '';
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                              >
                                <span className="font-semibold text-indigo-400">{dayLabel}</span>
                                <span className="text-slate-300 font-medium ml-2 mr-auto">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlot(index)}
                                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                  title="Delete slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                          <Clock className="w-6 h-6 text-slate-700 mx-auto mb-1.5" />
                          <p className="text-xs text-slate-500">No availability ranges configured yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/mentors')}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || loadingStacks}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 rounded-xl shadow-md shadow-indigo-900/20"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
