import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Truck, Clock, Check, X } from 'lucide-react';
import { RouteMap } from '@/components/RouteMap';

// Tři varianty délky stěhování.
const DURATIONS = [
  { id: '0-2', label: '0–2 hodiny', desc: 'Drobné stěhování' },
  { id: '3-4', label: '3–4 hodiny', desc: 'Středně velké' },
  { id: '4+', label: '4+ hodin', desc: 'Velké stěhování' },
];

export default function StehovaniOrder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Z jaké podkategorie zákazník přišel (např. „dodavka", „pomoc").
  const typ = params.get('typ');
  const isVan = typ === 'dodavka';
  // Nadpis podle typu stěhování.
  const titles: Record<string, string> = {
    dodavka: 'Stěhování s dodávkou',
    pomoc: 'Pomoc se stěhováním',
  };
  const title = (typ && titles[typ]) || 'Stěhování';

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [duration, setDuration] = useState('');
  const [details, setDetails] = useState('');
  // U stěhování s dodávkou je auto potřeba → rovnou předvybereme „Ano".
  const [needsCar, setNeedsCar] = useState(isVan ? 'yes' : '');

  // Pokračovat lze, až je vyplněno odkud, kam i délka.
  const canContinue = from.trim() !== '' && to.trim() !== '' && duration !== '';

  const handleContinue = () => {
    // Zatím (bez databáze) jen přejdeme na vyhledávání stěhováků.
    navigate('/search?q=Stěhování');
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Truck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            Řekněte nám odkud, kam a jak velké stěhování to bude. Najdeme vám správné Šikuly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detaily stěhování</CardTitle>
            <CardDescription>Vyplňte prosím všechna pole.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Je potřeba auto? */}
            <div className="space-y-2">
              <Label>Je potřeba, aby Šikula měl auto?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNeedsCar('yes')}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 font-medium transition-all ${
                    needsCar === 'yes'
                      ? 'border-green-500 bg-green-500/10 text-green-600'
                      : 'border-border hover:border-green-500/50'
                  }`}
                >
                  <Check className="h-5 w-5" />
                  Ano
                </button>
                <button
                  type="button"
                  onClick={() => setNeedsCar('no')}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 font-medium transition-all ${
                    needsCar === 'no'
                      ? 'border-red-500 bg-red-500/10 text-red-600'
                      : 'border-border hover:border-red-500/50'
                  }`}
                >
                  <X className="h-5 w-5" />
                  Ne
                </button>
              </div>
            </div>

            {/* Odkud */}
            <div className="space-y-2">
              <Label htmlFor="from">Odkud</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Např. Fantova 26, Praha 6"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Kam */}
            <div className="space-y-2">
              <Label htmlFor="to">Kam</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Např. Hlavní 10, Brno"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mapa s trasou Odkud → Kam (zobrazí se po vyplnění obou adres) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Trasa stěhování
              </Label>
              <RouteMap from={from} to={to} />
            </div>

            {/* Jak dlouho? */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Jak dlouho?
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {DURATIONS.map((d) => {
                  const selected = duration === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuration(d.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-base font-semibold">{d.label}</span>
                      <span className="text-xs text-muted-foreground">{d.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popis detailů — volné pole pro zákazníka */}
            <div className="space-y-2">
              <Label htmlFor="details">Popiš detaily stěhování</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Např. stěhuju 2+kk ve 3. patře bez výtahu, mám pračku, ledničku a cca 15 krabic. Potřebuju i pomoc se zabalením."
                rows={5}
              />
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Najít stěhováky
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
