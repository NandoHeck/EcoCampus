import { bootstrapPage, Auth } from '../app.js';
import api from '../api.js';
import {
  renderAdCard, skeletonCards, emptyState, errorState,
  escapeHtml, toast, debounce
} from '../ui.js';

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

const state = {
  ads: [],
  filters: { search: '', category: '', type: '' },
  favorites: new Set()
};

function renderCategoryFilter() {
  const sel = document.getElementById('cat-filter');
  if (!sel) return;
  CATS.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

function renderCatScroll() {
  const mount = document.getElementById('cat-scroll');
  if (!mount) return;
  mount.innerHTML = `
    <button type="button" class="cat-chip ${state.filters.category === '' ? 'is-active' : ''}" data-cat="">
      <iconify-icon icon="lucide:sparkles"></iconify-icon> Todas
    </button>
    ${CATS.map((c) => `
      <button type="button" class="cat-chip ${state.filters.category === c.name ? 'is-active' : ''}" data-cat="${escapeHtml(c.name)}">
        <iconify-icon icon="${c.icon}"></iconify-icon> ${escapeHtml(c.name)}
      </button>
    `).join('')}
  `;
  mount.querySelectorAll('[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filters.category = btn.dataset.cat;
      document.getElementById('cat-filter').value = btn.dataset.cat;
      renderCatScroll();
      loadAds();
    });
  });
}

function renderStats() {
  const mount = document.getElementById('stats-grid');
  if (!mount) return;
  const total = state.ads.length;
  const donations = state.ads.filter((a) => a.type === 'donation').length;
  const sales = state.ads.filter((a) => a.type === 'sale').length;
  const totalViews = state.ads.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

  mount.innerHTML = `
    <div class="stat-card">
      <div class="stat-card__icon"><iconify-icon icon="lucide:layout-grid"></iconify-icon></div>
      <div class="stat-card__label">Anúncios</div>
      <div class="stat-card__value">${total}</div>
      <div class="stat-card__delta"><iconify-icon icon="lucide:trending-up"></iconify-icon> ativos agora</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__icon"><iconify-icon icon="lucide:heart-handshake"></iconify-icon></div>
      <div class="stat-card__label">Doações</div>
      <div class="stat-card__value">${donations}</div>
      <div class="stat-card__delta"><iconify-icon icon="lucide:leaf"></iconify-icon> impacto direto</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__icon"><iconify-icon icon="lucide:tag"></iconify-icon></div>
      <div class="stat-card__label">Vendas</div>
      <div class="stat-card__value">${sales}</div>
      <div class="stat-card__delta"><iconify-icon icon="lucide:wallet-cards"></iconify-icon> preço justo</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__icon"><iconify-icon icon="lucide:eye"></iconify-icon></div>
      <div class="stat-card__label">Visualizações</div>
      <div class="stat-card__value">${totalViews}</div>
      <div class="stat-card__delta"><iconify-icon icon="lucide:activity"></iconify-icon> engajamento</div>
    </div>
  `;
}

function renderList(mount, ads, emptyOpts) {
  if (!mount) return;
  if (!ads.length) {
    mount.innerHTML = emptyState(emptyOpts);
    return;
  }
  mount.innerHTML = '';
  ads.forEach((ad) => {
    const card = renderAdCard(ad, {
      favorites: state.favorites,
      currentUserId: Auth.getUser() ? Auth.getUser().id : null,
      onFavToggle: toggleFavorite
    });
    mount.appendChild(card);
  });
}

async function toggleFavorite(adId, willFav, btn) {
  const user = Auth.getUser();
  if (!user) {
    toast('Faça login para favoritar.', { type: 'info' });
    return;
  }
  try {
    if (willFav) {
      await api.addFavorite(user.id, adId);
      state.favorites.add(adId);
      btn.classList.add('is-active');
      const icon = btn.querySelector('iconify-icon');
      if (icon) icon.setAttribute('style', 'fill:currentColor');
      toast('Adicionado aos favoritos.', { type: 'success' });
    } else {
      await api.removeFavorite(user.id, adId);
      state.favorites.delete(adId);
      btn.classList.remove('is-active');
      const icon = btn.querySelector('iconify-icon');
      if (icon) icon.setAttribute('style', '');
      toast('Removido dos favoritos.', { type: 'info' });
    }
  } catch (err) {
    toast(err.message || 'Não foi possível atualizar favoritos.', { type: 'error' });
  }
}

async function loadFavorites() {
  const user = Auth.getUser();
  if (!user) return;
  try {
    const favAds = await api.getUserFavorites(user.id);
    state.favorites = new Set(favAds.map((a) => a.id));
  } catch { /* silencia */ }
}

async function loadAds() {
  const featured = document.getElementById('featured-grid');
  const recent = document.getElementById('recent-grid');
  if (featured) featured.innerHTML = `<div class="ad-grid" style="display:contents">${skeletonCards(4)}</div>`;
  if (recent) recent.innerHTML = skeletonCards(6);

  try {
    const all = await api.listAds(state.filters);
    state.ads = all;
    renderStats();

    const featuredAds = [...all].sort((a, b) => b.views - a.views).slice(0, 4);
    renderList(featured, featuredAds, {
      icon: 'lucide:sparkles',
      title: 'Nada em destaque',
      desc: 'Ajuste os filtros ou publique o primeiro anúncio.'
    });

    const recentAds = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
    renderList(recent, recentAds, {
      icon: 'lucide:package-open',
      title: 'Nenhum anúncio encontrado',
      desc: 'Ajuste os filtros ou seja o primeiro a publicar!'
    });
  } catch (err) {
    if (featured) featured.innerHTML = errorState({ desc: err.message });
    if (recent) recent.innerHTML = errorState({ desc: err.message });
  }
}

function bindFilters() {
  const q = document.getElementById('q');
  const t = document.getElementById('type-filter');
  const c = document.getElementById('cat-filter');

  const runSearch = debounce(() => {
    state.filters.search = q.value.trim();
    loadAds();
  }, 320);

  q.addEventListener('input', runSearch);
  t.addEventListener('change', () => { state.filters.type = t.value; loadAds(); });
  c.addEventListener('change', () => { state.filters.category = c.value; renderCatScroll(); loadAds(); });
}

document.addEventListener('DOMContentLoaded', async () => {
  bootstrapPage();

  const user = Auth.getUser();
  if (user) {
    const first = user.name.split(' ')[0];
    document.getElementById('greeting-name').textContent = first;
  }

  renderCategoryFilter();
  renderCatScroll();
  bindFilters();

  await loadFavorites();
  await loadAds();
});
