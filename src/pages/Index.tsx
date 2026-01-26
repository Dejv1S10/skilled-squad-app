import { Layout } from '@/components/layout/Layout';
import { SearchHero } from '@/components/home/SearchHero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedWorkers } from '@/components/home/FeaturedWorkers';

const Index = () => {
  return (
    <Layout>
      <SearchHero />
      <CategoryGrid />
      <FeaturedWorkers />
    </Layout>
  );
};

export default Index;
