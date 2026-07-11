import { Layout } from '@/components/layout/Layout';
import { Truck } from 'lucide-react';

// Zatím jen zástupná stránka – konkrétní podobu doplníme dalším zadáním.
export default function StehovaniFixni() {
  return (
    <Layout>
      <div className="container max-w-2xl py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15">
          <Truck className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Stěhování za fixní cenu</h1>
        <p className="mt-2 text-muted-foreground">Tuto možnost právě připravujeme.</p>
      </div>
    </Layout>
  );
}
