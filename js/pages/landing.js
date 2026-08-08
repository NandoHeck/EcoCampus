import { bootstrapPage } from '../app.js';
import { escapeHtml } from '../ui.js';

const CATS = [
  { name: 'Livros', icon: 'lucide:book-open-text' },
  { name: 'Apostilas', icon: 'lucide:notebook-text' },
  { name: 'Xerox', icon: 'lucide:file-stack' },
  { name: 'Calculadoras', icon: 'lucide:calculator' },
  { name: 'Componentes Eletrônicos', icon: 'lucide:cpu' },
  { name: 'Jalecos', icon: 'lucide:shirt' },
  { name: 'Equipamentos', icon: 'lucide:wrench' },
  { name: 'Móveis', icon: 'lucide:armchair' },
  { name: 'Escritório', icon: 'lucide:paperclip' },
  { name: 'Outros', icon: 'lucide:package' }
];

function renderCategories() {
  const mount = document.getElementById('landing-cats');
  if (!mount) return;
  mount.innerHTML = CATS.map((c) => `
    <a class="cat-tile" href="/pages/anuncios.html?category=${encodeURIComponent(c.name)}" aria-label="${escapeHtml(c.name)}">
      <iconify-icon icon="${c.icon}"></iconify-icon>
      <span class="cat-tile__name">${escapeHtml(c.name)}</span>
    </a>
  `).join('');
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count) || 0;
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrapPage();
  renderCategories();
  animateCounters();
});
