// Contacto por WhatsApp: el cliente escribe primero. No se guarda ningún dato en el sitio.
const WA_NUMBER = '13123991218';
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

document.querySelectorAll('a[data-wa]').forEach((a) => {
  a.href = waLink(a.dataset.wa);
});

const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.elements.nombre.value.trim().slice(0, 60);
  const interest = form.elements.interes.value;
  const note = form.elements.nota.value.trim().slice(0, 300);
  const text = [
    `Hola, soy ${name || 'un cliente'}. Vi tu asistente 4Life y me interesa: ${interest}.`,
    note,
  ].filter(Boolean).join('\n');
  window.open(waLink(text), '_blank', 'noopener');
});
