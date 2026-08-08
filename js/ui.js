/**
 * ui.js — Utilidades de UI: escape, sanitização, toast, modal, skeleton, ripple.
 */

/* --------- Segurança: escape HTML --------- */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function safeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^javascript:/i.test(trimmed)) return '';
  if (/^data:/i.test(trimmed) && !/^data:image\//i.test(trimmed)) return '';
  return trimmed;
}

/**
 * Renderiza um bloco de avatar consistente:
 * - Se `avatar` for uma URL válida, mostra <img>.
 * - Caso contrário, mostra um ícone de usuário (bonequinho, estilo Gmail/WhatsApp).
 *
 * @param {string|null|undefined} avatar - URL da imagem.
 * @param {string} name - Nome do usuário (para alt/aria).
 * @param {"sm"|"md"|"lg"|"xl"} size
 * @param {string} extraClass
 */
export function avatarBlock(avatar, name = '', size = 'md', extraClass = '') {
  const sizeClass = size === 'sm' ? '' : size === 'lg' ? 'avatar--lg' : size === 'xl' ? 'avatar--xl' : '';
  const url = safeUrl(avatar);
  if (url) {
    return `
      <div class="avatar ${sizeClass} ${extraClass}">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(name || 'Avatar')}"
             onerror="this.remove(); this.parentElement.classList.add('avatar--empty'); this.parentElement.insertAdjacentHTML('beforeend', '<iconify-icon icon=&quot;lucide:user-round&quot;></iconify-icon>');">
      </div>
    `;
  }
  return `
    <div class="avatar avatar--empty ${sizeClass} ${extraClass}" aria-label="${escapeHtml(name || 'Sem foto de perfil')}">
      <iconify-icon icon="lucide:user-round"></iconify-icon>
    </div>
  `;
}

/* --------- Format helpers --------- */
export function formatPrice(value, type) {
  if (type === 'donation' || Number(value) === 0) return 'Doação';
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export function relativeTime(iso) {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    if (diff < 2592000) return `há ${Math.floor(diff / 86400)} d`;
    return formatDate(iso);
  } catch {
    return '';
  }
}

/* --------- Debounce --------- */
export function debounce(fn, wait = 300) {
  let t;
  return function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* --------- Toast --------- */
function getToastRegion() {
  let region = document.querySelector('.toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  return region;
}

const TOAST_ICONS = {
  success: 'lucide:check-circle-2',
  error: 'lucide:alert-triangle',
  info: 'lucide:info'
};

export function toast(message, { type = 'info', duration = 3500 } = {}) {
  const region = getToastRegion();
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `
    <iconify-icon icon="${TOAST_ICONS[type] || TOAST_ICONS.info}"></iconify-icon>
    <span>${escapeHtml(message)}</span>
  `;
  region.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'opacity .3s, transform .3s';
    setTimeout(() => el.remove(), 320);
  }, duration);
}

/* --------- Confirm Modal --------- */
export function confirmDialog({
  title = 'Confirmar',
  message = 'Tem certeza?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal is-open';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="modal__body">
        <h3 class="modal__title">${escapeHtml(title)}</h3>
        <p class="modal__text">${escapeHtml(message)}</p>
        <div class="modal__actions">
          <button class="btn-ghost btn-sm" data-cancel type="button">${escapeHtml(cancelText)}</button>
          <button class="${destructive ? 'btn-danger' : 'btn-primary'} btn-sm" data-confirm type="button">
            ${escapeHtml(confirmText)}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const cleanup = (value) => {
      overlay.classList.remove('is-open');
      setTimeout(() => overlay.remove(), 250);
      document.removeEventListener('keydown', onKey);
      resolve(value);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') cleanup(false);
      if (e.key === 'Enter') cleanup(true);
    };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
      if (e.target.matches('[data-cancel]')) cleanup(false);
      if (e.target.matches('[data-confirm]')) cleanup(true);
    });
    document.addEventListener('keydown', onKey);
    setTimeout(() => overlay.querySelector('[data-confirm]').focus(), 50);
  });
}

/* --------- Skeleton --------- */
export function skeletonCards(count = 6) {
  return Array.from({ length: count }, () => `
    <div class="skeleton skeleton--card"></div>
  `).join('');
}

/* --------- Empty State --------- */
export function emptyState({ icon = 'lucide:package-open', title = 'Nada por aqui', desc = '' } = {}) {
  return `
    <div class="state">
      <div class="state__icon"><iconify-icon icon="${icon}"></iconify-icon></div>
      <div class="state__title">${escapeHtml(title)}</div>
      <div class="state__desc">${escapeHtml(desc)}</div>
    </div>
  `;
}

export function errorState({ title = 'Algo deu errado', desc = 'Tente novamente em instantes.' } = {}) {
  return `
    <div class="state">
      <div class="state__icon state__icon--error"><iconify-icon icon="lucide:alert-triangle"></iconify-icon></div>
      <div class="state__title">${escapeHtml(title)}</div>
      <div class="state__desc">${escapeHtml(desc)}</div>
    </div>
  `;
}

/* --------- Scroll Reveal --------- */
export function setupScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.animate-on-scroll').forEach((el) => io.observe(el));
}

/* --------- Ripple --------- */
export function setupRipple(selector = '.btn-primary, .btn-ghost, .btn-icon') {
  document.addEventListener('click', (e) => {
    const target = e.target.closest(selector);
    if (!target || target.disabled) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

/* --------- Image lazy-fade --------- */
export function progressiveImages(scope = document) {
  scope.querySelectorAll('img[data-src]').forEach((img) => {
    img.classList.add('img-loading');
    const src = img.dataset.src;
    if (!src) return;
    img.src = src;
    img.addEventListener('load', () => {
      img.classList.remove('img-loading');
      img.classList.add('img-loaded');
    }, { once: true });
    img.addEventListener('error', () => img.classList.remove('img-loading'), { once: true });
  });
}

/* --------- Ad Card renderer --------- */
export function renderAdCard(ad, { favorites = new Set(), currentUserId = null, onFavToggle = null } = {}) {
  const isFav = favorites.has(ad.id);
  const isDonation = ad.type === 'donation';
  const img = safeUrl(ad.imageUrl) || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';
  const canFav = Boolean(currentUserId);
  const priceClass = isDonation ? 'ad-card__price ad-card__price--donation' : 'ad-card__price';
  const priceLabel = isDonation ? 'Doação' : formatPrice(ad.price);

  const card = document.createElement('article');
  card.className = 'ad-card';
  card.setAttribute('data-id', ad.id);
  card.innerHTML = `
    <a class="ad-card__media" href="/pages/anuncio.html?id=${encodeURIComponent(ad.id)}" aria-label="${escapeHtml(ad.title)}">
      <span class="ad-card__type">
        <span class="tag ${isDonation ? 'tag--donation' : 'tag--sale'}">
          <iconify-icon icon="${isDonation ? 'lucide:heart-handshake' : 'lucide:tag'}"></iconify-icon>
          ${isDonation ? 'Doação' : 'Venda'}
        </span>
      </span>
      ${canFav ? `
        <button type="button" class="ad-card__fav ${isFav ? 'is-active' : ''}" aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" data-fav>
          <iconify-icon icon="${isFav ? 'lucide:heart' : 'lucide:heart'}" style="${isFav ? 'fill:currentColor' : ''}"></iconify-icon>
        </button>` : ''}
      <img loading="lazy" src="${escapeHtml(img)}" alt="${escapeHtml(ad.title)}" onerror="this.style.opacity=0.4;this.src='https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';">
    </a>
    <div class="ad-card__body">
      <span class="ad-card__cat">${escapeHtml(ad.category)}</span>
      <a class="ad-card__title" href="/pages/anuncio.html?id=${encodeURIComponent(ad.id)}">${escapeHtml(ad.title)}</a>
      <div class="ad-card__meta">
        <span class="${priceClass}">${escapeHtml(priceLabel)}</span>
        <span class="ad-card__author">
          <iconify-icon icon="lucide:user-round"></iconify-icon> ${escapeHtml(ad.advertiser || '—')}
        </span>
      </div>
    </div>
  `;

  if (canFav && onFavToggle) {
    const favBtn = card.querySelector('[data-fav]');
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onFavToggle(ad.id, !favBtn.classList.contains('is-active'), favBtn);
    });
  }

  return card;
}

/* --------- Dropdown Menu --------- */
export function setupMenu(root) {
  if (!root) return;
  const trigger = root.querySelector('[data-menu-trigger]');
  if (!trigger) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    root.classList.toggle('is-open');
  });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) root.classList.remove('is-open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') root.classList.remove('is-open');
  });
}
