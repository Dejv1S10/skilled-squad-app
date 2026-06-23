import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, CircleCheck, Search, SlidersHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { WORKERS, categoryLabels, normalize } from '@/data/workers';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const displayWorkers = useMemo(() => {
    const q = normalize(searchParams.get('q') || '');

    let result = WORKERS.filter(worker => {
      const inCategory = categoryFilter === 'all' || worker.categories.includes(categoryFilter);
      const inPrice = worker.hourly_rate >= priceRange[0] && worker.hourly_rate <= priceRange[1];
      const matchesQuery = !q ||
        normalize(worker.full_name).includes(q) ||
        normalize(worker.bio).includes(q) ||
        worker.services.some(s => normalize(s.name).includes(q)) ||
        worker.categories.some(cat => normalize(categoryLabels[cat] || '').includes(q));
      return inCategory && inPrice && matchesQuery;
    });

    if (sortBy === 'rating') result = [...result].sort((a, b) => b.average_rating - a.average_rating);
    else if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.hourly_rate - b.hourly_rate);
    else if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.hourly_rate - a.hourly_rate);

    return result;
  }, [searchParams, categoryFilter, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    else params.delete('q');
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') params.set('category', value);
    else params.delete('category');
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="container py-8">
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
            <Button type="submit" size="lg">Hledat</Button>
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
                <SelectItem value="handyman">Dům & byt</SelectItem>
                <SelectItem value="cleaning">Úklid & domácnost</SelectItem>
                <SelectItem value="garden">Zahrada & exteriér</SelectItem>
                <SelectItem value="moving">Stěhování & logistika</SelectItem>
                <SelectItem value="craft">Specializované řemeslo</SelectItem>
                <SelectItem value="tech">Technika & IT</SelectItem>
                <SelectItem value="care">Péče & výpomoc</SelectItem>
                <SelectItem value="auto">Auto & doprava</SelectItem>
                <SelectItem value="events">Eventy & lifestyle</SelectItem>
                <SelectItem value="b2b">Pro firmy</SelectItem>
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

            <div className="flex items-center gap-3 min-w-[200px]">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">
                Cena: {priceRange[0]}–{priceRange[1]} Kč/h
              </Label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={1000}
                step={50}
                className="w-40"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Nalezeno {displayWorkers.length} pracovníků</h2>
        </div>

        {displayWorkers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">Bohužel jsme nenašli žádné dostupné pracovníky.</p>
            <p className="mt-2 text-sm text-muted-foreground">Zkuste změnit vyhledávací kritéria.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayWorkers.map((worker) => (
              <Card
                key={worker.id}
                onClick={() => navigate(`/worker/${worker.id}`)}
                className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="relative">
                      {worker.avatar_url ? (
                        <img
                          src={worker.avatar_url}
                          alt={worker.full_name}
                          className="h-16 w-16 rounded-full object-cover bg-muted"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                          {worker.full_name.charAt(0)}
                        </div>
                      )}
                      {worker.is_available && (
                        <CircleCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary">
                        {worker.full_name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i <= Math.round(worker.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                          />
                        ))}
                        <span className="ml-1 font-medium">{worker.average_rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({worker.total_reviews} recenzí)</span>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{worker.bio}</p>

                  <div className="flex flex-wrap gap-2">
                    {worker.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <span className="text-lg font-bold text-primary">{worker.hourly_rate} Kč</span>
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
