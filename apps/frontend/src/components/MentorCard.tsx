import { Star, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Mentor } from '@/hooks/useMentors';

interface MentorCardProps {
  mentor: Mentor;
}

// Stable gradient avatar fallback based on mentor name initial
const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const gradient = getGradient(mentor.name);

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-rs-accent/30 transition-all duration-200 flex flex-col p-5 gap-4 group">
      {/* ── Header: avatar + rating ─────────────────────────────── */}
      <div className="flex items-start justify-between">
        {/* Avatar */}
        {mentor.avatarUrl ? (
          <img
            src={mentor.avatarUrl}
            alt={mentor.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-border shadow-sm"
          />
        ) : (
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl shadow-sm`}
          >
            {mentor.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
          <Star className="w-4 h-4 fill-rs-warning text-rs-warning" />
          <span>{mentor.averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* ── Name + title ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5">
          <h2 className="font-bold text-foreground text-base leading-tight">
            {mentor.name}
          </h2>
          {mentor.isVerified && (
            <BadgeCheck className="w-4 h-4 text-rs-accent flex-shrink-0" />
          )}
        </div>
        <p className="text-xs font-semibold tracking-wide uppercase text-rs-accent mt-0.5">
          {mentor.title}
        </p>
      </div>

      {/* ── Bio ─────────────────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
        {mentor.bio}
      </p>

      {/* ── Stack badge ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-rs-accent/10 text-rs-accent rounded-full border border-rs-accent/20">
          {mentor.stack.name}
        </span>
        {mentor.isAvailableNow && (
          <span className="px-2.5 py-0.5 text-xs font-medium bg-rs-success/10 text-rs-success border border-rs-success/20 rounded-full">
            {t('mentor.discovery.availableNow')}
          </span>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="h-px bg-border" />

      {/* ── Footer: price + CTA ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{t('common.startingAt')}</p>
          <p className="text-base font-bold text-foreground font-mono">
            ${mentor.hourlyRate.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground">/{t('mentor.profile.perHour')}</span>
          </p>
        </div>

        <button
          id={`view-profile-${mentor.id}`}
          onClick={() => navigate(`/mentors/${mentor.id}`)}
          className="px-4 py-2 bg-rs-accent hover:bg-rs-accent-hover active:scale-95 text-white text-sm font-semibold rounded-lg transition-all duration-150 shadow-sm"
        >
          {t('common.viewProfile')}
        </button>
      </div>
    </article>
  );
}
