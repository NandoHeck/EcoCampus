import { bootstrapPage, Auth, promptInstall, isInstallable } from '../app.js';
import api from '../api.js';
import { renderAdCard, skeletonCards, emptyState, errorState, escapeHtml, toast, confirmDialog, avatarBlock, safeUrl } from '../ui.js';

if (!Auth.requireAuth()) { /* redirect */ }

const state = { user: null, favorites: new Set() };

function renderHead() {
  const u = state.user;
  const mount = document.getElementById('profile-head');
  mount.innerHTML = `
    ${avatarBlock(u.avatar, u.name, 'lg')}
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
      ${isInstallable() ? `
        <button class="btn-ghost" data-install>
          <iconify-icon icon="lucide:download"></iconify-icon> Instalar app
        </button>` : ''}
      <button class="btn-ghost" data-logout>
        <iconify-icon icon="lucide:log-out"></iconify-icon> Sair
      </button>
    </div>
  `;

  const installBtn = mount.querySelector('[data-install]');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      const res = await promptInstall();
      if (res.outcome === 'accepted') installBtn.remove();
    });
  }
  // Se o evento chegar depois do render, re-renderiza o head para mostrar o botão
  document.addEventListener('pwa:installable', () => renderHead(), { once: true });

  mount.querySelector('[data-logout]').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Sair da conta?', message: 'Você precisará entrar novamente.', confirmText: 'Sair' });
    if (!ok) return;
    Auth.logout();
    window.location.href = '/';
  });
}

function renderAvatarEditor() {
  const mount = document.getElementById('avatar-editor');
  if (!mount) return;
  const u = state.user;
  mount.innerHTML = `
    <div class="avatar-edit">
      <div class="avatar-edit__stack" id="avatar-preview">
        ${avatarBlock(u.avatar, u.name, 'xl')}
      </div>
      <div class="avatar-edit__actions">
        <button type="button" class="btn-ghost btn-sm" data-avatar-choose>
          <iconify-icon icon="lucide:image-plus"></iconify-icon>
          ${u.avatar ? 'Trocar foto' : 'Adicionar foto'}
        </button>
        ${u.avatar ? `
          <button type="button" class="btn-danger btn-sm" data-avatar-remove>
            <iconify-icon icon="lucide:image-off"></iconify-icon> Remover
          </button>` : ''}
      </div>
      <p class="avatar-edit__hint">Cole a URL de uma imagem pública (JPG/PNG/WebP). Sem foto, aparece o bonequinho padrão.</p>
    </div>
  `;

  const chooseBtn = mount.querySelector('[data-avatar-choose]');
  const removeBtn = mount.querySelector('[data-avatar-remove]');
  const urlInput = document.getElementById('p-avatar');

  chooseBtn.addEventListener('click', () => {
    urlInput.focus();
    urlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: 'Remover foto de perfil?',
        message: 'Sua foto será substituída pelo ícone padrão.',
        confirmText: 'Remover',
        destructive: true
      });
      if (!ok) return;
      try {
        const updated = await api.updateUser(state.user.id, { avatar: '' });
        Auth.updateUser(updated);
        state.user = updated;
        urlInput.value = '';
        renderHead();
        renderAvatarEditor();
        toast('Foto removida.', { type: 'success' });
      } catch (err) {
        toast(err.message || 'Erro ao remover.', { type: 'error' });
      }
    });
  }
}

// Preview ao vivo enquanto o usuário digita a URL do avatar
function bindAvatarLivePreview() {
  const urlInput = document.getElementById('p-avatar');
  if (!urlInput) return;
  urlInput.addEventListener('input', () => {
    const preview = document.getElementById('avatar-preview');
    if (!preview) return;
    const url = safeUrl(urlInput.value.trim());
    preview.innerHTML = avatarBlock(url, state.user.name, 'xl');
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
      renderAvatarEditor();
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
  renderAvatarEditor();
  fillEditForm();
  bindAvatarLivePreview();
  setupTabs();
  await loadFavs();
  await loadMyAds();
});
