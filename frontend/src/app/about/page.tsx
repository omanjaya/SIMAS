import SaraswatiAboutHero from '@/components/sections/saraswati-about-hero';
import SaraswatiCoreValues from '@/components/sections/saraswati-core-values';
import SaraswatiCtaCard from '@/components/sections/saraswati-cta-card';
import SaraswatiMission from '@/components/sections/saraswati-mission';
import SaraswatiTeamMembers from '@/components/sections/saraswati-team-members';

export default function AboutPage() {
  return (
    <>
      <SaraswatiAboutHero />
      <SaraswatiMission />
      <SaraswatiCoreValues />
      <SaraswatiTeamMembers />
      <SaraswatiCtaCard />
    </>
  );
}
