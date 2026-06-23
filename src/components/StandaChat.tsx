import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  from: 'standa' | 'user';
  text: string;
  worker?: WorkerCard;
}

interface WorkerCard {
  name: string;
  avatar: string | null;
  rating: number;
  price: number;
  category: string;
  bio: string;
  id: string;
}

const WORKERS: WorkerCard[] = [
  {
    id: 'venca',
    name: 'Venca',
    avatar: '/venca.JPG',
    rating: 2.5,
    price: 400,
    category: 'Zahrada & exteriér',
    bio: 'Schopný zahradník — zvládne vše. Komunikace náročnější, ale práce vždy na jedničku.',
  },
];

const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function findWorker(text: string): WorkerCard | null {
  const t = normalize(text);
  const gardenKeywords = ['zahrad', 'trav', 'plot', 'sekani', 'vysadba', 'venku', 'exterier', 'travnik'];
  if (gardenKeywords.some(k => t.includes(k))) return WORKERS[0];
  return null;
}

function generateReply(userText: string, history: Message[]): { text: string; worker?: WorkerCard } {
  const t = userText.toLowerCase();
  const isFirst = history.filter(m => m.from === 'user').length === 1;

  const worker = findWorker(userText);
  if (worker) {
    return {
      text: `Perfektní volba! Pro práci se zahradou mám pro vás skvělého Šikulu:`,
      worker,
    };
  }

  if (t.includes('čau') || t.includes('ahoj') || t.includes('hello') || isFirst) {
    return { text: 'Ahoj! Řekněte mi, co potřebujete udělat — třeba "sekání trávy" nebo "oprava zdi" — a já vám najdu správného Šikulu. 💪' };
  }

  if (t.includes('cena') || t.includes('kolik') || t.includes('korun') || t.includes('kč')) {
    return { text: 'Ceny se liší podle práce a Šikuly. Popište mi co potřebujete a já vám ukážu konkrétní nabídku včetně hodinové sazby.' };
  }

  if (t.includes('děkuji') || t.includes('díky') || t.includes('super') || t.includes('skvělý')) {
    return { text: 'Rádo se stalo! Pokud budete potřebovat cokoliv dalšího, jsem tady. 😊' };
  }

  if (t.includes('úklid') || t.includes('uklid') || t.includes('čistění')) {
    return { text: 'Na úklid zatím hledáme šikovné Šikuly. Chcete být informováni, až je přidáme? Zatím vám mohu pomoci s prací na zahradě.' };
  }

  return {
    text: 'Hmm, na tohle ještě hledáme správného Šikulu. Zkuste popsat práci jinak — třeba "zahrada", "úklid" nebo "montáž nábytku".',
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function StandaChat({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { from: 'standa', text: 'Ahoj! Jsem Standa, váš AI asistent. 👋 Popište mi co potřebujete a já vám najdu správného Šikulu.' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { from: 'user', text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');

    setTimeout(() => {
      const reply = generateReply(text, updatedHistory);
      setMessages(prev => [...prev, { from: 'standa', ...reply }]);
    }, 600);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex w-80 flex-col rounded-2xl border bg-background shadow-2xl">
      {/* Hlavička */}
      <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Standa</p>
            <p className="text-xs text-white/75">AI asistent · online</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-white hover:bg-white/20">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Zprávy */}
      <div className="flex h-72 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                msg.from === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.text}
            </div>
            {msg.worker && (
              <button
                onClick={() => { navigate(`/worker/${msg.worker!.id}`); onClose(); }}
                className="w-full rounded-xl border bg-card p-3 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  {msg.worker.avatar ? (
                    <img src={msg.worker.avatar} alt={msg.worker.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {msg.worker.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{msg.worker.name}</p>
                    <p className="text-xs text-muted-foreground">⭐ {msg.worker.rating} · {msg.worker.price} Kč/h</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{msg.worker.bio}</p>
                <p className="mt-1 text-xs font-medium text-primary">{msg.worker.category}</p>
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Vstup */}
      <div className="flex gap-2 border-t p-3">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Napište co potřebujete..."
          className="h-9 text-sm"
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={send}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
