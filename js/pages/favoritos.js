import { bootstrapPage, Auth } from '../app.js';
import api from '../api.js';
import { renderAdCard, skeletonCards, emptyState, errorState, toast } from '../ui.js';

if (!Auth.requireAuth()) { /* redirect */ }

const state = { favorites: new Set() };

async function load() {
  const grid = document.getElementById('fav-grid');
  grid.innerHTML = skeletonCards(6);
  const user = Auth.getUser();
  try {
    const ads = await api.getUserFavorites(user.id);
    state.favorites = new Set(ads.map((a) => a.id));
    if (!ads.length) {
      grid.innerHTML = emptyState({
        icon: 'lucide:heart',
        title: 'Nada favoritado ainda',
        desc: 'Comece a favoritar anúncios interessantes para vê-los aqui.'
      });
      return;
    }
    grid.innerHTML = '';
    ads.forEach((ad) => grid.appendChild(renderAdCard(ad, {
      currentUserId: user.id,
      favorites: state.favorites,
      onFavToggle: async (adId, willFav, btn) => {
        try {
          if (willFav) { await api.addFavorite(user.id, adId); }
          else { await api.removeFavorite(user.id, adId); }
          state.favorites.delete(adId);
          btn.closest('.ad-card').style.transition = 'opacity .3s, transform .3s';
          btn.closest('.ad-card').style.opacity = '0';
          btn.closest('.ad-card').style.transform = 'scale(.95)';
          setTimeout(() => load(), 320);
          toast(willFav ? 'Favoritado.' : 'Removido dos favoritos.', { type: 'success' });
        } catch (err) {
          toast(err.message || 'Erro', { type: 'error' });
        }
      }
    })));
  } catch (err) {
    grid.innerHTML = errorState({ desc: err.message });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrapPage();
  load();
});
