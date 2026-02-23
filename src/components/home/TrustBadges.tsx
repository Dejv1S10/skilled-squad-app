import { ShieldCheck, UserCheck, HeadphonesIcon } from 'lucide-react';

const badges = [
  {
    icon: ShieldCheck,
    title: 'Garance spokojenosti',
    description: 'Pokud nebudete spokojeni, najdeme řešení.',
  },
  {
    icon: UserCheck,
    title: 'Ověření pracovníci',
    description: 'Každý pracovník prochází důkladným ověřením.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Podpora každý den',
    description: 'Jsme tu pro vás 7 dní v týdnu.',
  },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-muted/20 py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
