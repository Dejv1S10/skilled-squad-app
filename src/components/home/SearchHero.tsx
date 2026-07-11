import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wrench, Sparkles, TreePine, Truck, Hammer, Monitor, Heart, Car, PartyPopper, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { normalize } from '@/data/workers';
import { taskForms } from '@/data/taskForms';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { id: 'moving', name: 'Stěhování', icon: Truck },
  { id: 'handyman', name: 'Dům & byt', icon: Wrench },
  { id: 'cleaning', name: 'Úklid', icon: Sparkles },
  { id: 'garden', name: 'Zahrada', icon: TreePine },
  { id: 'craft', name: 'Řemeslo', icon: Hammer },
  { id: 'tech', name: 'Technika & IT', icon: Monitor },
  { id: 'care', name: 'Péče', icon: Heart },
  { id: 'auto', name: 'Auto', icon: Car },
  { id: 'events', name: 'Eventy', icon: PartyPopper },
  { id: 'b2b', name: 'Pro firmy', icon: Building2 },
];

// Barva zvýraznění pro každou sekci po kliknutí na její ikonu.
// (Píšeme celé názvy tříd, jinak by je Tailwind při sestavení odstranil.)
const activeColors: Record<string, string> = {
  handyman: 'bg-sky-400 text-white',     // Dům & byt – světle modrá
  cleaning: 'bg-violet-400 text-white',  // Úklid – světle fialová
  garden: 'bg-green-500 text-white',     // Zahrada – zelená
  moving: 'bg-yellow-400 text-black',    // Stěhování – žlutá (tmavý text kvůli čitelnosti)
  craft: 'bg-red-500 text-white',        // Řemeslo – červená
  tech: 'bg-indigo-500 text-white',      // Technika & IT – indigová
  care: 'bg-pink-400 text-white',        // Péče – růžová
  auto: 'bg-orange-500 text-white',      // Auto – oranžová
  events: 'bg-fuchsia-500 text-white',   // Eventy – sytě růžová
  b2b: 'bg-slate-500 text-white',        // Pro firmy – šedá
};

// Podkategorie Stěhování. Má vlastní stránky (trasa na mapě, fixní cena…).
const movingSubcategories = [
  { id: 'fix', name: 'Stěhování za fixní cenu', route: '/stehovani-fixni' },
  { id: 'van', name: 'Stěhování s dodávkou', route: '/stehovani?typ=dodavka' },
  { id: 'help', name: 'Pomoc se stěhováním', route: '/stehovani?typ=pomoc' },
];

// Nejpopulárnější služby — pilulky pod vyhledáváním (styl TaskRabbit).
const popularServices = [
  'Montáž nábytku',
  'Stěhování s dodávkou',
  'Pomoc se stěhováním',
  'Běžný úklid',
  'Montáž TV',
  'Sekání trávy',
  'Malování',
];

// Jedna nabídka v našeptávači: konkrétní služba (podkategorie) + kam vede.
interface ServiceItem {
  name: string;      // název služby (např. „Montáž nábytku")
  category: string;  // název hlavní kategorie (pro popisek v nabídce)
  route: string;     // stránka s detaily objednávky
}

// Všechny služby webu na jednom místě (stěhování + podkategorie ostatních sektorů).
const allServices: ServiceItem[] = [
  ...movingSubcategories.map((s) => ({ name: s.name, category: 'Stěhování', route: s.route })),
  ...Object.entries(taskForms).flatMap(([catId, cfg]) =>
    cfg.subcategories.map((s) => ({
      name: s.name,
      category: categories.find((c) => c.id === catId)?.name ?? '',
      route: `/sluzba/${catId}/${s.id}`,
    })),
  ),
];

export function SearchHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('moving');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Služby, které odpovídají tomu, co uživatel píše (našeptávač podkategorií).
  const suggestions = searchQuery.trim()
    ? allServices.filter((s) => normalize(s.name).includes(normalize(searchQuery))).slice(0, 7)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // Enter = otevři první odpovídající službu; jinak obecné vyhledávání.
    if (suggestions.length > 0) {
      navigate(suggestions[0].route);
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // Vyhledávací pole s našeptávačem služeb (společné pro obě verze úvodu).
  const searchForm = (
    <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Popište úkol, např. montáž skříně"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-14 rounded-full border-2 border-input bg-muted pl-12 text-base text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:border-primary md:text-lg"
        />

        {/* Našeptávač služeb — po kliknutí se rovnou otevře menu s detaily */}
        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover text-left shadow-lg">
            {suggestions.map((s) => (
              <li key={s.route}>
                <button
                  type="button"
                  onClick={() => navigate(s.route)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-accent"
                >
                  <span className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{s.category}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" size="lg" className="h-14 rounded-full px-6 shadow-sm">
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );

  // ===== Verze pro přihlášené: rovnou psát, co potřebuju (styl TaskRabbit) =====
  if (user) {
    return (
      <section className="bg-background pb-8 pt-12 md:pb-12 md:pt-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Objednejte si další úkol
            </h1>
            {searchForm}

            {/* Nejpopulárnější služby — kliknutí otevře rovnou detaily úkolu */}
            <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
              {popularServices.map((name) => {
                const service = allServices.find((s) => s.name === name);
                if (!service) return null;
                return (
                  <Button
                    key={name}
                    variant="outline"
                    className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => navigate(service.route)}
                  >
                    {name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===== Verze pro nepřihlášené: velký úvod s kategoriemi =====
  return (
    <section className="bg-background pb-8 pt-12 md:pb-12 md:pt-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Objednejte si
            <br />
            <span className="mt-2 block text-primary">našeho Šikulu</span>
          </h1>
          {searchForm}
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
                  className={`flex flex-shrink-0 flex-col items-center gap-1.5 rounded-xl px-4 py-3 text-xs font-medium transition-all md:text-sm ${
                    isActive
                      ? activeColors[cat.id]
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Podkategorie – rozbalí se po kliknutí na sektor */}
          {activeCategory === 'moving' ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {movingSubcategories.map((sub) => (
                <Button
                  key={sub.id}
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate(sub.route)}
                >
                  {sub.name}
                </Button>
              ))}
            </div>
          ) : (
            taskForms[activeCategory] && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {taskForms[activeCategory].subcategories.map((sub) => (
                  <Button
                    key={sub.id}
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => navigate(`/sluzba/${activeCategory}/${sub.id}`)}
                  >
                    {sub.name}
                  </Button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
