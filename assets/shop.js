import { PRODUCTS, MAX_QTY } from './products.js';

const $ = (id) => document.getElementById(id);
const cart = new Map();
const usd = new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' });

const pago = new URLSearchParams(location.search).get('pago');
if (pago === 'ok' || pago === 'cancelado') {
  const msg = $('shopMsg');
  msg.hidden = false;
  msg.className = `shop-msg ${pago === 'ok' ? 'ok' : ''}`;
  msg.textContent = pago === 'ok'
    ? '¡Gracias! Tu pago se recibió. Te contactaremos para coordinar la entrega.'
    : 'El pago se canceló. No se hizo ningún cargo.';
  history.replaceState(null, '', location.pathname);
}

function updateTotal() {
  let total = 0, count = 0;
  cart.forEach((qty, id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    total += p.price * qty; count += qty;
  });
  $('shopTotal').textContent = usd.format(total);
  $('payBtn').disabled = count === 0;
  $('payBtn').textContent = count ? `Pagar ${usd.format(total)}` : 'Pagar con tarjeta';
}

PRODUCTS.forEach((p) => {
  const row = document.createElement('div');
  row.className = 'prod';
  const name = document.createElement('span');
  name.className = 'prod-name';
  name.textContent = p.title;
  const price = document.createElement('span');
  price.className = 'prod-price';
  price.textContent = usd.format(p.price);
  const sel = document.createElement('select');
  sel.setAttribute('aria-label', `Cantidad de ${p.title}`);
  for (let i = 0; i <= MAX_QTY; i++) {
    const o = document.createElement('option');
    o.value = String(i); o.textContent = String(i);
    sel.append(o);
  }
  sel.addEventListener('change', () => {
    const q = Number(sel.value);
    if (q) cart.set(p.id, q); else cart.delete(p.id);
    row.classList.toggle('picked', q > 0);
    updateTotal();
  });
  row.append(name, price, sel);
  $('prodList').append(row);
});
updateTotal();

$('payBtn').addEventListener('click', async () => {
  const btn = $('payBtn');
  const err = $('shopErr');
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Abriendo el pago seguro…';
  try {
    const r = await fetch('api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: [...cart].map(([id, qty]) => ({ id, qty })) }),
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.url && data.url.startsWith('https://checkout.stripe.com/')) {
      location.assign(data.url);
      return;
    }
    err.textContent = r.status === 404 || r.status === 405 || r.status === 503
      ? 'El pago con tarjeta no está disponible en esta versión del sitio. Puedes comprar en la tienda en línea: www.4life.com/8804287'
      : (data.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
  } catch {
    err.textContent = 'No hay conexión. Intenta de nuevo.';
  }
  err.hidden = false;
  updateTotal();
});
