import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin } from 'lucide-react';
import { categoryLabels } from '@/data/workers';
import { RegionMap } from '@/components/RegionMap';

export default function BecomeWorker() {
  const navigate = useNavigate();
  // Co si Šikula navolil. Obojí může být víc najednou.
  const [regions, setRegions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Přepne položku v seznamu (přidá / odebere).
  const toggle = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  // Pokračovat lze, až je vybráno aspoň jedno z obojího.
  const canContinue = regions.length > 0 && categories.length > 0;

  const handleContinue = () => {
    // Zatím (bez databáze) výběr předáme dál do registrace.
    // Až napojíme backend, uloží se k profilu Šikuly.
    navigate('/register?role=worker');
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Staňte se Šikulou</h1>
          <p className="mt-2 text-muted-foreground">
            Vyberte, kde chcete pracovat a co jste ochotni dělat. Podle toho vám budeme nabízet zakázky.
          </p>
        </div>

        {/* Výběr kraje / oblasti */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              Kde chcete pracovat?
            </CardTitle>
            <CardDescription>Klikněte na kraj v mapě — vybraný kraj se zeleně vybarví. Můžete vybrat víc krajů.</CardDescription>
          </CardHeader>
          <CardContent>
            <RegionMap
              selected={regions}
              onToggle={(name) => toggle(name, regions, setRegions)}
            />
            {/* Přehled vybraných krajů pod mapou */}
            {regions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {regions.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                  >
                    <Check className="h-3 w-3" />
                    {r}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Výběr kategorií */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Co jste ochotni dělat?</CardTitle>
            <CardDescription>Vyberte jednu nebo více kategorií.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryLabels).map(([id, label]) => {
                const selected = categories.includes(id);
                return (
                  <Button
                    key={id}
                    type="button"
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggle(id, categories, setCategories)}
                  >
                    {selected && <Check className="mr-1 h-4 w-4" />}
                    {label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Shrnutí + pokračování */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Vybráno: {regions.length} {regions.length === 1 ? 'kraj' : 'krajů'} ·{' '}
            {categories.length} {categories.length === 1 ? 'kategorie' : 'kategorií'}
          </p>
          <Button size="lg" disabled={!canContinue} onClick={handleContinue}>
            Pokračovat
          </Button>
        </div>
      </div>
    </Layout>
  );
}
