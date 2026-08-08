import Auth from '../auth.js';
import { toast, escapeHtml } from '../ui.js';
import { ApiError } from '../api.js';

/* --------- Se já estiver logado, redireciona --------- */
if (Auth.isAuthenticated()) {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  window.location.href = returnTo || '/pages/dashboard.html';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(form, name, message) {
  const field = form.querySelector(`[data-field="${name}"]`);
  if (!field) return;
  const err = field.querySelector('[data-error]');
  if (err && message) err.textContent = message;
  field.classList.add('has-error');
}

function clearFieldError(form, name) {
  const field = form.querySelector(`[data-field="${name}"]`);
  if (field) field.classList.remove('has-error');
}

function clearAllErrors(form) {
  form.querySelectorAll('[data-field]').forEach((f) => f.classList.remove('has-error'));
}

function setLoading(btn, loading, loadingLabel = 'Aguarde...') {
  if (!btn) return;
  const label = btn.querySelector('[data-label]');
  const icon = btn.querySelector('[data-icon]');
  if (loading) {
    btn.disabled = true;
    if (label && !btn.dataset.originalLabel) btn.dataset.originalLabel = label.textContent;
    if (label) label.textContent = loadingLabel;
    if (icon) icon.outerHTML = '<span class="spinner spinner--sm" data-icon></span>';
  } else {
    btn.disabled = false;
    if (label && btn.dataset.originalLabel) label.textContent = btn.dataset.originalLabel;
    const spinner = btn.querySelector('.spinner');
    if (spinner) spinner.outerHTML = '<iconify-icon icon="lucide:arrow-right" data-icon></iconify-icon>';
  }
}

/* --------- LOGIN --------- */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(loginForm);

    const data = new FormData(loginForm);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');

    let valid = true;
    if (!EMAIL_REGEX.test(email)) { setFieldError(loginForm, 'email', 'Informe um e-mail válido.'); valid = false; }
    if (password.length < 6) { setFieldError(loginForm, 'password', 'Senha deve ter no mínimo 6 caracteres.'); valid = false; }
    if (!valid) return;

    const btn = document.getElementById('submit-btn');
    setLoading(btn, true, 'Entrando...');
    try {
      const user = await Auth.login(email, password);
      toast(`Bem-vindo, ${user.name.split(' ')[0]}!`, { type: 'success' });
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');
      setTimeout(() => { window.location.href = returnTo || '/pages/dashboard.html'; }, 500);
    } catch (err) {
      setLoading(btn, false);
      if (err instanceof ApiError && err.status === 401) {
        toast('E-mail ou senha inválidos.', { type: 'error' });
        setFieldError(loginForm, 'password', 'Verifique seus dados e tente novamente.');
      } else {
        toast(err.message || 'Não foi possível entrar.', { type: 'error' });
      }
    }
  });

  loginForm.querySelectorAll('input').forEach((inp) => {
    inp.addEventListener('input', () => clearFieldError(loginForm, inp.name));
  });
}

/* --------- REGISTER --------- */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(registerForm);

    const data = new FormData(registerForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const university = String(data.get('university') || '').trim();
    const course = String(data.get('course') || '').trim();

    let valid = true;
    if (name.length < 2) { setFieldError(registerForm, 'name', 'Nome inválido.'); valid = false; }
    if (!EMAIL_REGEX.test(email)) { setFieldError(registerForm, 'email', 'E-mail inválido.'); valid = false; }
    if (password.length < 6) { setFieldError(registerForm, 'password', 'Senha muito curta (mínimo 6).'); valid = false; }
    if (!valid) return;

    const btn = document.getElementById('submit-btn');
    setLoading(btn, true, 'Criando conta...');
    try {
      const user = await Auth.register({ name, email, password, university, course });
      toast(`Bem-vindo à EcoCampus, ${escapeHtml(user.name.split(' ')[0])}!`, { type: 'success' });
      setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 500);
    } catch (err) {
      setLoading(btn, false);
      if (err instanceof ApiError && err.status === 422) {
        toast(err.message || 'Dados inválidos.', { type: 'error' });
        if (err.message && err.message.toLowerCase().includes('e-mail')) {
          setFieldError(registerForm, 'email', err.message);
        }
      } else {
        toast(err.message || 'Não foi possível criar a conta.', { type: 'error' });
      }
    }
  });

  registerForm.querySelectorAll('input').forEach((inp) => {
    inp.addEventListener('input', () => clearFieldError(registerForm, inp.name));
  });
}
