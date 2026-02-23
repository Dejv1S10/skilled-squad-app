import { Search, CalendarCheck, Star } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: Search,
    title: 'Vyberte si pracovníka',
    description: 'Prohlédněte si profily, hodnocení a ceny ověřených pracovníků ve vašem okolí.',
  },
  {
    number: '2',
    icon: CalendarCheck,
    title: 'Domluvte termín',
    description: 'Objednejte službu a dohodněte se na datu a čase, který vám vyhovuje.',
  },
  {
    number: '3',
    icon: Star,
    title: 'Ohodnoťte práci',
    description: 'Po dokončení ohodnoťte pracovníka a pomozte ostatním s výběrem.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container">
        <h2 className="mb-4 text-center text-2xl font-bold text-foreground md:text-3xl">
          Jak to funguje
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Jednoduše ve třech krocích
        </p>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
