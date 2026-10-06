// Búsqueda BM25 compartida por el navegador y el servidor.
import { KB } from './kb.js';

const STOP = new Set('a al algo algun alguna algunos ante con como cual cuales cuando de del desde donde el ella ellas ellos en entre era es esa ese eso esta este esto estos fue ha hay la las le les lo los mas me mi mis muy no nos o para pero por porque que quien se si sin sobre son su sus te tiene tu tus un una uno unos y ya yo puedo puede quiero hacer cosa cosas mejor'.split(' '));
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const stem = (w) => (w.length > 5 ? w.replace(/(es|s)$/, '') : w.replace(/s$/, ''));
const tok = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);

const docs = KB.map((d) => {
  const t = tok(`${d.title} ${d.title} ${d.text} ${d.extra || ''}`);
  const tf = {};
  t.forEach((w) => { tf[w] = (tf[w] || 0) + 1; });
  return { len: t.length, tf };
});
const avgLen = docs.reduce((a, d) => a + d.len, 0) / docs.length;
const df = {};
docs.forEach((d) => Object.keys(d.tf).forEach((w) => { df[w] = (df[w] || 0) + 1; }));

export function search(query, k = 5) {
  const qt = [...new Set(tok(String(query || '')))];
  const N = docs.length, k1 = 1.4, b = 0.75;
  const scored = docs
    .map((d, i) => {
      let s = 0;
      qt.forEach((w) => {
        const f = d.tf[w];
        if (!f) return;
        const idf = Math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5));
        s += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + (b * d.len) / avgLen));
      });
      return { i, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b2) => b2.s - a.s)
    .slice(0, k);
  const top = scored.length ? scored[0].s : 1;
  return scored.map((x) => ({ ...KB[x.i], score: x.s / top }));
}

export { KB };
