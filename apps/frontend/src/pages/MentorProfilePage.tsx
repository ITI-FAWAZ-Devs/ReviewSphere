import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '@/lib/axios';
import { toast } from '@/lib/toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
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
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load mentor details.');
      } finally {
        setLoadingMentor(false);
      }
    }
    if (id) {
      fetchMentor();
    }
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
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load availability.');
      } finally {
        setLoadingSlots(false);
      }
    }
    if (id && date) {
      fetchSlots();
    }
  }, [id, date]);

  const handleBook = (slot: Slot) => {
    setSelectedSlot(slot);
  };

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
      toast.success('Session booked successfully!');
      setSlots((prev) => prev.filter((s) => s.start_time !== selectedSlot.start_time || s.end_time !== selectedSlot.end_time));
      setSelectedSlot(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to book session. Please try again.';
      toast.error(message);
    } finally {
      setBooking(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (loadingMentor) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          {/* Skeleton header */}
          <div className="h-6 w-32 bg-slate-800 rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-[#161b22] border border-slate-850 h-96 rounded-2xl" />
            <div className="lg:col-span-2 bg-[#161b22] border border-slate-850 h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col items-center justify-center px-4">
        <p className="text-xl font-semibold text-slate-400 mb-4">Mentor not found</p>
        <Button asChild variant="outline">
          <Link to="/mentors" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Mentors
          </Link>
        </Button>
      </div>
    );
  }

  // Render Stars
  const fullStars = Math.floor(mentor.averageRating);
  const hasHalfStar = mentor.averageRating % 1 >= 0.5;

  return (
    <>
      <div className="min-h-screen bg-[#0d1117] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <div className="mb-6">
            <Link to="/mentors" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Mentor Discovery
            </Link>
          </div>

          {/* Profile Details Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column — Info Card */}
            <Card className="lg:col-span-1 bg-[#161b22] border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardHeader className="flex flex-col items-center pt-8 text-center">
                <div className="relative mb-4">
                  {mentor.avatarUrl ? (
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold border-2 border-indigo-500/30">
                      {mentor.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {mentor.isVerified && (
                    <CheckCircle className="w-6 h-6 text-emerald-400 fill-slate-900 absolute bottom-0 right-0" />
                  )}
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
                    {mentor.name}
                  </CardTitle>
                  <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
                    {mentor.title}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                {/* Skill Matrix */}
                <div className="flex flex-col items-center gap-2 py-3 px-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < fullStars
                            ? 'fill-amber-400'
                            : i === fullStars && hasHalfStar
                            ? 'fill-amber-400 opacity-70'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-slate-300 ml-1.5 mt-0.5">
                      {mentor.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">
                    ${mentor.hourlyRate} <span className="text-xs text-slate-500 font-normal">/ hour</span>
                  </div>
                </div>

                {/* Stack Badge */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Stack</h4>
                  <Badge variant="secondary" className="bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium">
                    {mentor.stack.name}
                  </Badge>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">About</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {mentor.bio}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right Column — Availability & Booking */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-[#161b22] border-slate-800/80 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <CardHeader className="border-b border-slate-800/60 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2.5 text-white">
                      <Calendar className="w-5 h-5 text-indigo-400" /> Choose Booking Date
                    </CardTitle>
                    <div className="relative w-full sm:w-auto">
                      <input
                        type="date"
                        value={date}
                        min={todayStr}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors focus:ring-1 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingSlots ? (
                    /* Slots Skeleton Loading */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/40 border border-slate-850 h-24 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : slots.length > 0 ? (
                    /* Slots Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {slots.map((slot, index) => (
                        <div
                          key={index}
                          className="group bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all hover:-translate-y-[2px] shadow-sm hover:shadow-indigo-500/5"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-semibold text-slate-200">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleBook(slot)}
                            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-900/20"
                          >
                            Book Slot
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty state */
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-800/80 rounded-2xl">
                      <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">No available slots for this date</p>
                      <p className="text-xs text-slate-600 mt-1">Please select another date on the calendar.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => !booking && setSelectedSlot(null)}>
          <div className="bg-[#161b22] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">Confirm Booking</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Mentor:</span> {mentor?.name}</p>
              <p><span className="text-slate-500">Date:</span> {date}</p>
              <p><span className="text-slate-500">Time:</span> {selectedSlot.start_time} - {selectedSlot.end_time}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelectedSlot(null)} disabled={booking}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold" onClick={confirmBooking} disabled={booking}>
                {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {booking ? 'Booking…' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
