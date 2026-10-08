// Función serverless (Vercel) que crea una sesión de pago de Stripe Checkout.
// La clave secreta vive SOLO en la variable de entorno STRIPE_SECRET_KEY.
// Los precios salen del catálogo del servidor; el navegador solo envía ids y cantidades.
import { PRODUCTS, MAX_QTY } from '../assets/products.js';

const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.origin;
  if (allowed && origin && origin !== allowed) {
    return res.status(403).json({ error: 'Origen no permitido.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Los pagos no están configurados todavía.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const items = body && Array.isArray(body.items) ? body.items.slice(0, PRODUCTS.length) : [];

  const form = new URLSearchParams();
  let n = 0;
  for (const it of items) {
    const p = byId.get(Number(it && it.id));
    const qty = Math.floor(Number(it && it.qty));
    if (!p || !(qty >= 1 && qty <= MAX_QTY)) continue;
    form.append(`line_items[${n}][quantity]`, String(qty));
    form.append(`line_items[${n}][price_data][currency]`, 'usd');
    form.append(`line_items[${n}][price_data][unit_amount]`, String(Math.round(p.price * 100)));
    form.append(`line_items[${n}][price_data][product_data][name]`, `4Life ${p.title}`);
    n++;
  }
  if (!n) return res.status(400).json({ error: 'Elige al menos un producto.' });

  const site = allowed || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
  form.append('mode', 'payment');
  form.append('locale', 'es');
  form.append('shipping_address_collection[allowed_countries][0]', 'US');
  form.append('phone_number_collection[enabled]', 'true');
  form.append('success_url', `${site}/?pago=ok`);
  form.append('cancel_url', `${site}/?pago=cancelado`);

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.url) {
      console.error('Stripe API error', r.status, data.error && data.error.message);
      return res.status(502).json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' });
    }
    return res.status(200).json({ url: data.url });
  } catch (e) {
    console.error('Checkout handler error', e);
    return res.status(502).json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' });
  }
}
