import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/* ── Hero Section ───────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-8 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — Copy */}
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full glass-card text-primary-fixed-dim text-xs font-medium tracking-wide">
            <span className="material-symbols-outlined text-sm">bolt</span>
            Now Launching: AI Career Pathways v2.0
          </span>

          <h1 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-on-background dark:text-inverse-on-surface">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed-dim to-secondary-container">
              Tech Trajectory
            </span>
          </h1>

          <p className="text-base text-on-surface-variant dark:text-outline-variant max-w-xl leading-relaxed">
            Expert-led mentorship designed for the high-speed tech landscape.
            Unlock bespoke growth through targeted code reviews, architectural
            deep-dives, and strategic career coaching.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-landing-primary hover:bg-landing-primary/90 text-white rounded-xl text-base h-12 px-8"
            >
              <Link to="/mentors">
                Join as Student
                <span className="material-symbols-outlined ml-1">arrow_forward</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="glass-card border-outline-variant/30 text-on-background dark:text-inverse-on-surface rounded-xl text-base h-12 px-8 hover:bg-surface-container-high/20"
            >
              Join as Mentor
            </Button>
          </div>
        </div>

        {/* Right — Visual */}
        <div className="relative hidden lg:block">
          <div className="glass-card rounded-3xl p-8 aspect-square relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-landing-primary/10 to-transparent" />
            <img
              className="w-full h-full object-cover rounded-2xl grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              alt="Hero visualization"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzRIS0KEnwfPMhlGis16NHhTF7c1M0jrkq8BBfJo0PaAZKzBKL9zhwbdxhFWF06O5KSUBykoRE-q7bys5KAHRHtiC70PBn7s6lvhaHE-CG1I4XxLtPCp5d3DgyGGpRDwActeGkl1fqGdmBTwhQObBH2GxjoRBsOEQECEeZi9bbcTVHidcc_LX7H8YYednPDDpy6rX6vTUIOu4TrCeDkZLTDBmYEpTSumUPgBXlYENPkk_UGBYiRRq96Nf9elNqbLmdalzdorrlVHtx"
            />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium tracking-wide">
                  1,240 Mentors Active Now
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-landing-secondary/20 blur-[100px] rounded-full" />
        </div>
      </div>
    </section>
  );
}
