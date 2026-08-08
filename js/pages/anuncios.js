import { bootstrapPage, Auth } from '../app.js';
import api from '../api.js';
import { renderAdCard, skeletonCards, emptyState, errorState, escapeHtml, toast, debounce } from '../ui.js';

const CATS = [
  'Livros','Apostilas','Xerox','Calculadoras','Componentes Eletrônicos',
  'Jalecos','Equipamentos','Móveis','Escritório','Outros'
];

const state = {
  filters: { search: '', category: '', type: '', sortBy: 'recent' },
  favorites: new Set()
};

function readParams() {
  const p = new URLSearchParams(window.location.search);
  state.filters.search = p.get('search') || '';
  state.filters.category = p.get('category') || '';
  state.filters.type = p.get('type') || '';
  state.filters.sortBy = p.get('sortBy') || 'recent';
}

function writeParams() {
  const p = new URLSearchParams();
  if (state.filters.search) p.set('search', state.filters.search);
  if (state.filters.category) p.set('category', state.filters.category);
  if (state.filters.type) p.set('type', state.filters.type);
  if (state.filters.sortBy && state.filters.sortBy !== 'recent') p.set('sortBy', state.filters.sortBy);
  const qs = p.toString();
  const url = window.location.pathname + (qs ? '?' + qs : '');
  window.history.replaceState({}, '', url);
}

function syncFormFromState() {
  document.getElementById('q').value = state.filters.search;
  document.getElementById('type-filter').value = state.filters.type;
  document.getElementById('sort-select').value = state.filters.sortBy;
}

function renderChips() {
  const mount = document.getElementById('cat-chips');
  mount.innerHTML = `
    <button type="button" class="cat-chip ${state.filters.category === '' ? 'is-active' : ''}" data-cat="">
      <iconify-icon icon="lucide:sparkles"></iconify-icon> Todas
    </button>
    ${CATS.map((c) => `
      <button type="button" class="cat-chip ${state.filters.category === c ? 'is-active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>
    `).join('')}
  `;
  mount.querySelectorAll('[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filters.category = btn.dataset.cat;
      writeParams();
      renderChips();
      load();
    });
  });
}

async function toggleFav(adId, willFav, btn) {
  const user = Auth.getUser();
  if (!user) { toast('Faça login para favoritar.', { type: 'info' }); return; }
  try {
    if (willFav) {
      await api.addFavorite(user.id, adId);
      state.favorites.add(adId);
      btn.classList.add('is-active');
      const icon = btn.querySelector('iconify-icon');
      if (icon) icon.setAttribute('style', 'fill:currentColor');
    } else {
      await api.removeFavorite(user.id, adId);
      state.favorites.delete(adId);
      btn.classList.remove('is-active');
      const icon = btn.querySelector('iconify-icon');
      if (icon) icon.setAttribute('style', '');
    }
  } catch (err) {
    toast(err.message || 'Erro ao atualizar favoritos', { type: 'error' });
  }
}

async function load() {
  const grid = document.getElementById('ads-grid');
  const countLabel = document.getElementById('count-label');
  grid.innerHTML = skeletonCards(9);
  countLabel.textContent = 'Carregando…';
  try {
    const ads = await api.listAds(state.filters);
    countLabel.textContent = `${ads.length} ${ads.length === 1 ? 'anúncio' : 'anúncios'} encontrados`;
    if (!ads.length) {
      grid.innerHTML = emptyState({
        icon: 'lucide:package-search',
        title: 'Nenhum anúncio encontrado',
        desc: 'Tente ajustar os filtros ou remova a busca.'
      });
      return;
    }
    grid.innerHTML = '';
    ads.forEach((ad) => {
      const card = renderAdCard(ad, {
        favorites: state.favorites,
        currentUserId: Auth.getUser() ? Auth.getUser().id : null,
        onFavToggle: toggleFav
      });
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = errorState({ desc: err.message });
    countLabel.textContent = 'Erro ao carregar';
  }
}

async function loadFavorites() {
  const u = Auth.getUser();
  if (!u) return;
  try {
    const favAds = await api.getUserFavorites(u.id);
    state.favorites = new Set(favAds.map((a) => a.id));
  } catch {}
}

function bindFilters() {
  const q = document.getElementById('q');
  const t = document.getElementById('type-filter');
  const s = document.getElementById('sort-select');

  const runSearch = debounce(() => {
    state.filters.search = q.value.trim();
    writeParams();
    load();
  }, 320);

  q.addEventListener('input', runSearch);
  t.addEventListener('change', () => { state.filters.type = t.value; writeParams(); load(); });
  s.addEventListener('change', () => { state.filters.sortBy = s.value; writeParams(); load(); });
}

document.addEventListener('DOMContentLoaded', async () => {
  bootstrapPage();
  readParams();
  syncFormFromState();
  renderChips();
  bindFilters();
  await loadFavorites();
  await load();
});
