import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CircleCheck } from 'lucide-react';
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
}

const categoryLabels: Record<string, string> = {
  handyman: 'Dům & byt',
  cleaning: 'Úklid & domácnost',
  garden: 'Zahrada & exteriér',
  moving: 'Stěhování & logistika',
  craft: 'Specializované řemeslo',
  tech: 'Technika & IT',
  care: 'Péče & výpomoc',
  auto: 'Auto & doprava',
  events: 'Eventy & lifestyle',
  b2b: 'Pro firmy',
};

export function FeaturedWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWorkers() {
      const { data, error } = await supabase
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
        .eq('is_available', true)
        .order('average_rating', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching workers:', error);
        setLoading(false);
        return;
      }

      // Fetch profiles for workers
      if (data && data.length > 0) {
        const userIds = data.map(w => w.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const workersWithProfiles = data.map(worker => ({
          ...worker,
          profile: profiles?.find(p => p.user_id === worker.user_id) || null,
        }));

        setWorkers(workersWithProfiles);
      }
      setLoading(false);
    }

    fetchWorkers();
  }, []);

  if (loading) {
    return (
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Doporučení pracovníci
            </h2>
            <p className="text-lg text-muted-foreground">
              Nejlépe hodnocení dostupní pomocníci
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-16 w-16 rounded-full" />
                  <Skeleton className="mb-2 h-6 w-32" />
                  <Skeleton className="mb-4 h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (workers.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Doporučení pracovníci
          </h2>
          <p className="text-lg text-muted-foreground">
            Nejlépe hodnocení dostupní pomocníci
          </p>
        </div>

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
      </div>
    </section>
  );
}
