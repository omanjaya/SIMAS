import React from 'react';

import SaraswatiCtaCard from '@/components/sections/saraswati-cta-card';
import SaraswatiFAQ from '@/components/sections/saraswati-faq';
import SaraswatiFeaturesHero from '@/components/sections/saraswati-features-hero';
import SaraswatiFeaturesSolutions from '@/components/sections/saraswati-features-solutions';
import SaraswatiFeaturesTabs from '@/components/sections/saraswati-features-tabs';

const page = () => {
  return (
    <>
      <SaraswatiFeaturesHero />
      <SaraswatiFeaturesSolutions />
      <SaraswatiFeaturesTabs />
      <SaraswatiFAQ />
      <SaraswatiCtaCard />
    </>
  );
};

export default page;
