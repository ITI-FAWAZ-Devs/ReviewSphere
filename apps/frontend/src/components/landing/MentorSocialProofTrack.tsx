import { Badge } from '@/components/ui/badge';

/* ── Mentor data ────────────────────────────────────────────── */
const MENTORS = [
  {
    name: 'Sarah Chen',
    specialty: 'Distributed Systems',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcIAK1aT_5tBaEvpnltkGRqz9J2b8dUpVnbvg4lJtTkn4YVZarYKQ10ulpSmsHxoUzvmJ_Ej3NmfEdVDyyG4vKLb3kg1CZ3KcQKpPJpPP6pNHBerZFr6bC18xcxFBb29oBPf3SMVa9jcK0AJkNl4slbxkvBkiMpkg0kVD5mtVLNsxAiXyS8B7K4l_2gW_vvVaAJqNBUtc5vkscluSHSPzTKAGZ4-IqtfJfRgMDHD2geYNineNm-981ofSexgRNYGiD0eBLFoFmAXPX',
  },
  {
    name: 'Marcus Thorne',
    specialty: 'UX Strategy',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr5qpyFRt2SL6mwjKSSNdI3MEPZ5m_hhEGl-Y-4TSuQI8ERDyczf1en-E6D54W7eWOIZv_iH3LsoIjEq9psTaZfUKSG9rnq8qyKem2zninuGx33qx4hU5ubYq2x4e-aqZolVnxgYpXUgkzbEkZbkuMijXVD9XR6tzArMUq5aV_lBsxgxYYWB4b4wn-k5M7oYbTd-dcUljZ8MVxdK7KOkjvd2fCKp1hyKBdO2mEeJY-jn5CFh2NOudyywdAkUgykXtuy0NQYek2gewL',
  },
  {
    name: 'Elena Rodriguez',
    specialty: 'Data Science',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr1aCWMZ5_1OLpSdt4iJ78Uux_9Lm9mlwAyunzi1u0u9rHogFcP5m1mEp42icjlAneQn3OJJMuAuzjEoMaH6SgHMpiqvcWKT5Yd_QsAdsBZWT9bc6NIxGXONK5EpgQZNub3je6EAFbyOLVHCr54vfRYbjhA0r-6FBhAEpVJsQNbbddUh779XkNtF6PqPA6hOeS74ON8703lM5VodElLrEwlrmZKSvgGngkGLDX0z8VvnNwmfIJRdWZAPA-j38Qjp1QAnHwmoMPmWzu',
  },
  {
    name: 'David Park',
    specialty: 'Cloud Arch',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-X4BxXKb3NvrCoJ5tVSjWHj5GgythzKz_dj_5x3aaic5Ur-8UN7m6iSbvk3Ak_MGxVYTER7sgkCmqevYw9rCK2yM8X-jopgujknDAcMVdadxrvSZ-dqoc9xZI--joW8o5Z-CeejjGdRPSxWn0Sg1hYAE_Q-JxjUNEVg7ISYYhHAaBRBpc8zr5Tu9X2P8yH6eYMr2p4nAl45JdhuguoTUeStTH8LKn2nnUyY9Rp5pobCwyFLs681DwxRI6slWileUxbH7YOyxxWvgL',
  },
] as const;

/* ── Mentor Chip ────────────────────────────────────────────── */
function MentorChip({ name, specialty, avatar }: (typeof MENTORS)[number]) {
  return (
    <div className="bg-card border border-border flex items-center gap-3 p-3 rounded-full px-5 shrink-0 shadow-sm">
      <img
        className="w-10 h-10 rounded-full object-cover border border-rs-accent/30"
        alt={name}
        src={avatar}
      />
      <div>
        <p className="text-sm font-bold text-foreground leading-tight">
          {name}
        </p>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-rs-accent border-0 uppercase tracking-widest font-semibold font-mono">
          {specialty}
        </Badge>
      </div>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────── */
export function MentorSocialProofTrack() {
  return (
    <section className="py-8 overflow-hidden bg-muted/40 border-y border-border">
      <div className="animate-scroll gap-6 px-6">
        <div className="flex gap-6">
          {/* Duplicate to create infinite scroll effect */}
          {[0, 1].map((batch) =>
            MENTORS.map((mentor) => (
              <MentorChip key={`${batch}-${mentor.name}`} {...mentor} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
