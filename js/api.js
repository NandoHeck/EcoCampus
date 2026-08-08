/**
 * api.js — Cliente HTTP baseado em Fetch API.
 */

import Storage from './storage.js';

const BACKEND_PORT = '3333';

/**
 * Ordem de resolução da API_BASE:
 * 1. window.__ECOCAMPUS_API__       → definido inline no HTML (produção)
 * 2. <meta name="ecocampus-api" ..> → configurável sem editar JS
 * 3. Se hostname == localhost/127.  → aponta para :3333 (dev local)
 * 4. Fallback: mesma origem + /api  → assume backend + frontend no mesmo host
 */
const DEFAULT_BASE = (() => {
  if (typeof window === 'undefined') return `http://localhost:${BACKEND_PORT}/api`;

  const meta = document.querySelector('meta[name="ecocampus-api"]');
  if (meta && meta.content) return meta.content.replace(/\/$/, '');

  const { protocol, hostname, port, origin } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

  if (isLocal) {
    if (port === BACKEND_PORT) return `${origin}/api`;
    const proto = protocol.startsWith('http') ? protocol : 'http:';
    return `${proto}//${hostname || 'localhost'}:${BACKEND_PORT}/api`;
  }

  // Produção: mesma origem + /api (útil se frontend e backend estão sob o mesmo domínio)
  return `${origin}/api`;
})();

export const API_BASE = (typeof window !== 'undefined' && window.__ECOCAMPUS_API__) || DEFAULT_BASE;

class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getAuthToken() {
  const session = Storage.get('ecocampus:session');
  return session && session.token ? session.token : null;
}

async function request(path, { method = 'GET', body, headers = {}, auth = 'auto', query } = {}) {
  const url = new URL(API_BASE + path, window.location.origin);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const opts = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers
    }
  };

  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  if (auth === true || (auth === 'auto' && getAuthToken())) {
    const token = getAuthToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url.toString(), opts);
  } catch (err) {
    throw new ApiError('Falha de rede. Verifique sua conexão.', 0, 'NETWORK_ERROR', err);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const errPayload = (payload && payload.error) || {};
    throw new ApiError(
      errPayload.message || `Erro HTTP ${res.status}`,
      res.status,
      errPayload.code || 'HTTP_ERROR',
      errPayload.details || null
    );
  }

  return payload && payload.data !== undefined ? payload.data : payload;
}

export const api = {
  request,

  // ===== Auth =====
  register: (data) => request('/users/register', { method: 'POST', body: data }),
  login: (data) => request('/users/login', { method: 'POST', body: data }),
  me: () => request('/users/me', { auth: true }),

  // ===== Users =====
  getUser: (id) => request(`/users/${encodeURIComponent(id)}`),
  updateUser: (id, data) => request(`/users/${encodeURIComponent(id)}`, { method: 'PUT', body: data, auth: true }),
  getUserAds: (id) => request(`/users/${encodeURIComponent(id)}/ads`),
  getUserFavorites: (id) => request(`/users/${encodeURIComponent(id)}/favorites`),
  addFavorite: (userId, adId) =>
    request(`/users/${encodeURIComponent(userId)}/favorites`, { method: 'POST', body: { adId }, auth: true }),
  removeFavorite: (userId, adId) =>
    request(`/users/${encodeURIComponent(userId)}/favorites/${encodeURIComponent(adId)}`, {
      method: 'DELETE',
      auth: true
    }),

  // ===== Ads =====
  listAds: (filters = {}) => request('/ads', { query: filters }),
  getAd: (id) => request(`/ads/${encodeURIComponent(id)}`),
  createAd: (data) => request('/ads', { method: 'POST', body: data, auth: true }),
  updateAd: (id, data) => request(`/ads/${encodeURIComponent(id)}`, { method: 'PUT', body: data, auth: true }),
  deleteAd: (id) => request(`/ads/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
};

export { ApiError };
export default api;
