// Catálogo para la tienda, tomado de la base de conocimiento (fragmentos "Producto" con precio).
// El servidor usa esta misma lista para calcular el cobro: nunca confía en precios enviados por el navegador.
import { KB } from './kb.js';

export const PRODUCTS = KB
  .filter((d) => d.cat === 'Producto')
  .map((d) => {
    const m = d.text.match(/Precio de menudeo en EE\. UU\.: \$(\d+(?:\.\d{2})?)/);
    return m ? { id: d.id, title: d.title, price: Number(m[1]) } : null;
  })
  .filter(Boolean);

export const MAX_QTY = 10;
