import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Přihlásit uživatele přes jeho token
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) throw new Error('Nejste přihlášen');

    const { orderId, successUrl, cancelUrl } = await req.json();
    if (!orderId) throw new Error('Chybí ID objednávky');

    // Admin klient pro čtení dat bez RLS omezení
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Načíst detail objednávky
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, description, status, final_price, customer_id, service_id')
      .eq('id', orderId)
      .eq('customer_id', user.id)
      .single();

    if (orderError || !order) throw new Error('Objednávka nenalezena');
    if (order.status !== 'accepted') throw new Error('Objednávka ještě nebyla přijata workerem');

    // Zkontrolovat jestli platba už neexistuje
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, status')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingPayment?.status === 'paid') throw new Error('Tato objednávka je již zaplacena');

    // Zjistit cenu - buď final_price nebo cena ze služby
    let price = order.final_price;
    if (!price && order.service_id) {
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('price')
        .eq('id', order.service_id)
        .single();
      price = service?.price || null;
    }

    if (!price || price <= 0) throw new Error('Cena objednávky není nastavena');

    // Vytvořit Stripe Checkout session
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: 'MakeIT – Objednávka služby',
              description: order.description.substring(0, 200),
            },
            unit_amount: Math.round(price * 100), // Stripe počítá v halířích
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        order_id: orderId,
        customer_id: user.id,
      },
    });

    // Uložit platbu do databáze (status: pending)
    await supabaseAdmin.from('payments').upsert({
      order_id: orderId,
      customer_id: user.id,
      amount: Math.round(price * 100),
      currency: 'czk',
      stripe_session_id: session.id,
      status: 'pending',
    }, { onConflict: 'order_id' });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
