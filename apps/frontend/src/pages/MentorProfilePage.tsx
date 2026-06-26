import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, CheckCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/BookingModal';

interface Stack {
  id: string;
  name: string;
  description: string | null;
}

interface Mentor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  isVerified: boolean;
  averageRating: number;
  hourlyRate: number;
  stack: Stack;
}

interface Slot {
  start_time: string;
  end_time: string;
}

/* ── Skeleton ───────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-card border border-border h-96 rounded-2xl" />
          <div className="lg:col-span-2 bg-card border border-border h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────────── */
function ProfileNotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <p className="text-xl font-semibold text-muted-foreground mb-4">
        {t('mentor.profile.notFound')}
      </p>
      <Button asChild variant="outline">
        <Link to="/mentors" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('mentor.profile.backToDiscovery')}
        </Link>
      </Button>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [loadingMentor, setLoadingMentor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState(false);

  // Fetch Mentor details
  useEffect(() => {
    async function fetchMentor() {
      try {
        setLoadingMentor(true);
        const res = await apiClient.get<Mentor>(`/mentors/${id}`);
        setMentor(res.data);
      } catch {
        toast.error('Failed to load mentor details.');
      } finally {
        setLoadingMentor(false);
      }
    }
    if (id) fetchMentor();
  }, [id]);

  // Fetch Availability Slots on date change
  useEffect(() => {
    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        const res = await apiClient.get<{ slots: Slot[] }>(`/mentors/${id}/availability`, {
          params: { date },
        });
        setSlots(res.data.slots);
      } catch {
        toast.error('Failed to load availability.');
      } finally {
        setLoadingSlots(false);
      }
    }
    if (id && date) fetchSlots();
  }, [id, date]);

  const confirmBooking = async () => {
    if (!selectedSlot || !mentor) return;
    setBooking(true);
    try {
      await apiClient.post('/sessions/book', {
        mentor_id: mentor.id,
        start_time: `${date}T${selectedSlot.start_time}:00Z`,
        end_time: `${date}T${selectedSlot.end_time}:00Z`,
        description: '',
      });
      toast.success(t('mentor.booking.success'));
      setSlots((prev) =>
        prev.filter(
          (s) => s.start_time !== selectedSlot.start_time || s.end_time !== selectedSlot.end_time
        )
      );
      setSelectedSlot(null);
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 409) {
        toast.error(t('mentor.booking.slotTaken'));
      } else {
        const message = error.response?.data?.message || t('mentor.booking.failed');
        toast.error(message);
      }
    } finally {
      setBooking(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (loadingMentor) return <ProfileSkeleton />;
  if (!mentor) return <ProfileNotFound />;

  const fullStars = Math.floor(mentor.averageRating);
  const hasHalfStar = mentor.averageRating % 1 >= 0.5;

  return (
    <>
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <div className="mb-6">
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 text-sm text-rs-accent hover:text-rs-accent-hover transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> {t('mentor.profile.backToDiscovery')}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column — Info Card */}
            <Card className="lg:col-span-1 bg-card border-border shadow-lg relative overflow-hidden">
              <div className="absolute top-0 start-0 w-full h-[4px] bg-rs-accent" />
              <CardHeader className="flex flex-col items-center pt-8 text-center">
                <div className="relative mb-4">
                  {mentor.avatarUrl ? (
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-rs-accent/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-rs-accent flex items-center justify-center text-3xl font-bold text-white border-2 border-rs-accent/30">
                      {mentor.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {mentor.isVerified && (
                    <CheckCircle className="w-6 h-6 text-rs-success fill-background absolute bottom-0 end-0" />
                  )}
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
                    {mentor.name}
                  </CardTitle>
                  <p className="text-xs text-rs-accent font-semibold tracking-wider uppercase">
                    {mentor.title}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                {/* Rating + Price */}
                <div className="flex flex-col items-center gap-2 py-3 px-4 rounded-xl bg-muted border border-border">
                  <div className="flex items-center gap-1 text-rs-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < fullStars
                            ? 'fill-rs-warning text-rs-warning'
                            : i === fullStars && hasHalfStar
                            ? 'fill-rs-warning text-rs-warning opacity-70'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-foreground ms-1.5 mt-0.5">
                      {mentor.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-foreground mt-1">
                    ${mentor.hourlyRate}{' '}
                    <span className="text-xs text-muted-foreground font-normal">
                      {t('mentor.profile.perHour')}
                    </span>
                  </div>
                </div>

                {/* Stack Badge — Signature monospace chip */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('mentor.profile.primaryStack')}
                  </h4>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-rs-accent/10 text-rs-accent border border-rs-accent/20">
                    {mentor.stack.name}
                  </span>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('mentor.profile.about')}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mentor.bio}</p>
                </div>
              </CardContent>
            </Card>

            {/* Right Column — Availability & Booking */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border shadow-lg relative overflow-hidden">
                <CardHeader className="border-b border-border pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2.5 text-foreground">
                      <Calendar className="w-5 h-5 text-rs-accent" />{' '}
                      {t('mentor.availability.chooseDate')}
                    </CardTitle>
                    <div className="relative w-full sm:w-auto">
                      <input
                        type="date"
                        value={date}
                        min={todayStr}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full sm:w-auto bg-muted border border-border rounded-[10px] px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-rs-accent transition-colors focus:ring-1 focus:ring-rs-accent/20"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingSlots ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-muted border border-border h-24 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {slots.map((slot, index) => (
                        <div
                          key={index}
                          className="group bg-muted border border-border hover:border-rs-accent/50 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all hover:-translate-y-[2px] shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-rs-accent" />
                            <span className="text-sm font-semibold text-foreground">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedSlot(slot)}
                            className="w-full rounded-lg bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold"
                          >
                            {t('mentor.availability.book')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-2xl">
                      <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('mentor.availability.noSlots')}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {t('mentor.availability.noSlotsHint')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedSlot && mentor && (
        <BookingModal
          mentorName={mentor.name}
          date={date}
          slot={selectedSlot}
          booking={booking}
          onConfirm={confirmBooking}
          onCancel={() => !booking && setSelectedSlot(null)}
        />
      )}
    </>
  );
}
