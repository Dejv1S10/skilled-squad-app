import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface OrderInfo {
  description: string;
  other_person_name: string;
}

export default function Chat() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !orderId) return;

    async function init() {
      // Načíst detail objednávky
      const { data: order } = await supabase
        .from('orders')
        .select('description, customer_id, worker_id')
        .eq('id', orderId)
        .single();

      if (!order) {
        setLoading(false);
        return;
      }

      // Zjistit druhého účastníka chatu
      let otherUserAuthId: string;

      if (order.customer_id === user.id) {
        // Já jsem zákazník, chci jméno workera
        const { data: worker } = await supabase
          .from('workers')
          .select('user_id')
          .eq('id', order.worker_id)
          .single();
        otherUserAuthId = worker?.user_id ?? '';
      } else {
        // Já jsem worker, chci jméno zákazníka
        otherUserAuthId = order.customer_id;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', otherUserAuthId)
        .single();

      setOrderInfo({
        description: order.description,
        other_person_name: profile?.full_name || 'Druhá strana',
      });

      // Načíst historii zpráv
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);
      setLoading(false);
    }

    init();

    // Real-time: přijímat nové zprávy okamžitě
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Zabránit duplicitám
            const exists = prev.some((m) => m.id === (payload.new as Message).id);
            return exists ? prev : [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orderId]);

  // Automaticky scrollovat na nejnovější zprávu
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !orderId || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: user.id,
      content,
    });

    setSending(false);
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <div
        className="container max-w-2xl flex flex-col py-6"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {/* Hlavička chatu */}
        <div className="mb-4 flex items-center gap-3 border-b pb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">
              {orderInfo?.other_person_name || 'Chat'}
            </h1>
            {orderInfo?.description && (
              <p className="max-w-xs truncate text-sm text-muted-foreground">
                {orderInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Seznam zpráv */}
        <div className="mb-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <Skeleton className="h-10 w-48 rounded-2xl" />
                </div>
              ))}
            </>
          ) : messages.length === 0 ? (
            <p className="mt-16 text-center text-muted-foreground">
              Zatím žádné zprávy. Napište první!
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 ${
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {format(new Date(msg.created_at), 'HH:mm', { locale: cs })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Pole pro psaní zprávy */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napište zprávu..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
