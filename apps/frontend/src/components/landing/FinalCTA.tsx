import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  const { t } = useTranslation();

  return (
    <section className="py-28 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-rs-accent/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
          {t('landing.cta.title')}
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
          {t('landing.cta.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-rs-accent hover:bg-rs-accent-hover text-white rounded-xl text-base h-12 px-10 shadow-sm hover:scale-105 active:scale-95 transition-all font-semibold"
          >
            <Link to="/mentors">{t('landing.cta.button')}</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-card border border-border text-foreground rounded-xl text-base h-12 px-10 hover:bg-muted font-semibold"
          >
            <Link to="/#how-it-works">
              {t('nav.howItWorks')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom blur glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-10 blur-[150px] bg-rs-accent rounded-full pointer-events-none" />
    </section>
  );
}
