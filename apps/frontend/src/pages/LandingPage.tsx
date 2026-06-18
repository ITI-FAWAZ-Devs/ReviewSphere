import { useEffect } from 'react';
import {
  HeroSection,
  MentorSocialProofTrack,
  FluidWorkspace,
  DiscoveryTeaser,
  FinalCTA,
} from '@/components/landing';

export default function LandingPage() {
  /* Glass-card mouse-follow glow effect */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.glass-card') as NodeListOf<HTMLElement>;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        if (x > 0 && x < 1 && y > 0 && y < 1) {
          card.style.setProperty('--x', `${x * 100}%`);
          card.style.setProperty('--y', `${y * 100}%`);
        }
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="overflow-x-hidden landing-page-root">
      <main className="relative">
        <div className="absolute inset-0 noise-bg pointer-events-none" />
        <HeroSection />
        <MentorSocialProofTrack />
        <FluidWorkspace />
        <DiscoveryTeaser />
        <FinalCTA />
      </main>
    </div>
  );
}
