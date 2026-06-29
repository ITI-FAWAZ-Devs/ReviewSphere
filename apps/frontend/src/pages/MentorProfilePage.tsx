import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, CheckCircle, Calendar as CalendarIcon, Clock, ArrowLeft, GraduationCap, MapPin, Code2, Video, Sparkles, Award, ShieldCheck } from 'lucide-react';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/BookingModal';
import BookingSuccessModal from '@/components/BookingSuccessModal';

interface BookedSession {
  meetLink?: string | null;
}

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
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-32 h-32 rounded-full bg-muted" />
        <div className="h-8 bg-muted rounded-md w-48" />
        <div className="h-4 bg-muted rounded-md w-32" />
      </div>
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────────── */
function ProfileNotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rs-accent/10 blur-[100px] rounded-full pointer-events-none" />
      <p className="text-2xl font-bold text-foreground mb-6 z-10">
        {t('mentor.profile.notFound')}
      </p>
      <Button asChild variant="outline" className="rounded-2xl z-10 border-2 hover:bg-rs-accent/10">
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
  const [bookedSession, setBookedSession] = useState<{
    meetLink?: string | null;
    slot: Slot;
  } | null>(null);

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
      const res = await apiClient.post<BookedSession>('/sessions/book', {
        mentor_id: mentor.id,
        start_time: `${date}T${selectedSlot.start_time}:00Z`,
        end_time: `${date}T${selectedSlot.end_time}:00Z`,
        description: '',
      });
      setSlots((prev) =>
        prev.filter(
          (s) => s.start_time !== selectedSlot.start_time || s.end_time !== selectedSlot.end_time
        )
      );
      setBookedSession({ meetLink: res.data.meetLink, slot: selectedSlot });
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

  return (
    <>
      <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-rs-accent/10 to-transparent pointer-events-none" />
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-rs-accent/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-rs-accent/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] pointer-events-none" />

        {/* Back Link */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 relative z-20">
          <Link
            to="/mentors"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/60 backdrop-blur-md border border-border/50 text-foreground hover:bg-card hover:text-rs-accent transition-all shadow-sm font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {t('mentor.profile.backToDiscovery')}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Mentor Hero & Info (Span 7) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Profile Card (Hero) */}
              <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <Sparkles className="w-8 h-8 text-rs-accent/20 group-hover:text-rs-accent/60 transition-colors duration-700" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-rs-accent to-rs-accent/40 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                    {mentor.avatarUrl ? (
                      <img
                        src={mentor.avatarUrl}
                        alt={mentor.name}
                        className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-[6px] border-background relative z-10"
                      />
                    ) : (
                      <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-rs-accent to-rs-accent/60 flex items-center justify-center text-5xl font-extrabold text-white border-[6px] border-background relative z-10 shadow-xl">
                        {mentor.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {mentor.isVerified && (
                      <div className="absolute bottom-2 right-2 z-20 bg-background rounded-full p-1.5 shadow-lg">
                        <CheckCircle className="w-8 h-8 text-rs-success fill-rs-success/20" />
                      </div>
                    )}
                  </div>

                  <div className="text-center md:text-start flex-1 pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rs-accent/10 text-rs-accent text-xs font-bold tracking-widest uppercase mb-4 border border-rs-accent/20">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {t('auth.mentor')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2">
                      {mentor.name}
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium mb-6">
                      {mentor.title}
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted border border-border text-sm font-semibold">
                        <Star className="w-4 h-4 text-rs-warning fill-current" />
                        {mentor.averageRating.toFixed(1)} Rating
                      </span>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted border border-border text-sm font-semibold">
                        <Code2 className="w-4 h-4 text-rs-accent" />
                        {mentor.stack.name}
                      </span>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted border border-border text-sm font-semibold">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Remote
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-card/40 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 md:p-10 shadow-lg">
                <h3 className="text-2xl font-extrabold text-foreground mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-rs-accent" /> {t('mentor.profile.about')}
                </h3>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {mentor.bio}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Booking Widget (Span 5) */}
            <div className="lg:col-span-5">
              <div className="sticky top-10">
                <Card className="bg-card/80 backdrop-blur-3xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-rs-accent/5 to-transparent pointer-events-none" />
                  
                  {/* Pricing Header inside Widget */}
                  <div className="p-8 pb-0 relative z-10 flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground">Schedule</h2>
                      <p className="text-muted-foreground font-medium mt-1">Book your 1-on-1 session</p>
                    </div>
                    <div className="text-end">
                      <div className="text-3xl font-extrabold text-rs-accent">${mentor.hourlyRate}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">/ hour</div>
                    </div>
                  </div>
                  
                  <div className="p-8 relative z-10">
                    {/* Date Picker */}
                    <div className="mb-8">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-rs-accent" /> Select a Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={date}
                          min={todayStr}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-background border-2 border-border rounded-2xl px-5 py-4 text-lg font-bold text-foreground focus:outline-none focus:border-rs-accent transition-all hover:border-rs-accent/50 cursor-pointer shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Slots Grid */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-rs-accent" /> Available Times
                      </label>
                      
                      {loadingSlots ? (
                        <div className="grid grid-cols-2 gap-3">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-14 bg-muted rounded-2xl animate-pulse" />
                          ))}
                        </div>
                      ) : slots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {slots.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedSlot(slot)}
                              className="group relative flex items-center justify-center py-4 px-4 rounded-2xl border-2 border-border bg-background hover:border-rs-accent hover:bg-rs-accent/10 transition-all text-sm font-extrabold text-foreground overflow-hidden shadow-sm"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                {slot.start_time}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-3xl bg-background/50">
                          <Clock className="w-10 h-10 text-muted-foreground/30 mb-4" />
                          <p className="text-base font-bold text-foreground">
                            {t('mentor.availability.noSlots')}
                          </p>
                          <p className="text-sm font-medium text-muted-foreground mt-1 text-center max-w-[200px]">
                            Try selecting a different date
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Guarantee */}
                  <div className="bg-muted/30 p-6 border-t border-border flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                      <ShieldCheck className="w-5 h-5 text-rs-success" /> Secure Booking Guarantee
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                      <Video className="w-5 h-5 text-rs-accent" /> Automatic Google Meet link
                    </div>
                  </div>
                </Card>
              </div>
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

      {bookedSession && mentor && (
        <BookingSuccessModal
          mentorName={mentor.name}
          date={date}
          startTime={bookedSession.slot.start_time}
          endTime={bookedSession.slot.end_time}
          meetLink={bookedSession.meetLink}
          onClose={() => setBookedSession(null)}
        />
      )}
    </>
  );
}
