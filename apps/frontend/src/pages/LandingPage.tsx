import {
  HeroSection,
  MentorSocialProofTrack,
  FluidWorkspace,
  DiscoveryTeaser,
  FinalCTA,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-background">
      <main className="relative">
        <HeroSection />
        <MentorSocialProofTrack />
        <FluidWorkspace />
        <DiscoveryTeaser />
        <FinalCTA />
      </main>
    </div>
  );
}
