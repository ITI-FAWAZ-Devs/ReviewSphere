import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

/* ── Mentor data ────────────────────────────────────────────── */
const MENTORS = [
  {
    name: 'Javier S.',
    role: 'Principal at Meta',
    tags: ['Kubernetes', 'Go'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAriGMur54pXReDDtgZxxMEZJIWeBdHhokQB0Y6qz5Qo2pRAzhkTwefZqv51MaLms7kKGFA7Zj97VRBFJ21VRsCZka91B4gJgueqhDGAic6oBVfgoHeUtqYVqKOh5wy9b0ZrI9YBqqsU_4iRKsk8WJIVrkuk16JgJPGq--2ByBJjx68ZCz7qiar3R9BAvF6_kc6EmpjWW0FoFZxmeC2z0v6P-VV-0bR26efWT9s8jVEwSebE4fPGhCXqulGEqUtJYg1RUvtcNYMAd1Y',
  },
  {
    name: 'Maya V.',
    role: 'Senior UX Lead',
    tags: ['Figma', 'Design Systems'],
    icon: 'code_blocks',
  },
  {
    name: 'Dr. Linda K.',
    role: 'AI Researcher at OpenAI',
    tags: ['PyTorch', 'LLMs'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5B1Ji6BvHUze79BkS3uDp2I3XVMvfPn2dXQKNTiqR1d1aejT5RVwdm8I6sYUCqsvaCsukvk0tADJ-HnXqT6xRX5XUuxs3m9JSYQ0jFadP4ry60WZzzbXoCAPLMPwSoBL4o8-iWLWfKR6vOQtdGO1CBKZGnAjabi4hny5AvYnigw8byxrF8CBfNYakB7PMHdQaH6VqX_byuYKbOwD69c3zOgAtBSFLcNlfIuKRHHZNRQjeRnrOmwDoChFIlt8PbO3vx9yDyq2CTyJk',
  },
] as const;

/* ── MentorCard ─────────────────────────────────────────────── */
function MentorCard({ mentor }: { mentor: (typeof MENTORS)[number] }) {
  return (
    <Card className="break-inside-avoid glass-card border-0 hover:bg-surface-container-high/10 transition-all cursor-pointer group">
      <CardContent className="p-5">
        {/* Image or placeholder icon */}
        {'image' in mentor ? (
          <img
            className="w-full rounded-lg mb-3 grayscale group-hover:grayscale-0 transition-all"
            alt={mentor.name}
            src={mentor.image}
          />
        ) : (
          <div className="h-40 w-full bg-gradient-to-tr from-secondary-container/20 to-landing-primary/20 rounded-lg mb-3 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-background/50 dark:text-inverse-on-surface/50 text-6xl">
              {mentor.icon}
            </span>
          </div>
        )}

        <h4 className="text-lg font-medium text-on-background dark:text-inverse-on-surface">
          {mentor.name}
        </h4>
        <p className="text-xs font-medium text-primary-fixed-dim mb-3">{mentor.role}</p>

        <div className="flex flex-wrap gap-1.5">
          {mentor.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── DiscoveryTeaser ────────────────────────────────────────── */
export function DiscoveryTeaser() {
  return (
    <section className="py-8 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-on-background dark:text-inverse-on-surface">
            Explore the Network
          </h2>
          <p className="text-base text-muted-foreground mt-1">
            Meet the engineers shaping the future of tech.
          </p>
        </div>
        <Link
          to="/mentors"
          className="hidden md:block text-primary-fixed-dim text-xs font-medium hover:underline decoration-2 underline-offset-8"
        >
          VIEW ALL MENTORS
        </Link>
      </div>

      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {MENTORS.map((mentor) => (
          <MentorCard key={mentor.name} mentor={mentor} />
        ))}
      </div>
    </section>
  );
}
