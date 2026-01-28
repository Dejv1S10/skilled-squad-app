import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Flower2, Wrench, SprayCan, Truck, Hammer, Monitor, Heart, Car, PartyPopper, Building2 
} from 'lucide-react';

const categories = [
  {
    id: 'handyman',
    name: 'Dům & byt',
    description: 'Hodinový manžel, montáže, opravy, instalatér, elektrikář',
    icon: Wrench,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'cleaning',
    name: 'Úklid & domácnost',
    description: 'Jednorázový i pravidelný úklid, mytí oken, žehlení',
    icon: SprayCan,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'garden',
    name: 'Zahrada & exteriér',
    description: 'Sekání trávy, údržba zahrady, ploty, pergoly',
    icon: Flower2,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'moving',
    name: 'Stěhování & logistika',
    description: 'Stěhování, vyklízení, odvoz odpadu',
    icon: Truck,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'craft',
    name: 'Specializované řemeslo',
    description: 'Tesař, truhlář, zámečník, obkladač, podlahář',
    icon: Hammer,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'tech',
    name: 'Technika & IT',
    description: 'Wi-Fi, PC opravy, smart domácnost, instalace TV',
    icon: Monitor,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    id: 'care',
    name: 'Péče & výpomoc',
    description: 'Pomoc seniorům, hlídání dětí, venčení psů',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'auto',
    name: 'Auto & doprava',
    description: 'Mytí auta, čištění interiéru, drobné opravy',
    icon: Car,
    color: 'bg-slate-100 text-slate-600',
  },
  {
    id: 'events',
    name: 'Eventy & lifestyle',
    description: 'Home staging, vánoční výzdoba, pomoc při akcích',
    icon: PartyPopper,
    color: 'bg-rose-100 text-rose-600',
  },
  {
    id: 'b2b',
    name: 'Pro firmy',
    description: 'Facility management, úklid kanceláří, správa nemovitostí',
    icon: Building2,
    color: 'bg-indigo-100 text-indigo-600',
  },
];

export function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Kategorie služeb
          </h2>
          <p className="text-lg text-muted-foreground">
            Vyberte si z široké nabídky domácích prací
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
              onClick={() => navigate(`/search?category=${category.id}`)}
            >
              <CardContent className="p-6">
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${category.color}`}>
                  <category.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
