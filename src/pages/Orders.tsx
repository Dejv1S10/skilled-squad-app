import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Navigate, useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  description: string;
  status: string;
  proposed_date: string | null;
  final_price: number | null;
  created_at: string;
  worker_id: string;
  worker_profile: {
    full_name: string;
  } | null;
  service: {
    name: string;
  } | null;
  has_review: boolean;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Čeká na potvrzení', variant: 'secondary' },
  accepted: { label: 'Potvrzeno', variant: 'default' },
  in_progress: { label: 'Probíhá', variant: 'default' },
  completed: { label: 'Dokončeno', variant: 'outline' },
  cancelled: { label: 'Zrušeno', variant: 'destructive' },
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!user || authLoading) return;

    async function fetchOrders() {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('id, description, status, proposed_date, final_price, created_at, worker_id, service_id')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
        return;
      }

      if (ordersData && ordersData.length > 0) {
        // Fetch worker profiles
        const workerIds = ordersData.map(o => o.worker_id);
        const { data: workers } = await supabase
          .from('workers')
          .select('id, user_id')
          .in('id', workerIds);

        const userIds = workers?.map(w => w.user_id) || [];
        const { data: profiles } = userIds.length > 0
          ? await supabase.from('profiles').select('user_id, full_name').in('user_id', userIds)
          : { data: [] };

        // Fetch services
        const serviceIds = ordersData.filter(o => o.service_id).map(o => o.service_id);
        const { data: services } = serviceIds.length > 0
          ? await supabase.from('services').select('id, name').in('id', serviceIds)
          : { data: [] };

        // Check for existing reviews
        const orderIds = ordersData.map(o => o.id);
        const { data: reviews } = await supabase
          .from('reviews')
          .select('order_id')
          .in('order_id', orderIds);

        const reviewedOrderIds = new Set(reviews?.map(r => r.order_id) || []);

        const ordersWithDetails = ordersData.map(order => {
          const worker = workers?.find(w => w.id === order.worker_id);
          const profile = profiles?.find(p => p.user_id === worker?.user_id);
          return {
            ...order,
            worker_profile: profile || null,
            service: services?.find(s => s.id === order.service_id) || null,
            has_review: reviewedOrderIds.has(order.id),
          };
        });

        setOrders(ordersWithDetails);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [user, authLoading]);

  const handleSubmitReview = async () => {
    if (!reviewOrder || !user) return;

    setReviewLoading(true);

    const { error } = await supabase.from('reviews').insert({
      order_id: reviewOrder.id,
      customer_id: user.id,
      worker_id: reviewOrder.worker_id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    });

    setReviewLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodařilo se odeslat recenzi',
      });
      return;
    }

    toast({
      title: 'Děkujeme!',
      description: 'Vaše recenze byla uložena',
    });

    setOrders(orders.map(o => 
      o.id === reviewOrder.id ? { ...o, has_review: true } : o
    ));
    setReviewOrder(null);
    setReviewRating(5);
    setReviewComment('');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">Moje objednávky</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Zatím nemáte žádné objednávky
            </p>
            <Button onClick={() => navigate('/search')}>
              Najít pracovníka
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {order.worker_profile?.full_name || 'Neznámý pracovník'}
                      </p>
                      {order.service && (
                        <p className="text-primary">{order.service.name}</p>
                      )}
                    </div>
                    <Badge variant={statusLabels[order.status]?.variant || 'secondary'}>
                      {statusLabels[order.status]?.label || order.status}
                    </Badge>
                  </div>

                  <p className="mt-3 text-muted-foreground">
                    {order.description}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Vytvořeno: {format(new Date(order.created_at), 'd. MMMM yyyy', { locale: cs })}
                    </span>
                    {order.proposed_date && (
                      <span>
                        Termín: {format(new Date(order.proposed_date), 'd. MMMM yyyy HH:mm', { locale: cs })}
                      </span>
                    )}
                  </div>

                  {order.status === 'completed' && !order.has_review && (
                    <Dialog open={reviewOrder?.id === order.id} onOpenChange={(open) => !open && setReviewOrder(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          className="mt-4" 
                          variant="outline"
                          onClick={() => setReviewOrder(order)}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Ohodnotit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ohodnotit práci</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Hodnocení</Label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1"
                                >
                                  <Star
                                    className={`h-8 w-8 ${
                                      star <= reviewRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="comment">Komentář (volitelný)</Label>
                            <Textarea
                              id="comment"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Popište svou zkušenost..."
                              rows={4}
                            />
                          </div>

                          <Button
                            className="w-full"
                            onClick={handleSubmitReview}
                            disabled={reviewLoading}
                          >
                            {reviewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Odeslat recenzi
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {order.has_review && (
                    <p className="mt-4 text-sm text-green-600 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-green-600" />
                      Recenze odeslána
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
