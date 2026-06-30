import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function HeroSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dashboardRoute = user?.role === 'MENTOR' ? '/dashboard/mentor' : user?.role === 'ADMIN' ? '/admin' : '/dashboard/student';

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-8 overflow-hidden bg-background">
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — Copy */}
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-rs-accent text-xs font-semibold tracking-wide">
            <Zap className="w-3.5 h-3.5 fill-rs-accent text-rs-accent" />
            {t('landing.hero.badge')}
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-foreground font-display">
            {t('landing.hero.title1')} <br />
            <span className="text-rs-accent">
              {t('landing.hero.title2')}
            </span>
          </h1>

          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {user ? (
              <Button
                asChild
                size="lg"
                className="bg-rs-accent hover:bg-rs-accent-hover text-white rounded-xl text-base h-12 px-8 font-semibold transition-all duration-150"
              >
                <Link to={dashboardRoute} className="flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-rs-accent hover:bg-rs-accent-hover text-white rounded-xl text-base h-12 px-8 font-semibold transition-all duration-150"
                >
                  <Link to="/mentors" className="flex items-center gap-1.5">
                    {t('landing.hero.joinStudent')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-card border border-border text-foreground rounded-xl text-base h-12 px-8 hover:bg-muted font-semibold"
                >
                  <Link to="/register">
                    {t('landing.hero.joinMentor')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right — Visual */}
        <div className="relative hidden lg:block">
          <div className="bg-card border border-border rounded-3xl p-8 aspect-square relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-rs-accent/10 to-transparent" />
            <img
              className="w-full h-full object-cover rounded-2xl grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              alt="Hero visualization"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzRIS0KEnwfPMhlGis16NHhTF7c1M0jrkq8BBfJo0PaAZKzBKL9zhwbdxhFWF06O5KSUBykoRE-q7bys5KAHRHtiC70PBn7s6lvhaHE-CG1I4XxLtPCp5d3DgyGGpRDwActeGkl1fqGdmBTwhQObBH2GxjoRBsOEQECEeZi9bbcTVHidcc_LX7H8YYednPDDpy6rX6vTUIOu4TrCeDkZLTDBmYEpTSumUPgBXlYENPkk_UGBYiRRq96Nf9elNqbLmdalzdorrlVHtx"
            />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-card/90 backdrop-blur-sm border border-border p-4 rounded-xl flex items-center gap-3 shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-rs-success animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-foreground font-mono">
                  {t('landing.hero.mentorsActive', { count: 1240 })}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-rs-accent/10 blur-[100px] rounded-full" />
        </div>
      </div>
    </section>
  );
}
