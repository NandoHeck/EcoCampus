/**
 * auth.js — Gerência de sessão e helpers de autenticação.
 */

import Storage from './storage.js';
import api from './api.js';

const SESSION_KEY = 'ecocampus:session';

export const Auth = {
  getSession() {
    return Storage.get(SESSION_KEY, null);
  },
  getUser() {
    const s = this.getSession();
    return s && s.user ? s.user : null;
  },
  getToken() {
    const s = this.getSession();
    return s && s.token ? s.token : null;
  },
  isAuthenticated() {
    return Boolean(this.getToken());
  },
  saveSession({ user, token }) {
    Storage.set(SESSION_KEY, { user, token });
  },
  updateUser(partial) {
    const s = this.getSession();
    if (!s) return;
    Storage.set(SESSION_KEY, { ...s, user: { ...s.user, ...partial } });
  },
  logout() {
    Storage.remove(SESSION_KEY);
  },

  async login(email, password) {
    const { user, token } = await api.login({ email, password });
    this.saveSession({ user, token });
    return user;
  },
  async register(payload) {
    const { user, token } = await api.register(payload);
    this.saveSession({ user, token });
    return user;
  },

  redirectToLogin() {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/pages/login.html?returnTo=${returnTo}`;
  },
  requireAuth() {
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }
    return true;
  }
};

export default Auth;
