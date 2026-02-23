import { Layout } from '@/components/layout/Layout';
import { SearchHero } from '@/components/home/SearchHero';
import { PopularProjects } from '@/components/home/PopularProjects';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TrustBadges } from '@/components/home/TrustBadges';
import { Testimonials } from '@/components/home/Testimonials';
import { FeaturedWorkers } from '@/components/home/FeaturedWorkers';

const Index = () => {
  return (
    <Layout>
      <SearchHero />
      <PopularProjects />
      <TrustBadges />
      <FeaturedWorkers />
      <HowItWorks />
      <Testimonials />
    </Layout>
  );
};

export default Index;
