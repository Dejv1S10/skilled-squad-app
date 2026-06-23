// Společný zdroj dat o Šikulech (zatím čistě frontend, bez databáze).
// Čte z něj vyhledávání (Search) i detailní stránka (WorkerDetail).

export interface WorkerService {
  name: string;
  description: string | null;
  price: number;
}

export interface WorkerReview {
  author: string;
  rating: number;
  comment: string;
  date: string; // ISO datum
}

export interface Worker {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  hourly_rate: number;
  is_available: boolean;
  average_rating: number;
  total_reviews: number;
  categories: string[];
  services: WorkerService[];
  reviews: WorkerReview[];
}

export const categoryLabels: Record<string, string> = {
  handyman: 'Dům & byt',
  cleaning: 'Úklid & domácnost',
  garden: 'Zahrada & exteriér',
  moving: 'Stěhování & logistika',
  craft: 'Specializované řemeslo',
  tech: 'Technika & IT',
  care: 'Péče & výpomoc',
  auto: 'Auto & doprava',
  events: 'Eventy & lifestyle',
  b2b: 'Pro firmy',
};

export const WORKERS: Worker[] = [
  {
    id: 'venca',
    full_name: 'Venca',
    avatar_url: '/venca.JPG',
    bio: 'Schopný zahradník — zvládne vše od sekání trávy po stříhání živých plotů. Komunikace s ním může být náročnější, ale práce je vždy odvedena na jedničku.',
    hourly_rate: 400,
    is_available: true,
    average_rating: 2.5,
    total_reviews: 3,
    categories: ['garden'],
    services: [
      { name: 'Údržba zahrady', description: 'Komplexní péče o zahradu během celé sezóny.', price: 400 },
      { name: 'Sekání trávy', description: 'Posekání trávníku včetně okrajů.', price: 350 },
      { name: 'Stříhání živých plotů', description: 'Zastřižení a tvarování plotů a keřů.', price: 450 },
    ],
    reviews: [
      {
        author: 'Petr K.',
        rating: 4,
        comment: 'Zahradu udělal perfektně, ale moc se s ním nedomluvíte. Práce ale top.',
        date: '2026-05-12',
      },
      {
        author: 'Jana M.',
        rating: 2,
        comment: 'Trávník jako ze škatulky, jenže byl nepříjemný a pořád si stěžoval.',
        date: '2026-04-28',
      },
      {
        author: 'Tomáš R.',
        rating: 3,
        comment: 'Šikovný, rychlý, ale příště bych radši, kdyby tolik nemluvil.',
        date: '2026-03-15',
      },
    ],
  },
];

export function getWorkerById(id: string): Worker | undefined {
  return WORKERS.find(w => w.id === id);
}

// Sjednotí text pro porovnávání: malá písmena + odstraní diakritiku.
// Díky tomu "udrzba zahrady" najde "Údržba zahrady".
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
