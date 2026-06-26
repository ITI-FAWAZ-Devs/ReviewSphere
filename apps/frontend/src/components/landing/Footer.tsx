import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { Globe, GitBranch, Terminal } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t('footer.platform'),
      links: [
        { label: t('footer.aboutUs'), to: '/about' },
        { label: t('footer.careers'), to: '/careers' },
      ],
    },
    {
      title: t('footer.community'),
      links: [
        { label: t('dashboard.sidebar.helpCenter'), to: '/help' },
        { label: t('footer.guidelines'), to: '/guidelines' },
      ],
    },
    {
      title: t('footer.stories'),
      links: [
        { label: t('footer.blog'), to: '/blog' },
        { label: t('footer.successStories'), to: '/stories' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), to: '/privacy' },
        { label: t('footer.terms'), to: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-card border-t border-border transition-all duration-200">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto px-6 py-10">
        {/* Brand column */}
        <div className="col-span-2">
          <Link to="/" className="text-xl font-bold text-foreground font-display">
            {t('common.appName')}
          </Link>
          <p className="text-sm text-muted-foreground mb-4 mt-2 max-w-xs">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-3">
            <Globe className="w-5 h-5 text-muted-foreground hover:text-rs-accent cursor-pointer transition-colors" />
            <GitBranch className="w-5 h-5 text-muted-foreground hover:text-rs-accent cursor-pointer transition-colors" />
            <Terminal className="w-5 h-5 text-muted-foreground hover:text-rs-accent cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Link columns */}
        {footerSections.map((section) => (
          <div key={section.title}>
            <h5 className="text-xs font-bold text-rs-accent mb-3 uppercase tracking-wider">
              {section.title}
            </h5>
            <ul className="space-y-2">
              {section.links.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-rs-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Separator className="max-w-7xl mx-auto" />

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="text-xs text-muted-foreground font-mono">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </span>
      </div>
    </footer>
  );
}
