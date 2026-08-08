/**
 * storage.js — Wrapper seguro sobre localStorage (com fallback in-memory).
 */

const memoryStore = new Map();

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const Storage = {
  get(key, fallback = null) {
    try {
      if (!hasWindow()) return memoryStore.has(key) ? memoryStore.get(key) : fallback;
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      try { return JSON.parse(raw); } catch { return raw; }
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (!hasWindow()) { memoryStore.set(key, value); return; }
      window.localStorage.setItem(key, serialized);
    } catch {
      memoryStore.set(key, value);
    }
  },
  remove(key) {
    try {
      if (!hasWindow()) { memoryStore.delete(key); return; }
      window.localStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
  },
  clear() {
    try {
      if (!hasWindow()) { memoryStore.clear(); return; }
      window.localStorage.clear();
    } catch {
      memoryStore.clear();
    }
  }
};

export default Storage;
