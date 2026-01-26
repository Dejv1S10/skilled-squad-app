import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 py-20 md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Najděte spolehlivého{' '}
            <span className="text-primary">pomocníka</span> pro vaše domácí práce
          </h1>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Od zahradních prací po stěhování – spojíme vás s ověřenými pracovníky ve vašem okolí.
          </p>

          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Co potřebujete udělat? (např. posekání trávy)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 text-lg shadow-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-lg shadow-lg">
              Hledat
            </Button>
          </form>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
    </section>
  );
}
