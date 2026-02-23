import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wrench, Sparkles, TreePine, Truck, Hammer, Monitor, Heart, Car, PartyPopper, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'handyman', name: 'Dům & byt', icon: Wrench },
  { id: 'cleaning', name: 'Úklid', icon: Sparkles },
  { id: 'garden', name: 'Zahrada', icon: TreePine },
  { id: 'moving', name: 'Stěhování', icon: Truck },
  { id: 'craft', name: 'Řemeslo', icon: Hammer },
  { id: 'tech', name: 'Technika & IT', icon: Monitor },
  { id: 'care', name: 'Péče', icon: Heart },
  { id: 'auto', name: 'Auto', icon: Car },
  { id: 'events', name: 'Eventy', icon: PartyPopper },
  { id: 'b2b', name: 'Pro firmy', icon: Building2 },
];

const subCategories: Record<string, string[]> = {
  handyman: ['Montáž nábytku', 'Malování', 'Opravy v domácnosti', 'Instalatérské práce', 'Elektrikářské práce'],
  cleaning: ['Úklid domácnosti', 'Úklid po stavbě', 'Mytí oken', 'Hloubkové čištění'],
  garden: ['Sekání trávy', 'Stříhání živých plotů', 'Údržba zahrady', 'Výsadba'],
  moving: ['Stěhování bytu', 'Stěhování kanceláře', 'Přenášení těžkých věcí', 'Balení'],
  craft: ['Truhlářské práce', 'Zámečnictví', 'Svařování', 'Pokládka podlah'],
  tech: ['Nastavení Wi-Fi', 'Servis PC', 'Smart home', 'Montáž TV'],
  care: ['Péče o seniory', 'Hlídání dětí', 'Pomoc v domácnosti', 'Doučování'],
  auto: ['Mytí auta', 'Přezutí pneumatik', 'Diagnostika', 'Drobné opravy'],
  events: ['Organizace akcí', 'Home staging', 'Dekorace', 'Catering'],
  b2b: ['Facility management', 'Firemní údržba', 'Kancelářský úklid', 'IT správa'],
};

export function SearchHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('handyman');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="bg-background pb-8 pt-12 md:pb-12 md:pt-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Objednejte spolehlivou
            <br />
            <span className="text-primary">pomoc do domácnosti</span>
          </h1>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="S čím potřebujete pomoci?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-full border-2 border-border bg-background pl-12 text-base shadow-sm transition-colors focus-visible:border-primary md:text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 rounded-full px-6 shadow-sm">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Category Tabs */}
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-shrink-0 flex-col items-center gap-1.5 rounded-lg px-4 py-3 text-xs font-medium transition-all md:text-sm ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : ''}`} />
                  <span className="whitespace-nowrap">{cat.name}</span>
                  {isActive && <div className="h-0.5 w-full rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          {/* Sub-category pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {subCategories[activeCategory]?.map((sub) => (
              <Button
                key={sub}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => navigate(`/search?q=${encodeURIComponent(sub)}&category=${activeCategory}`)}
              >
                {sub}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
