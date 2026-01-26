import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, CircleCheck, Search, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Worker {
  id: string;
  user_id: string;
  bio: string | null;
  hourly_rate: number;
  is_available: boolean;
  average_rating: number | null;
  total_reviews: number | null;
  categories: string[];
  profile: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  services?: {
    name: string;
    description: string | null;
  }[];
}

const categoryLabels: Record<string, string> = {
  garden: 'Zahrada',
  handyman: 'Kutilství',
  cleaning: 'Úklid',
  moving: 'Stěhování',
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWorkers() {
      setLoading(true);
      let query = supabase
        .from('workers')
        .select(`
          id,
          user_id,
          bio,
          hourly_rate,
          is_available,
          average_rating,
          total_reviews,
          categories
        `)
        .eq('is_available', true);

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.contains('categories', [categoryFilter]);
      }

      if (sortBy === 'rating') {
        query = query.order('average_rating', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'price_asc') {
        query = query.order('hourly_rate', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('hourly_rate', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching workers:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const userIds = data.map(w => w.user_id);
        const workerIds = data.map(w => w.id);
        
        // Fetch profiles and services in parallel
        const [profilesResult, servicesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', userIds),
          supabase
            .from('services')
            .select('worker_id, name, description')
            .in('worker_id', workerIds)
        ]);

        const profiles = profilesResult.data;
        const services = servicesResult.data;

        let workersWithData = data.map(worker => ({
          ...worker,
          profile: profiles?.find(p => p.user_id === worker.user_id) || null,
          services: services?.filter(s => s.worker_id === worker.id) || [],
        }));

        // Filter by search query - now includes service names
        const q = searchParams.get('q')?.toLowerCase();
        if (q) {
          workersWithData = workersWithData.filter(worker =>
            worker.profile?.full_name?.toLowerCase().includes(q) ||
            worker.bio?.toLowerCase().includes(q) ||
            worker.categories?.some(cat => categoryLabels[cat]?.toLowerCase().includes(q)) ||
            worker.services?.some(service => 
              service.name?.toLowerCase().includes(q) ||
              service.description?.toLowerCase().includes(q)
            )
          );
        }

        setWorkers(workersWithData);
      } else {
        setWorkers([]);
      }
      setLoading(false);
    }

    fetchWorkers();
  }, [searchParams, categoryFilter, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Hledat pracovníky..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12"
              />
            </div>
            <Button type="submit" size="lg">
              Hledat
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtry:</span>
            </div>
            
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny kategorie</SelectItem>
                <SelectItem value="garden">Zahrada</SelectItem>
                <SelectItem value="handyman">Kutilství</SelectItem>
                <SelectItem value="cleaning">Úklid</SelectItem>
                <SelectItem value="moving">Stěhování</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Řadit podle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Hodnocení</SelectItem>
                <SelectItem value="price_asc">Cena ↑</SelectItem>
                <SelectItem value="price_desc">Cena ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {loading ? 'Hledám...' : `Nalezeno ${workers.length} pracovníků`}
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-12 w-full" />
                  <Skeleton className="mt-4 h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Bohužel jsme nenašli žádné dostupné pracovníky.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Zkuste změnit vyhledávací kritéria.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workers.map((worker) => (
              <Card
                key={worker.id}
                className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                onClick={() => navigate(`/worker/${worker.id}`)}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="relative">
                      {worker.profile?.avatar_url ? (
                        <img 
                          src={worker.profile.avatar_url} 
                          alt={worker.profile.full_name || 'Avatar'} 
                          className="h-16 w-16 rounded-full object-cover bg-muted"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                          {worker.profile?.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                      {worker.is_available && (
                        <CircleCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary">
                        {worker.profile?.full_name || 'Neznámý pracovník'}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {worker.average_rating?.toFixed(1) || '—'}
                        </span>
                        <span className="text-muted-foreground">
                          ({worker.total_reviews || 0} recenzí)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {worker.bio || 'Žádný popis'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {worker.categories?.slice(0, 3).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <span className="text-lg font-bold text-primary">
                      {worker.hourly_rate} Kč
                    </span>
                    <span className="text-sm text-muted-foreground"> / hodina</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
