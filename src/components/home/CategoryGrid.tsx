import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Flower2, Wrench, SprayCan, Truck } from 'lucide-react';

const categories = [
  {
    id: 'garden',
    name: 'Zahradní práce',
    description: 'Sekání trávy, prořez stromů, úprava záhonů',
    icon: Flower2,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'handyman',
    name: 'Kutilství',
    description: 'Sestavení nábytku, drobné opravy, montáže',
    icon: Wrench,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'cleaning',
    name: 'Úklid',
    description: 'Domácnost, kanceláře, po rekonstrukci',
    icon: SprayCan,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'moving',
    name: 'Stěhování',
    description: 'Přesuny nábytku, stěhování bytů, sklepy',
    icon: Truck,
    color: 'bg-purple-100 text-purple-600',
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
