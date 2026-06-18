import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

/* ── Footer link data ───────────────────────────────────────── */
const FOOTER_SECTIONS = [
  {
    title: 'Platform',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Guidelines', to: '/guidelines' },
    ],
  },
  {
    title: 'Stories',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'Success Stories', to: '/stories' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
] as const;

const SOCIAL_ICONS = ['language', 'hub', 'terminal'] as const;

/* ── FooterLinkColumn ───────────────────────────────────────── */
function FooterLinkColumn({ title, links }: (typeof FOOTER_SECTIONS)[number]) {
  return (
    <div>
      <h5 className="text-xs font-medium text-landing-primary dark:text-primary-fixed-dim mb-3 uppercase tracking-widest">
        {title}
      </h5>
      <ul className="space-y-2">
        {links.map(({ label, to }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-muted-foreground hover:text-landing-primary dark:hover:text-primary-fixed-dim transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface border-t transition-all duration-200">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto px-6 py-10">
        {/* Brand column */}
        <div className="col-span-2">
          <Link to="/" className="text-xl font-bold text-on-surface dark:text-inverse-on-surface">
            ReviewSphere
          </Link>
          <p className="text-sm text-muted-foreground mb-4 mt-2 max-w-xs">
            Empowering the next generation of technologists through world-class
            human mentorship.
          </p>
          <div className="flex gap-3">
            {SOCIAL_ICONS.map((icon) => (
              <span
                key={icon}
                className="material-symbols-outlined text-muted-foreground hover:text-landing-primary cursor-pointer transition-colors"
              >
                {icon}
              </span>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_SECTIONS.map((section) => (
          <FooterLinkColumn key={section.title} {...section} />
        ))}
      </div>

      <Separator className="max-w-7xl mx-auto" />

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ReviewSphere. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
