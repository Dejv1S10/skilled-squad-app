-- ============================================================
-- MESSAGES TABLE (chat mezi zákazníkem a workerem)
-- ============================================================
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Zákazník a worker dané objednávky mohou vidět zprávy
CREATE POLICY "Order participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = messages.order_id
      AND (
        o.customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.workers w
          WHERE w.id = o.worker_id
          AND w.user_id = auth.uid()
        )
      )
    )
  );

-- Zákazník a worker mohou posílat zprávy
CREATE POLICY "Order participants can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = messages.order_id
      AND (
        o.customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.workers w
          WHERE w.id = o.worker_id
          AND w.user_id = auth.uid()
        )
      )
    )
  );

-- Zapnout realtime pro okamžité zprávy
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;


-- ============================================================
-- PAYMENTS TABLE (platby přes Stripe)
-- ============================================================
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,        -- v halířích (100 = 1 Kč)
  currency TEXT NOT NULL DEFAULT 'czk',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Zákazník vidí své vlastní platby
CREATE POLICY "Customers can view own payments"
  ON public.payments FOR SELECT
  USING (customer_id = auth.uid());
