import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Jana K.',
    text: 'Jan mi udělal zahradu jako z časopisu. Profesionální přístup, vše uklizeno. Určitě ho objednám znovu!',
    service: 'Údržba zahrady',
    rating: 5,
  },
  {
    name: 'Petr M.',
    text: 'Tomáš mi nastavil celou smart domácnost včetně Wi-Fi. Konečně vše funguje bezchybně.',
    service: 'Smart Home',
    rating: 5,
  },
  {
    name: 'Marie S.',
    text: 'Lucie je úžasná pečovatelka. S babičkou si skvěle rozumí a já mám konečně klid.',
    service: 'Péče o seniory',
    rating: 5,
  },
  {
    name: 'Tomáš V.',
    text: 'Martin mi vyrobil zakázkovou skříň přesně podle mých představ. Precizní práce do posledního detailu.',
    service: 'Truhlářské práce',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <h2 className="mb-4 text-center text-2xl font-bold text-foreground md:text-3xl">
          Co říkají naši zákazníci
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Tisíce spokojených zákazníků po celé ČR
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Quote className="mb-3 h-6 w-6 text-primary/30" />
                <div className="mb-3 flex gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  "{t.text}"
                </p>
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.service}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
