import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Layout } from '@/components/layout/Layout';
import type { Database } from '@/integrations/supabase/types';

type ServiceCategory = Database['public']['Enums']['service_category'];
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Star, Clock, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Navigate } from 'react-router-dom';

interface Order {
  id: string;
  description: string;
  status: string;
  proposed_date: string | null;
  final_price: number | null;
  created_at: string;
  customer_profile: {
    full_name: string;
  } | null;
  service: {
    name: string;
  } | null;
}

interface WorkerData {
  id: string;
  bio: string | null;
  hourly_rate: number;
  is_available: boolean;
  average_rating: number | null;
  total_reviews: number | null;
  categories: ServiceCategory[];
}

const categoryOptions: { id: ServiceCategory; label: string }[] = [
  { id: 'handyman', label: 'Dům & byt' },
  { id: 'cleaning', label: 'Úklid & domácnost' },
  { id: 'garden', label: 'Zahrada & exteriér' },
  { id: 'moving', label: 'Stěhování & logistika' },
  { id: 'craft', label: 'Specializované řemeslo' },
  { id: 'tech', label: 'Technika & IT' },
  { id: 'care', label: 'Péče & výpomoc' },
  { id: 'auto', label: 'Auto & doprava' },
  { id: 'events', label: 'Eventy & lifestyle' },
  { id: 'b2b', label: 'Pro firmy' },
];

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Čeká na potvrzení', variant: 'secondary' },
  accepted: { label: 'Potvrzeno', variant: 'default' },
  in_progress: { label: 'Probíhá', variant: 'default' },
  completed: { label: 'Dokončeno', variant: 'outline' },
  cancelled: { label: 'Zrušeno', variant: 'destructive' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isWorker, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!user || roleLoading) return;

    async function fetchData() {
      // Fetch worker profile
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (workerError || !workerData) {
        console.error('Error fetching worker:', workerError);
        setLoading(false);
        return;
      }

      setWorker(workerData);
      setBio(workerData.bio || '');
      setHourlyRate(workerData.hourly_rate?.toString() || '');
      setCategories(workerData.categories || []);
      setIsAvailable(workerData.is_available);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, description, status, proposed_date, final_price, created_at, customer_id, service_id')
        .eq('worker_id', workerData.id)
        .order('created_at', { ascending: false });

      if (ordersData && ordersData.length > 0) {
        // Fetch customer profiles
        const customerIds = ordersData.map(o => o.customer_id);
        const { data: customerProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', customerIds);

        // Fetch services
        const serviceIds = ordersData.filter(o => o.service_id).map(o => o.service_id);
        const { data: services } = serviceIds.length > 0 
          ? await supabase.from('services').select('id, name').in('id', serviceIds)
          : { data: [] };

        const ordersWithDetails = ordersData.map(order => ({
          ...order,
          customer_profile: customerProfiles?.find(p => p.user_id === order.customer_id) || null,
          service: services?.find(s => s.id === order.service_id) || null,
        }));

        setOrders(ordersWithDetails);
      }

      setLoading(false);
    }

    fetchData();
  }, [user, roleLoading]);

  const handleSaveProfile = async () => {
    if (!worker) return;

    setSaving(true);
    const { error } = await supabase
      .from('workers')
      .update({
        bio: bio.trim() || null,
        hourly_rate: parseFloat(hourlyRate) || 0,
        categories,
        is_available: isAvailable,
      })
      .eq('id', worker.id);

    setSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodařilo se uložit změny',
      });
      return;
    }

    toast({
      title: 'Uloženo',
      description: 'Profil byl úspěšně aktualizován',
    });
  };

  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject') => {
    const newStatus = action === 'accept' ? 'accepted' : 'cancelled';
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodařilo se aktualizovat objednávku',
      });
      return;
    }

    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));

    toast({
      title: action === 'accept' ? 'Objednávka přijata' : 'Objednávka zamítnuta',
    });
  };

  const handleCompleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodařilo se dokončit objednávku',
      });
      return;
    }

    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: 'completed' } : o
    ));

    toast({ title: 'Objednávka dokončena' });
  };

  if (roleLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="mb-8 h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64" />
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isWorker) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">Dashboard pracovníka</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Můj profil</span>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-normal">
                    {worker?.average_rating?.toFixed(1) || '—'} ({worker?.total_reviews || 0})
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Availability Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Dostupnost</Label>
                  <p className="text-sm text-muted-foreground">
                    {isAvailable ? 'Přijímáte objednávky' : 'Nepřijímáte objednávky'}
                  </p>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hodinová sazba (Kč)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">O mně</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Popište své zkušenosti a specializace..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Kategorie služeb</Label>
                <div className="space-y-2">
                  {categoryOptions.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <Checkbox
                        id={cat.id}
                        checked={categories.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCategories([...categories, cat.id]);
                          } else {
                            setCategories(categories.filter(c => c !== cat.id));
                          }
                        }}
                      />
                      <Label htmlFor={cat.id} className="cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Uložit změny
              </Button>
            </CardContent>
          </Card>

          {/* Orders */}
          <div className="space-y-6 lg:col-span-2">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Čeká na potvrzení</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Aktivní</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'completed').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Dokončeno</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Objednávky</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Zatím nemáte žádné objednávky
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {order.customer_profile?.full_name || 'Neznámý zákazník'}
                            </p>
                            {order.service && (
                              <p className="text-sm text-primary">{order.service.name}</p>
                            )}
                          </div>
                          <Badge variant={statusLabels[order.status]?.variant || 'secondary'}>
                            {statusLabels[order.status]?.label || order.status}
                          </Badge>
                        </div>
                        
                        <p className="mt-2 text-sm text-muted-foreground">
                          {order.description}
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Vytvořeno: {format(new Date(order.created_at), 'd. M. yyyy', { locale: cs })}
                          </span>
                          {order.proposed_date && (
                            <span>
                              Termín: {format(new Date(order.proposed_date), 'd. M. yyyy HH:mm', { locale: cs })}
                            </span>
                          )}
                        </div>

                        {order.status === 'pending' && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'accept')}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Přijmout
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderAction(order.id, 'reject')}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Odmítnout
                            </Button>
                          </div>
                        )}

                        {order.status === 'accepted' && (
                          <Button
                            size="sm"
                            className="mt-4"
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            Označit jako dokončené
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
