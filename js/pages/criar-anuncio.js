import { bootstrapPage, Auth } from '../app.js';
import api from '../api.js';
import { toast, escapeHtml, safeUrl } from '../ui.js';

if (!Auth.requireAuth()) {
  // requireAuth já faz redirect
}

function setFieldError(form, name, msg) {
  const field = form.querySelector(`[data-field="${name}"]`);
  if (!field) return;
  const err = field.querySelector('[data-error]');
  if (err && msg) err.textContent = msg;
  field.classList.add('has-error');
}
function clearFieldError(form, name) {
  const f = form.querySelector(`[data-field="${name}"]`);
  if (f) f.classList.remove('has-error');
}
function clearAll(form) {
  form.querySelectorAll('[data-field]').forEach((f) => f.classList.remove('has-error'));
}

function setLoading(btn, loading) {
  const label = btn.querySelector('[data-label]');
  const icon = btn.querySelector('[data-icon]');
  if (loading) {
    btn.disabled = true;
    if (label) { btn.dataset.originalLabel = label.textContent; label.textContent = 'Enviando...'; }
    if (icon) icon.outerHTML = '<span class="spinner spinner--sm" data-icon></span>';
  } else {
    btn.disabled = false;
    if (label && btn.dataset.originalLabel) label.textContent = btn.dataset.originalLabel;
    const s = btn.querySelector('.spinner');
    if (s) s.outerHTML = '<iconify-icon icon="lucide:send" data-icon></iconify-icon>';
  }
}

function setupImagePreview(form) {
  const input = form.querySelector('#imageUrl');
  const preview = form.querySelector('#image-preview');
  input.addEventListener('input', () => {
    const url = safeUrl(input.value);
    if (!url) {
      preview.innerHTML = '<span>Pré-visualização da imagem aparecerá aqui</span>';
      return;
    }
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Pré-visualização" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'Não foi possível carregar a imagem'}))">`;
  });
}

function setupDescCounter(form) {
  const t = form.querySelector('#description');
  const c = form.querySelector('#desc-count');
  const upd = () => { c.textContent = t.value.length; };
  t.addEventListener('input', upd);
  upd();
}

function setupTypeToggle(form) {
  const priceField = form.querySelector('#price-field');
  const priceInput = form.querySelector('#price');
  const rs = form.querySelectorAll('input[name="type"]');
  const applyState = () => {
    const type = form.querySelector('input[name="type"]:checked').value;
    if (type === 'donation') {
      priceField.style.opacity = '.5';
      priceInput.value = '0';
      priceInput.disabled = true;
    } else {
      priceField.style.opacity = '';
      priceInput.disabled = false;
    }
  };
  rs.forEach((r) => r.addEventListener('change', applyState));
  applyState();
}

async function submit(form) {
  clearAll(form);
  const fd = new FormData(form);
  const payload = {
    type: String(fd.get('type') || 'sale'),
    title: String(fd.get('title') || '').trim(),
    category: String(fd.get('category') || '').trim(),
    price: Number(fd.get('price')) || 0,
    imageUrl: String(fd.get('imageUrl') || '').trim(),
    description: String(fd.get('description') || '').trim()
  };

  let valid = true;
  if (payload.title.length < 3 || payload.title.length > 120) { setFieldError(form, 'title'); valid = false; }
  if (!payload.category) { setFieldError(form, 'category'); valid = false; }
  if (payload.type === 'sale' && (isNaN(payload.price) || payload.price < 0)) { setFieldError(form, 'price'); valid = false; }
  if (payload.description.length < 10) { setFieldError(form, 'description'); valid = false; }
  if (payload.imageUrl && !/^https?:\/\//i.test(payload.imageUrl)) { setFieldError(form, 'imageUrl', 'A URL deve iniciar com http(s)://'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  setLoading(btn, true);
  try {
    const created = await api.createAd(payload);
    toast('Anúncio publicado com sucesso!', { type: 'success' });
    setTimeout(() => { window.location.href = `/pages/anuncio.html?id=${encodeURIComponent(created.id)}`; }, 500);
  } catch (err) {
    setLoading(btn, false);
    toast(err.message || 'Não foi possível publicar.', { type: 'error' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrapPage();
  const form = document.getElementById('ad-form');
  if (!form) return;
  setupImagePreview(form);
  setupDescCounter(form);
  setupTypeToggle(form);
  form.querySelectorAll('input,textarea,select').forEach((el) => {
    el.addEventListener('input', () => clearFieldError(form, el.name));
    el.addEventListener('change', () => clearFieldError(form, el.name));
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); submit(form); });
});
