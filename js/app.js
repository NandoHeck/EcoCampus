/**
 * app.js — Bootstrap comum a todas as páginas.
 * Renderiza navbar/bottom-nav, aplica scroll-reveal, ripple e progressive images.
 */

import Auth from './auth.js';
import { setupScrollReveal, setupRipple, progressiveImages, setupMenu, escapeHtml, avatarBlock } from './ui.js';

const NAV_ITEMS = [
  { href: '/pages/dashboard.html', label: 'Descobrir', icon: 'lucide:compass' },
  { href: '/pages/anuncios.html', label: 'Anúncios', icon: 'lucide:layout-grid' },
  { href: '/pages/favoritos.html', label: 'Favoritos', icon: 'lucide:heart' }
];

const BOTTOM_ITEMS = [
  { href: '/pages/dashboard.html', label: 'Início', icon: 'lucide:home' },
  { href: '/pages/anuncios.html', label: 'Explorar', icon: 'lucide:layout-grid' },
  { href: '/pages/criar-anuncio.html', label: 'Anunciar', icon: 'lucide:plus-circle', primary: true },
  { href: '/pages/favoritos.html', label: 'Favoritos', icon: 'lucide:heart' },
  { href: '/pages/perfil.html', label: 'Perfil', icon: 'lucide:user-round' }
];

function isActive(href) {
  const current = window.location.pathname.toLowerCase();
  return current.endsWith(href.toLowerCase());
}

function renderNavbar(mount) {
  const user = Auth.getUser();
  const logged = Boolean(user);

  const links = NAV_ITEMS.map((item) => `
    <a href="${item.href}" class="${isActive(item.href) ? 'is-active' : ''}">
      <iconify-icon icon="${item.icon}"></iconify-icon> ${item.label}
    </a>`).join('');

  const authArea = logged
    ? `
      <div class="menu" data-menu>
        <button class="btn-icon" data-menu-trigger aria-label="Menu do usuário" aria-haspopup="true" style="padding:2px">
          ${avatarBlock(user.avatar, user.name, 'sm')}
        </button>
        <div class="menu__panel" role="menu">
          <a class="menu__item" href="/pages/perfil.html"><iconify-icon icon="lucide:user"></iconify-icon> Meu perfil</a>
          <a class="menu__item" href="/pages/favoritos.html"><iconify-icon icon="lucide:heart"></iconify-icon> Favoritos</a>
          <a class="menu__item" href="/pages/perfil.html#meus-anuncios"><iconify-icon icon="lucide:megaphone"></iconify-icon> Meus anúncios</a>
          <div class="menu__divider"></div>
          <button type="button" class="menu__item" data-logout><iconify-icon icon="lucide:log-out"></iconify-icon> Sair</button>
        </div>
      </div>
      <a href="/pages/criar-anuncio.html" class="btn-primary btn-sm">
        <iconify-icon icon="lucide:plus"></iconify-icon> Anunciar
      </a>
    `
    : `
      <a href="/pages/login.html" class="nav-links__login" style="font-size:13.5px;color:var(--muted);padding:.4rem .8rem;border-radius:8px;transition:color .3s var(--ease)">Entrar</a>
      <a href="/pages/cadastro.html" class="btn-primary btn-sm">
        Criar conta <iconify-icon icon="lucide:arrow-right"></iconify-icon>
      </a>
    `;

  mount.innerHTML = `
    <nav class="navbar" role="navigation" aria-label="Navegação principal">
      <div class="navbar__inner">
        <a href="/" class="brand" aria-label="EcoCampus, ir para landing">
          <span class="brand__dot"></span>
          ECOCAMPUS <span class="brand__sub">· universitário</span>
        </a>
        <div class="nav-links" role="menubar">
          ${links}
        </div>
        <div class="nav-actions">
          ${authArea}
          <button class="nav-toggle" aria-label="Abrir menu" data-nav-toggle>
            <iconify-icon icon="lucide:menu"></iconify-icon>
          </button>
        </div>
      </div>
    </nav>
  `;

  const menu = mount.querySelector('[data-menu]');
  setupMenu(menu);

  const logoutBtn = mount.querySelector('[data-logout]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
      window.location.href = '/';
    });
  }

  const toggle = mount.querySelector('[data-nav-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      // Mostra links em drawer (usa menu inline pra simplicidade)
      const linksEl = mount.querySelector('.nav-links');
      if (!linksEl) return;
      const isShown = linksEl.style.display === 'flex';
      if (isShown) {
        linksEl.style.display = '';
      } else {
        linksEl.style.display = 'flex';
        linksEl.style.position = 'absolute';
        linksEl.style.top = 'calc(var(--doc-nav-h))';
        linksEl.style.left = '0';
        linksEl.style.right = '0';
        linksEl.style.background = 'rgba(13,24,68,.96)';
        linksEl.style.flexDirection = 'column';
        linksEl.style.padding = '1rem';
        linksEl.style.borderBottom = '1px solid var(--hairline)';
        linksEl.style.margin = '0';
      }
    });
  }
}

function renderBottomNav(mount) {
  const items = BOTTOM_ITEMS.map((item) => `
    <a href="${item.href}" class="bottom-nav__item ${isActive(item.href) ? 'is-active' : ''}" aria-label="${item.label}">
      <iconify-icon icon="${item.icon}"></iconify-icon>
      <span>${item.label}</span>
    </a>
  `).join('');

  mount.innerHTML = `
    <nav class="bottom-nav" aria-label="Navegação inferior">
      <div class="bottom-nav__list">${items}</div>
    </nav>
  `;
  document.body.classList.add('has-bottom-nav');
}

export function mountChrome({ showNavbar = true, showBottomNav = true } = {}) {
  if (showNavbar) {
    const nav = document.getElementById('app-navbar');
    if (nav) renderNavbar(nav);
  }
  if (showBottomNav) {
    const bottom = document.getElementById('app-bottom-nav');
    if (bottom) renderBottomNav(bottom);
  }
}

export function bootstrapPage(opts = {}) {
  mountChrome(opts);
  setupScrollReveal();
  setupRipple();
  progressiveImages();
}

export { Auth };
