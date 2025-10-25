import React from 'react';

import SaraswatiContentsSection from '@/components/sections/saraswati-contents-section';
import SaraswatiCtaCard from '@/components/sections/saraswati-cta-card';
import SaraswatiFAQ from '@/components/sections/saraswati-faq';
import SaraswatiFeatureBullets from '@/components/sections/saraswati-features-bullets';
import SaraswatiLogos from '@/components/sections/saraswati-logos';
import SaraswatiSolutionsHero from '@/components/sections/saraswati-solutions-hero';

const page = () => {
  return (
    <>
      <SaraswatiSolutionsHero />
      <SaraswatiLogos />
      <SaraswatiContentsSection />
      <SaraswatiFeatureBullets />
      <SaraswatiFAQ />
      <SaraswatiCtaCard />
    </>
  );
};

export default page;
