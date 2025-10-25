import React from 'react';

import SaraswatiCtaCard from '@/components/sections/saraswati-cta-card';
import SaraswatiIntegrationsHero from '@/components/sections/saraswati-integrations-hero';
import SaraswatiIntegrationsList, {
  IntegrationCard,
} from '@/components/sections/saraswati-integrations-list';
import { getAllIntegrations } from '@/lib/integrations';

const page = () => {
  const all = getAllIntegrations();

  const items: IntegrationCard[] = all.map((i) => ({
    slug: i.slug,
    name: i.title,
    category: i.category,
    summary: i.summary,
    icon: i.icon,
    badges: i.badges,
  }));

  return (
    <>
      <SaraswatiIntegrationsHero />
      <SaraswatiIntegrationsList items={items} />
      <SaraswatiCtaCard />
    </>
  );
};

export default page;
