import React from 'react';

import SaraswatiComparisonPlan from '@/components/sections/saraswati-comparison-plan';
import SaraswatiCtaCard from '@/components/sections/saraswati-cta-card';
import SaraswatiFAQ from '@/components/sections/saraswati-faq';
import SaraswatiPricingHero from '@/components/sections/saraswati-pricing-hero';

const page = () => {
  return (
    <>
      <SaraswatiPricingHero />
      <SaraswatiComparisonPlan />
      <SaraswatiFAQ softBg={true} />
      <SaraswatiCtaCard softBg={true} />
    </>
  );
};

export default page;
