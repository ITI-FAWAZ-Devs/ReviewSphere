import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/* ── FinalCTA ───────────────────────────────────────────────── */
export function FinalCTA() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-landing-primary/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-on-background dark:text-inverse-on-surface">
          Ready to start your journey?
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
          Whether you're looking to master a new framework or navigate the
          complexities of tech leadership, our network is ready for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-landing-primary hover:bg-landing-primary/90 text-white rounded-xl text-base h-12 px-10 shadow-2xl shadow-landing-primary/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Link to="/mentors">Start Your Journey</Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="glass-card border-outline-variant/30 text-on-background dark:text-inverse-on-surface rounded-xl text-base h-12 px-10 hover:bg-surface-container-high/20"
          >
            Request Demo
          </Button>
        </div>
      </div>

      {/* Bottom blur glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-10 blur-[150px] bg-landing-primary rounded-full pointer-events-none" />
    </section>
  );
}
