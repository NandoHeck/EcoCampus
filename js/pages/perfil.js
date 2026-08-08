import { bootstrapPage, Auth } from '../app.js';
import api from '../api.js';
import { renderAdCard, skeletonCards, emptyState, errorState, escapeHtml, toast, confirmDialog } from '../ui.js';

if (!Auth.requireAuth()) { /* redirect */ }

const state = { user: null, favorites: new Set() };

function renderHead() {
  const u = state.user;
  const mount = document.getElementById('profile-head');
  mount.innerHTML = `
    <div class="avatar avatar--lg">
      <img src="${escapeHtml(u.avatar || 'https://i.pravatar.cc/200?u=' + encodeURIComponent(u.email))}" alt="${escapeHtml(u.name)}">
    </div>
    <div class="profile-head__info">
      <h1>${escapeHtml(u.name)}</h1>
      <p>
        <iconify-icon icon="lucide:mail" style="vertical-align:-2px"></iconify-icon>
        ${escapeHtml(u.email)}
        ${u.university ? ` · <iconify-icon icon="lucide:school" style="vertical-align:-2px"></iconify-icon> ${escapeHtml(u.university)}` : ''}
        ${u.course ? ` · <iconify-icon icon="lucide:graduation-cap" style="vertical-align:-2px"></iconify-icon> ${escapeHtml(u.course)}` : ''}
      </p>
    </div>
    <div class="profile-head__actions">
      <a class="btn-primary" href="/pages/criar-anuncio.html">
        <iconify-icon icon="lucide:plus"></iconify-icon> Novo anúncio
      </a>
      <button class="btn-ghost" data-logout>
        <iconify-icon icon="lucide:log-out"></iconify-icon> Sair
      </button>
    </div>
  `;
  mount.querySelector('[data-logout]').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Sair da conta?', message: 'Você precisará entrar novamente.', confirmText: 'Sair' });
    if (!ok) return;
    Auth.logout();
    window.location.href = '/';
  });
}

async function loadFavs() {
  try {
    const favAds = await api.getUserFavorites(state.user.id);
    state.favorites = new Set(favAds.map((a) => a.id));
    return favAds;
  } catch { return []; }
}

async function loadMyAds() {
  const grid = document.getElementById('my-ads-grid');
  grid.innerHTML = skeletonCards(6);
  try {
    const ads = await api.getUserAds(state.user.id);
    if (!ads.length) {
      grid.innerHTML = emptyState({
        icon: 'lucide:megaphone',
        title: 'Você ainda não anunciou nada',
        desc: 'Clique em "Novo anúncio" para publicar seu primeiro item.'
      });
      return;
    }
    grid.innerHTML = '';
    ads.forEach((ad) => grid.appendChild(renderAdCard(ad, {
      currentUserId: state.user.id,
      favorites: state.favorites
    })));
  } catch (err) {
    grid.innerHTML = errorState({ desc: err.message });
  }
}

async function loadFavGrid() {
  const grid = document.getElementById('my-favs-grid');
  grid.innerHTML = skeletonCards(6);
  try {
    const ads = await loadFavs();
    if (!ads.length) {
      grid.innerHTML = emptyState({
        icon: 'lucide:heart',
        title: 'Sem favoritos ainda',
        desc: 'Explore os anúncios e clique no coração para salvar.'
      });
      return;
    }
    grid.innerHTML = '';
    ads.forEach((ad) => grid.appendChild(renderAdCard(ad, {
      currentUserId: state.user.id,
      favorites: state.favorites,
      onFavToggle: async (adId, willFav, btn) => {
        try {
          if (willFav) { await api.addFavorite(state.user.id, adId); state.favorites.add(adId); btn.classList.add('is-active'); }
          else { await api.removeFavorite(state.user.id, adId); state.favorites.delete(adId); btn.classList.remove('is-active'); loadFavGrid(); }
        } catch (err) { toast(err.message, { type: 'error' }); }
      }
    })));
  } catch (err) {
    grid.innerHTML = errorState({ desc: err.message });
  }
}

function fillEditForm() {
  const u = state.user;
  document.getElementById('p-name').value = u.name || '';
  document.getElementById('p-uni').value = u.university || '';
  document.getElementById('p-course').value = u.course || '';
  document.getElementById('p-avatar').value = u.avatar || '';

  const form = document.getElementById('profile-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      university: String(fd.get('university') || '').trim(),
      course: String(fd.get('course') || '').trim(),
      avatar: String(fd.get('avatar') || '').trim()
    };
    const nameField = form.querySelector('[data-field="name"]');
    nameField.classList.remove('has-error');
    if (payload.name.length < 2) { nameField.classList.add('has-error'); return; }

    const btn = document.getElementById('p-submit');
    btn.disabled = true;
    try {
      const updated = await api.updateUser(state.user.id, payload);
      Auth.updateUser(updated);
      state.user = updated;
      renderHead();
      toast('Perfil atualizado.', { type: 'success' });
    } catch (err) {
      toast(err.message || 'Erro ao salvar.', { type: 'error' });
    } finally {
      btn.disabled = false;
    }
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll('.profile-tab');
  const panels = {
    'meus-anuncios': document.getElementById('tab-meus-anuncios'),
    'favoritos': document.getElementById('tab-favoritos'),
    'editar': document.getElementById('tab-editar')
  };
  const activate = (name) => {
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
    Object.entries(panels).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
    if (name === 'favoritos') loadFavGrid();
    if (name === 'meus-anuncios') loadMyAds();
    if (window.location.hash !== '#' + name) history.replaceState({}, '', '#' + name);
  };
  tabs.forEach((t) => t.addEventListener('click', () => activate(t.dataset.tab)));

  const initial = (window.location.hash || '#meus-anuncios').replace('#', '');
  if (panels[initial]) activate(initial);
}

document.addEventListener('DOMContentLoaded', async () => {
  bootstrapPage();
  state.user = Auth.getUser();
  renderHead();
  fillEditForm();
  setupTabs();
  await loadFavs();
  await loadMyAds();
});
