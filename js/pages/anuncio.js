import { bootstrapPage, Auth } from '../app.js';
import api, { ApiError } from '../api.js';
import {
  renderAdCard, escapeHtml, safeUrl, formatPrice, formatDate,
  toast, confirmDialog, errorState, skeletonCards, emptyState, avatarBlock
} from '../ui.js';

const params = new URLSearchParams(window.location.search);
const adId = params.get('id');

function renderNotFound() {
  document.getElementById('detail-mount').innerHTML = emptyState({
    icon: 'lucide:package-x',
    title: 'Anúncio não encontrado',
    desc: 'O item pode ter sido removido ou o link está inválido.'
  });
}

async function load() {
  if (!adId) { renderNotFound(); return; }
  const mount = document.getElementById('detail-mount');
  try {
    const ad = await api.getAd(adId);
    const user = Auth.getUser();
    const isOwner = user && user.id === ad.userId;
    const isDonation = ad.type === 'donation';
    const img = safeUrl(ad.imageUrl) || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80';

    let favSet = new Set();
    if (user) {
      try {
        const favs = await api.getUserFavorites(user.id);
        favSet = new Set(favs.map((a) => a.id));
      } catch {}
    }
    const isFav = favSet.has(ad.id);

    // Busca o dono para exibir o avatar real (não gera random)
    let owner = null;
    try { owner = await api.getUser(ad.userId); } catch {}
    const ownerAvatar = owner && owner.avatar ? owner.avatar : '';

    mount.innerHTML = `
      <div class="detail-grid">
        <div class="detail-media">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(ad.title)}" onerror="this.style.opacity=0.4">
        </div>
        <div class="detail-info">
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            <span class="tag ${isDonation ? 'tag--donation' : 'tag--sale'}">
              <iconify-icon icon="${isDonation ? 'lucide:heart-handshake' : 'lucide:tag'}"></iconify-icon>
              ${isDonation ? 'Doação' : 'Venda'}
            </span>
            <span class="tag tag--muted">${escapeHtml(ad.category)}</span>
          </div>

          <h1>${escapeHtml(ad.title)}</h1>

          <div class="detail-price ${isDonation ? 'detail-price--donation' : ''}">${escapeHtml(formatPrice(ad.price, ad.type))}</div>

          <div class="detail-desc">${escapeHtml(ad.description)}</div>

          <div class="detail-meta">
            <div class="detail-meta__row">
              <span class="detail-meta__label">Publicado em</span>
              <span class="detail-meta__value">${escapeHtml(formatDate(ad.createdAt))}</span>
            </div>
            <div class="detail-meta__row">
              <span class="detail-meta__label">Visualizações</span>
              <span class="detail-meta__value">${Number(ad.views) || 0}</span>
            </div>
            <div class="detail-meta__row">
              <span class="detail-meta__label">Categoria</span>
              <span class="detail-meta__value">${escapeHtml(ad.category)}</span>
            </div>
            <div class="detail-meta__row">
              <span class="detail-meta__label">Tipo</span>
              <span class="detail-meta__value">${isDonation ? 'Doação' : 'Venda'}</span>
            </div>
          </div>

          <div class="detail-owner">
            ${avatarBlock(ownerAvatar, ad.advertiser, 'sm')}
            <div class="detail-owner__info">
              <strong>${escapeHtml(ad.advertiser || 'Estudante')}</strong>
              <span>${escapeHtml(owner && owner.university ? owner.university : 'Anunciante')}</span>
            </div>
          </div>

          <div class="detail-actions">
            ${isOwner ? `
              <a class="btn-primary" href="/pages/editar-anuncio.html?id=${encodeURIComponent(ad.id)}">
                <iconify-icon icon="lucide:edit-3"></iconify-icon> Editar anúncio
              </a>
              <button class="btn-danger" data-delete>
                <iconify-icon icon="lucide:trash-2"></iconify-icon> Excluir
              </button>
            ` : `
              <button class="btn-primary" data-contact>
                <iconify-icon icon="lucide:mail"></iconify-icon> Entrar em contato
              </button>
              <button class="btn-ghost" data-fav aria-pressed="${isFav}">
                <iconify-icon icon="lucide:heart" style="${isFav ? 'fill:currentColor;color:var(--accent)' : ''}"></iconify-icon>
                ${isFav ? 'Favoritado' : 'Favoritar'}
              </button>
            `}
            <button class="btn-icon" data-share aria-label="Compartilhar">
              <iconify-icon icon="lucide:share-2"></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    `;

    if (isOwner) {
      mount.querySelector('[data-delete]').addEventListener('click', async () => {
        const ok = await confirmDialog({
          title: 'Excluir anúncio?',
          message: 'Esta ação não pode ser desfeita.',
          confirmText: 'Excluir',
          destructive: true
        });
        if (!ok) return;
        try {
          await api.deleteAd(ad.id);
          toast('Anúncio excluído.', { type: 'success' });
          setTimeout(() => { window.location.href = '/pages/perfil.html'; }, 400);
        } catch (err) {
          toast(err.message || 'Falha ao excluir', { type: 'error' });
        }
      });
    } else {
      const contactBtn = mount.querySelector('[data-contact]');
      if (contactBtn) contactBtn.addEventListener('click', () => {
        toast(`Envie um e-mail para ${ad.advertiser}. (Contato direto é responsabilidade dos estudantes)`, { type: 'info' });
      });
      const favBtn = mount.querySelector('[data-fav]');
      if (favBtn) favBtn.addEventListener('click', async () => {
        if (!user) { toast('Faça login para favoritar.', { type: 'info' }); return; }
        const nowFav = !favSet.has(ad.id);
        try {
          if (nowFav) {
            await api.addFavorite(user.id, ad.id);
            favSet.add(ad.id);
          } else {
            await api.removeFavorite(user.id, ad.id);
            favSet.delete(ad.id);
          }
          favBtn.setAttribute('aria-pressed', String(nowFav));
          favBtn.innerHTML = `
            <iconify-icon icon="lucide:heart" style="${nowFav ? 'fill:currentColor;color:var(--accent)' : ''}"></iconify-icon>
            ${nowFav ? 'Favoritado' : 'Favoritar'}
          `;
          toast(nowFav ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.', { type: 'success' });
        } catch (err) {
          toast(err.message || 'Erro ao favoritar', { type: 'error' });
        }
      });
    }

    const shareBtn = mount.querySelector('[data-share]');
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: ad.title,
        text: `${ad.title} — EcoCampus`,
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          toast('Link copiado!', { type: 'success' });
        }
      } catch { /* usuário cancelou */ }
    });

    loadRelated(ad);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      renderNotFound();
    } else {
      mount.innerHTML = errorState({ desc: err.message });
    }
  }
}

async function loadRelated(currentAd) {
  const mount = document.getElementById('related-grid');
  mount.innerHTML = skeletonCards(4);
  try {
    const ads = await api.listAds({ category: currentAd.category, limit: 8 });
    const others = ads.filter((a) => a.id !== currentAd.id).slice(0, 4);
    if (!others.length) {
      mount.innerHTML = emptyState({
        icon: 'lucide:sparkles',
        title: 'Sem relacionados',
        desc: 'Este é o único anúncio da categoria por enquanto.'
      });
      return;
    }
    const user = Auth.getUser();
    mount.innerHTML = '';
    others.forEach((ad) => mount.appendChild(renderAdCard(ad, {
      currentUserId: user ? user.id : null,
      favorites: new Set()
    })));
  } catch (err) {
    mount.innerHTML = errorState({ desc: err.message });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrapPage();
  load();
});
