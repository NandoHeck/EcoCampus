import { bootstrapPage, Auth } from '../app.js';
import api, { ApiError } from '../api.js';
import { toast, escapeHtml, safeUrl, errorState, confirmDialog } from '../ui.js';

if (!Auth.requireAuth()) { /* redirect handled */ }

const params = new URLSearchParams(window.location.search);
const adId = params.get('id');

const CATS = ['Livros','Apostilas','Xerox','Calculadoras','Componentes Eletrônicos','Jalecos','Equipamentos','Móveis','Escritório','Outros'];

function renderForm(ad) {
  const mount = document.getElementById('form-mount');
  const isDonation = ad.type === 'donation';
  mount.innerHTML = `
    <form id="ad-form" novalidate>
      <div class="form-field">
        <label class="form-label">Tipo de anúncio</label>
        <div class="type-toggle">
          <input type="radio" name="type" value="sale" id="type-sale" ${!isDonation ? 'checked' : ''}>
          <label for="type-sale"><iconify-icon icon="lucide:tag"></iconify-icon> Venda</label>
          <input type="radio" name="type" value="donation" id="type-donation" ${isDonation ? 'checked' : ''}>
          <label for="type-donation"><iconify-icon icon="lucide:heart-handshake"></iconify-icon> Doação</label>
        </div>
      </div>

      <div class="form-field" data-field="title">
        <label class="form-label" for="title">Título</label>
        <input class="form-input" id="title" name="title" type="text" required maxlength="120" value="${escapeHtml(ad.title)}">
        <span class="form-error" data-error>Título deve ter entre 3 e 120 caracteres.</span>
      </div>

      <div class="form-row">
        <div class="form-field" data-field="category">
          <label class="form-label" for="category">Categoria</label>
          <select class="form-select" id="category" name="category" required>
            ${CATS.map((c) => `<option ${c === ad.category ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
          </select>
          <span class="form-error" data-error>Escolha uma categoria.</span>
        </div>
        <div class="form-field" data-field="price" id="price-field">
          <label class="form-label" for="price">Preço (R$)</label>
          <input class="form-input" id="price" name="price" type="number" min="0" step="0.01" value="${Number(ad.price) || 0}">
          <span class="form-hint">Deixe 0 se for doação.</span>
          <span class="form-error" data-error>Informe um preço válido.</span>
        </div>
      </div>

      <div class="form-field" data-field="imageUrl">
        <label class="form-label" for="imageUrl">URL da imagem</label>
        <input class="form-input" id="imageUrl" name="imageUrl" type="url" value="${escapeHtml(ad.imageUrl || '')}">
        <div class="image-preview" id="image-preview">
          ${ad.imageUrl ? `<img src="${escapeHtml(safeUrl(ad.imageUrl))}" alt="">` : '<span>Pré-visualização da imagem aparecerá aqui</span>'}
        </div>
        <span class="form-error" data-error>URL de imagem inválida.</span>
      </div>

      <div class="form-field" data-field="description">
        <label class="form-label" for="description">Descrição</label>
        <textarea class="form-textarea" id="description" name="description" required minlength="10" maxlength="2000">${escapeHtml(ad.description)}</textarea>
        <span class="form-hint"><span id="desc-count">${ad.description.length}</span>/2000 caracteres</span>
        <span class="form-error" data-error>Descrição precisa ter entre 10 e 2000 caracteres.</span>
      </div>

      <div class="form-actions" style="justify-content:space-between">
        <button class="btn-danger" type="button" id="delete-btn">
          <iconify-icon icon="lucide:trash-2"></iconify-icon> Excluir
        </button>
        <div style="display:flex;gap:.7rem;flex-wrap:wrap">
          <a class="btn-ghost" href="/pages/anuncio.html?id=${encodeURIComponent(ad.id)}">Cancelar</a>
          <button class="btn-primary" type="submit" id="submit-btn">
            <span data-label>Salvar alterações</span>
            <iconify-icon icon="lucide:check" data-icon></iconify-icon>
          </button>
        </div>
      </div>
    </form>
  `;

  bindForm(ad);
}

function bindForm(ad) {
  const form = document.getElementById('ad-form');

  // Preview
  const imgInput = form.querySelector('#imageUrl');
  const preview = form.querySelector('#image-preview');
  imgInput.addEventListener('input', () => {
    const url = safeUrl(imgInput.value);
    preview.innerHTML = url
      ? `<img src="${escapeHtml(url)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'Não foi possível carregar a imagem'}))">`
      : '<span>Pré-visualização da imagem aparecerá aqui</span>';
  });

  // Counter
  const t = form.querySelector('#description');
  const c = form.querySelector('#desc-count');
  t.addEventListener('input', () => { c.textContent = t.value.length; });

  // Type toggle
  const priceField = form.querySelector('#price-field');
  const priceInput = form.querySelector('#price');
  const applyType = () => {
    const type = form.querySelector('input[name="type"]:checked').value;
    if (type === 'donation') { priceField.style.opacity = '.5'; priceInput.value = '0'; priceInput.disabled = true; }
    else { priceField.style.opacity = ''; priceInput.disabled = false; }
  };
  form.querySelectorAll('input[name="type"]').forEach((r) => r.addEventListener('change', applyType));
  applyType();

  // Clear errors on change
  form.querySelectorAll('input,textarea,select').forEach((el) => {
    el.addEventListener('input', () => {
      const f = el.closest('[data-field]');
      if (f) f.classList.remove('has-error');
    });
  });

  // Delete
  document.getElementById('delete-btn').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Excluir este anúncio?',
      message: 'Esta ação é permanente.',
      confirmText: 'Excluir',
      destructive: true
    });
    if (!ok) return;
    try {
      await api.deleteAd(ad.id);
      toast('Anúncio excluído.', { type: 'success' });
      setTimeout(() => { window.location.href = '/pages/perfil.html'; }, 400);
    } catch (err) {
      toast(err.message || 'Erro ao excluir', { type: 'error' });
    }
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      type: String(fd.get('type') || ad.type),
      title: String(fd.get('title') || '').trim(),
      category: String(fd.get('category') || '').trim(),
      price: Number(fd.get('price')) || 0,
      imageUrl: String(fd.get('imageUrl') || '').trim(),
      description: String(fd.get('description') || '').trim()
    };

    let ok = true;
    const setErr = (name) => { const f = form.querySelector(`[data-field="${name}"]`); if (f) f.classList.add('has-error'); ok = false; };
    if (payload.title.length < 3) setErr('title');
    if (!payload.category) setErr('category');
    if (payload.type === 'sale' && payload.price < 0) setErr('price');
    if (payload.description.length < 10) setErr('description');
    if (!ok) return;

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    const label = btn.querySelector('[data-label]');
    if (label) label.textContent = 'Salvando...';
    try {
      await api.updateAd(ad.id, payload);
      toast('Anúncio atualizado.', { type: 'success' });
      setTimeout(() => { window.location.href = `/pages/anuncio.html?id=${encodeURIComponent(ad.id)}`; }, 400);
    } catch (err) {
      btn.disabled = false;
      if (label) label.textContent = 'Salvar alterações';
      toast(err.message || 'Falha ao salvar', { type: 'error' });
    }
  });
}

async function boot() {
  const mount = document.getElementById('form-mount');
  if (!adId) {
    mount.innerHTML = errorState({ title: 'Link inválido', desc: 'Nenhum anúncio informado.' });
    return;
  }
  try {
    const ad = await api.getAd(adId);
    const user = Auth.getUser();
    if (!user || user.id !== ad.userId) {
      mount.innerHTML = errorState({ title: 'Sem permissão', desc: 'Você só pode editar seus próprios anúncios.' });
      return;
    }
    renderForm(ad);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      mount.innerHTML = errorState({ title: 'Anúncio não encontrado', desc: 'O item pode ter sido removido.' });
    } else {
      mount.innerHTML = errorState({ desc: err.message });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrapPage();
  boot();
});
