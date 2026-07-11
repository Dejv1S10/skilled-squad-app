// Společná stránka objednávky pro všechny kategorie (kromě Stěhování).
// Poskládá se sama z dat v taskForms.ts: klikací otázky + adresa + detaily.
import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Check, X, Wrench, Sparkles, TreePine, Hammer, Monitor, Heart, Car, PartyPopper, Building2 } from 'lucide-react';
import { taskForms, TaskQuestion } from '@/data/taskForms';

// Ikona pro hlavičku stránky podle kategorie.
const categoryIcons: Record<string, typeof Wrench> = {
  handyman: Wrench,
  cleaning: Sparkles,
  garden: TreePine,
  craft: Hammer,
  tech: Monitor,
  care: Heart,
  auto: Car,
  events: PartyPopper,
  b2b: Building2,
};

// Jedna klikací otázka (dlaždice s možnostmi, případně Ano/Ne).
function QuestionBlock({
  question,
  value,
  onSelect,
}: {
  question: TaskQuestion;
  value: string;
  onSelect: (optionId: string) => void;
}) {
  // Ano/Ne má speciální vzhled: zelená fajfka / červený křížek.
  if (question.yesNo) {
    return (
      <div className="space-y-2">
        <Label>{question.label}</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelect('yes')}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 font-medium transition-all ${
              value === 'yes'
                ? 'border-green-500 bg-green-500/10 text-green-600'
                : 'border-border hover:border-green-500/50'
            }`}
          >
            <Check className="h-5 w-5" />
            Ano
          </button>
          <button
            type="button"
            onClick={() => onSelect('no')}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 font-medium transition-all ${
              value === 'no'
                ? 'border-red-500 bg-red-500/10 text-red-600'
                : 'border-border hover:border-red-500/50'
            }`}
          >
            <X className="h-5 w-5" />
            Ne
          </button>
        </div>
      </div>
    );
  }

  // Běžná otázka: dlaždice vedle sebe.
  return (
    <div className="space-y-2">
      <Label>{question.label}</Label>
      <div className={`grid gap-3 ${question.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
        {question.options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all ${
                selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-base font-semibold">{opt.label}</span>
              {opt.desc && <span className="text-xs text-muted-foreground">{opt.desc}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TaskOrder() {
  const navigate = useNavigate();
  const { catId = '', subId = '' } = useParams();

  const config = taskForms[catId];
  const sub = config?.subcategories.find((s) => s.id === subId);

  // Odpovědi na otázky (id otázky -> id vybrané možnosti).
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');

  // Neznámá kategorie/podkategorie -> zpět na úvod.
  if (!config || !sub) return <Navigate to="/" replace />;

  const Icon = categoryIcons[catId] ?? Wrench;

  // Pokračovat lze, až jsou zodpovězené všechny otázky a vyplněná adresa.
  const canContinue =
    config.questions.every((q) => answers[q.id]) && address.trim() !== '';

  const handleContinue = () => {
    // Zatím (bez databáze) přejdeme na vyhledávání Šikulů pro danou službu.
    navigate(`/search?q=${encodeURIComponent(sub.name)}`);
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{sub.name}</h1>
          <p className="mt-2 text-muted-foreground">
            Pár rychlých otázek a najdeme vám správné Šikuly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detaily úkolu</CardTitle>
            <CardDescription>Stačí klikat — psát budete jen adresu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Klikací otázky dané kategorie */}
            {config.questions.map((q) => (
              <QuestionBlock
                key={q.id}
                question={q}
                value={answers[q.id] ?? ''}
                onSelect={(optionId) => setAnswers((a) => ({ ...a, [q.id]: optionId }))}
              />
            ))}

            {/* Adresa */}
            <div className="space-y-2">
              <Label htmlFor="address">Kde to bude?</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Např. Fantova 26, Praha 6"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Volitelné detaily */}
            <div className="space-y-2">
              <Label htmlFor="details">
                Chcete něco doplnit? <span className="text-muted-foreground">(nepovinné)</span>
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Cokoliv, co by měl Šikula vědět předem…"
                rows={3}
              />
            </div>

            <Button size="lg" className="w-full" disabled={!canContinue} onClick={handleContinue}>
              Najít Šikuly
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
