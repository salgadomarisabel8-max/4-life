import { KB, search } from './search.js';

const $ = (id) => document.getElementById(id);
const API_URL = 'api/chat';
let apiAvailable = true;
let busy = false;
const history = [];

$('kbN').textContent = KB.length;
KB.forEach((d) => {
  const el = document.createElement('div');
  el.className = 'kb-item';
  const s = document.createElement('strong');
  s.textContent = `[${d.id}] ${d.title}`;
  const c = document.createElement('span');
  c.textContent = d.cat;
  el.append(s, c);
  $('kbList').append(el);
});

const SUG = [
  '¿Qué ingredientes tiene Transfer Factor Lung?',
  '¿Qué le ofrezco a una familia con niños?',
  '¿Cuánto cuesta Transfer Factor Plus?',
  'Dame un plan para vender en WhatsApp',
  '¿Qué no debo decir al promocionar?',
  '¿Los suplementos curan enfermedades?',
];
SUG.forEach((t) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip';
  b.textContent = t;
  b.addEventListener('click', () => { $('q').value = t; ask(); });
  $('chips').append(b);
});

function renderSources(list) {
  const box = $('sources');
  box.replaceChildren();
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No encontré fragmentos relacionados. Prueba con otras palabras, por ejemplo el nombre de un producto.';
    box.append(p);
    return;
  }
  list.forEach((d, n) => {
    const el = document.createElement('article');
    el.className = 'src';
    const h = document.createElement('div');
    h.className = 'src-head';
    const t = document.createElement('span');
    t.className = 'src-title';
    t.textContent = `[${n + 1}] ${d.title}`;
    const m = document.createElement('span');
    m.className = 'src-meta';
    m.textContent = `${d.cat} · ${Math.round(d.score * 100)}%`;
    h.append(t, m);
    const p = document.createElement('p');
    p.textContent = d.text.length > 220 ? `${d.text.slice(0, 220)}…` : d.text;
    el.append(h, p);
    box.append(el);
  });
}

// Renderizado seguro: nunca usa innerHTML con texto recibido.
function renderAnswer(el, text) {
  el.replaceChildren();
  let ul = null;
  const inline = (parent, s) => {
    s.split(/(\*\*[^*]+\*\*|\[\d+\])/g).forEach((part) => {
      if (!part) return;
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        const b = document.createElement('strong'); b.textContent = part.slice(2, -2); parent.append(b);
      } else if (/^\[\d+\]$/.test(part)) {
        const c = document.createElement('span'); c.className = 'cite'; c.textContent = part.slice(1, -1); parent.append(c);
      } else parent.append(document.createTextNode(part));
    });
  };
  text.split('\n').forEach((line) => {
    const l = line.trim();
    if (/^[-*•]\s+/.test(l) || /^\d+[.)]\s+/.test(l)) {
      if (!ul) { ul = document.createElement('ul'); el.append(ul); }
      const li = document.createElement('li');
      inline(li, l.replace(/^([-*•]|\d+[.)])\s+/, ''));
      ul.append(li);
    } else if (l) {
      ul = null;
      const p = document.createElement('p');
      inline(p, l.replace(/^#+\s*/, ''));
      el.append(p);
    } else ul = null;
  });
}

$('askForm').addEventListener('submit', (e) => { e.preventDefault(); ask(); });
$('q').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); }
});

async function ask() {
  const q = $('q').value.trim().slice(0, 500);
  if (!q || busy) return;
  const prev = history.length ? history[history.length - 1].q : '';
  let hits = search(q);
  if (hits.length < 2 && prev) hits = search(`${q} ${prev}`);
  renderSources(hits);

  const qEl = document.createElement('div'); qEl.className = 'turn-q'; qEl.textContent = q;
  const aEl = document.createElement('div'); aEl.className = 'turn-a';
  const ans = document.createElement('div'); ans.className = 'ans';
  const st = document.createElement('p'); st.className = 'status'; st.textContent = 'Buscando en la base y preparando la respuesta…';
  ans.append(st); aEl.append(ans);
  $('thread').append(qEl, aEl);
  $('q').value = '';
  aEl.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });

  if (!apiAvailable) {
    st.textContent = hits.length ? 'Revisa los fragmentos recuperados: ahí está la información.' : 'No encontré información sobre eso en la base.';
    return;
  }

  busy = true; $('sendBtn').disabled = true;
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: q, history: history.slice(-3) }),
    });
    if (r.status === 404 || r.status === 405 || r.status === 503) {
      apiAvailable = false;
      $('unavail').hidden = false;
      st.textContent = hits.length ? 'Revisa los fragmentos recuperados: ahí está la información.' : 'No encontré información sobre eso en la base.';
      return;
    }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { st.textContent = data.error || 'No se pudo generar la respuesta. Intenta de nuevo.'; return; }
    renderAnswer(ans, data.answer || 'No hubo respuesta.');
    history.push({ q, a: String(data.answer || '').slice(0, 600) });
  } catch {
    st.textContent = 'No hay conexión con el asistente. Revisa los fragmentos recuperados.';
  } finally {
    busy = false; $('sendBtn').disabled = false;
  }
}
