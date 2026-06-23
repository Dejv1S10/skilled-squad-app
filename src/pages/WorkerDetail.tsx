import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, CircleCheck, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { getWorkerById, categoryLabels } from '@/data/workers';

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const worker = id ? getWorkerById(id) : undefined;

  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [description, setDescription] = useState('');
  const [proposedDate, setProposedDate] = useState('');

  // Odeslání objednávky – zatím čistě frontend, jen potvrzení (bez databáze)
  const handleOrder = () => {
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Prosím popište, co potřebujete udělat',
      });
      return;
    }

    toast({
      title: 'Objednávka odeslána!',
      description: `Váš požadavek byl odeslán Šikulovi ${worker?.full_name}.`,
    });
    setOrderOpen(false);
    setDescription('');
    setSelectedService('');
    setProposedDate('');
  };

  if (!worker) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">Šikula nenalezen</h1>
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
          {/* Hlavní obsah */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hlavička profilu */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative">
                    {worker.avatar_url ? (
                      <img
                        src={worker.avatar_url}
                        alt={worker.full_name}
                        className="h-24 w-24 rounded-full object-cover bg-muted"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                        {worker.full_name.charAt(0)}
                      </div>
                    )}
                    {worker.is_available && (
                      <CircleCheck className="absolute -bottom-1 -right-1 h-6 w-6 text-green-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">{worker.full_name}</h1>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${i <= Math.round(worker.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                              />
                            ))}
                            <span className="ml-1 font-semibold">{worker.average_rating.toFixed(1)}</span>
                          </div>
                          <span className="text-muted-foreground">({worker.total_reviews} recenzí)</span>
                        </div>
                      </div>
                      <Badge variant={worker.is_available ? 'default' : 'secondary'}>
                        {worker.is_available ? 'Dostupný' : 'Nedostupný'}
                      </Badge>
                    </div>

                    <p className="mt-4 text-muted-foreground">{worker.bio}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {worker.categories.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {categoryLabels[cat] || cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nabízené služby */}
            {worker.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nabízené služby</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {worker.services.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary">{service.price} Kč</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recenze */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recenze ({worker.reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {worker.reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground">Zatím žádné recenze</p>
                ) : (
                  <div className="space-y-4">
                    {worker.reviews.map((review, idx) => (
                      <div key={idx} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{review.author}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(review.date), 'd. MMMM yyyy', { locale: cs })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Boční panel – objednávka */}
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>Objednat službu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-bold text-primary">{worker.hourly_rate} Kč</span>
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
                                <SelectItem key={service.name} value={service.name}>
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

                      <Button className="w-full" onClick={handleOrder}>
                        Odeslat objednávku
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {!worker.is_available && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Tento Šikula momentálně nepřijímá objednávky.
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
