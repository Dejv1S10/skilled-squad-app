import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CircleCheck, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_profile: {
    full_name: string;
  } | null;
}

interface WorkerData {
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
    phone: string | null;
  } | null;
  services: Service[];
  reviews: Review[];
}

const categoryLabels: Record<string, string> = {
  garden: 'Zahrada',
  handyman: 'Kutilství',
  cleaning: 'Úklid',
  moving: 'Stěhování',
};

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Order form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [description, setDescription] = useState('');
  const [proposedDate, setProposedDate] = useState('');

  useEffect(() => {
    async function fetchWorker() {
      if (!id) return;

      const { data: workerData, error } = await supabase
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
        .eq('id', id)
        .maybeSingle();

      if (error || !workerData) {
        console.error('Error fetching worker:', error);
        setLoading(false);
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone')
        .eq('user_id', workerData.user_id)
        .maybeSingle();

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('worker_id', id);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, customer_id')
        .eq('worker_id', id)
        .order('created_at', { ascending: false });

      // Fetch customer profiles for reviews
      let reviewsWithProfiles: Review[] = [];
      if (reviewsData && reviewsData.length > 0) {
        const customerIds = reviewsData.map(r => r.customer_id);
        const { data: customerProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', customerIds);

        reviewsWithProfiles = reviewsData.map(review => ({
          ...review,
          customer_profile: customerProfiles?.find(p => p.user_id === review.customer_id) || null,
        }));
      }

      setWorker({
        ...workerData,
        profile: profileData,
        services: servicesData || [],
        reviews: reviewsWithProfiles,
      });
      setLoading(false);
    }

    fetchWorker();
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Prosím popište, co potřebujete udělat',
      });
      return;
    }

    setOrderLoading(true);

    const { error } = await supabase.from('orders').insert({
      customer_id: user.id,
      worker_id: id,
      service_id: selectedService || null,
      description: description.trim(),
      proposed_date: proposedDate ? new Date(proposedDate).toISOString() : null,
    });

    setOrderLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodařilo se odeslat objednávku',
      });
      return;
    }

    toast({
      title: 'Úspěch!',
      description: 'Objednávka byla odeslána pracovníkovi',
    });
    setOrderOpen(false);
    setDescription('');
    setSelectedService('');
    setProposedDate('');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="mb-4 h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!worker) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">Pracovník nenalezen</h1>
          <Button onClick={() => navigate('/search')} className="mt-4">
            Zpět na vyhledávání
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative">
                    {worker.profile?.avatar_url ? (
                      <img 
                        src={worker.profile.avatar_url} 
                        alt={worker.profile.full_name || 'Avatar'} 
                        className="h-24 w-24 rounded-full object-cover bg-muted"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                        {worker.profile?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    {worker.is_available && (
                      <CircleCheck className="absolute -bottom-1 -right-1 h-6 w-6 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">
                          {worker.profile?.full_name || 'Neznámý pracovník'}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {worker.average_rating?.toFixed(1) || '—'}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            ({worker.total_reviews || 0} recenzí)
                          </span>
                        </div>
                      </div>
                      <Badge variant={worker.is_available ? 'default' : 'secondary'}>
                        {worker.is_available ? 'Dostupný' : 'Nedostupný'}
                      </Badge>
                    </div>

                    <p className="mt-4 text-muted-foreground">
                      {worker.bio || 'Tento pracovník zatím nemá popis.'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {worker.categories?.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {categoryLabels[cat] || cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            {worker.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nabízené služby</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {worker.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                          <Badge variant="outline" className="mt-1">
                            {categoryLabels[service.category] || service.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary">
                            {service.price} Kč
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recenze ({worker.reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {worker.reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Zatím žádné recenze
                  </p>
                ) : (
                  <div className="space-y-4">
                    {worker.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {review.customer_profile?.full_name || 'Anonymní zákazník'}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(review.created_at), 'd. MMMM yyyy', { locale: cs })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Order Card */}
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>Objednat službu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-bold text-primary">
                    {worker.hourly_rate} Kč
                  </span>
                  <span className="text-muted-foreground">/ hodina</span>
                </div>

                <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" disabled={!worker.is_available}>
                      {worker.is_available ? 'Objednat službu' : 'Nedostupný'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nová objednávka</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {worker.services.length > 0 && (
                        <div className="space-y-2">
                          <Label>Vyberte službu (volitelné)</Label>
                          <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger>
                              <SelectValue placeholder="Vyberte službu" />
                            </SelectTrigger>
                            <SelectContent>
                              {worker.services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name} - {service.price} Kč
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Popište, co potřebujete *</Label>
                        <Textarea
                          id="description"
                          placeholder="Např.: Potřebuji posekat trávník o rozloze cca 200m², odvoz trávy není potřeba."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Navrhovaný termín</Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          value={proposedDate}
                          onChange={(e) => setProposedDate(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleOrder}
                        disabled={orderLoading}
                      >
                        {orderLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Odeslat objednávku
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {!worker.is_available && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Tento pracovník momentálně nepřijímá objednávky.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
