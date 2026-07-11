import { Layout } from '@/components/layout/Layout';
import { SearchHero } from '@/components/home/SearchHero';
import { PopularProjects } from '@/components/home/PopularProjects';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TrustBadges } from '@/components/home/TrustBadges';
import { Testimonials } from '@/components/home/Testimonials';
import { FeaturedWorkers } from '@/components/home/FeaturedWorkers';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  // Přihlášený uživatel vidí jen vyhledávání (čistá stránka jako TaskRabbit).
  // Marketingové bloky (populární služby, recenze…) jsou jen pro návštěvníky.
  return (
    <Layout>
      <SearchHero />
      {!user && (
        <>
          <PopularProjects />
          <TrustBadges />
          <FeaturedWorkers />
          <HowItWorks />
          <Testimonials />
        </>
      )}
    </Layout>
  );
};

export default Index;
