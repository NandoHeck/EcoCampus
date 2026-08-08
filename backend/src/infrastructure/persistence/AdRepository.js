'use strict';

const IAdRepository = require('../../domain/repositories/IAdRepository');
const { Ad } = require('../../domain/entities/Ad');

class AdRepository extends IAdRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  _hydrate(raw) {
    return new Ad(raw);
  }

  async list(filters = {}) {
    const { ads } = await this.db.read();
    let result = ads.map((a) => this._hydrate(a));

    if (filters.category) {
      const cat = String(filters.category).toLowerCase();
      result = result.filter((a) => a.category.toLowerCase() === cat);
    }
    if (filters.type) {
      result = result.filter((a) => a.type === filters.type);
    }
    if (filters.search) {
      const term = String(filters.search).toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.category.toLowerCase().includes(term)
      );
    }
    if (filters.userId) {
      result = result.filter((a) => a.userId === filters.userId);
    }

    const sortBy = filters.sortBy || 'recent';
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    if (filters.limit) {
      result = result.slice(0, Number(filters.limit));
    }
    return result.map((a) => a.toJSON());
  }

  async findById(id) {
    const { ads } = await this.db.read();
    const found = ads.find((a) => a.id === id);
    return found ? this._hydrate(found).toJSON() : null;
  }

  async listByUser(userId) {
    return this.list({ userId });
  }

  async create(ad) {
    return this.db.mutate((data) => {
      data.ads.push(ad.toJSON());
      return ad.toJSON();
    });
  }

  async update(id, partial) {
    return this.db.mutate((data) => {
      const idx = data.ads.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      const merged = { ...data.ads[idx], ...partial, id };
      if (merged.type === 'donation') merged.price = 0;
      data.ads[idx] = new Ad(merged).toJSON();
      return data.ads[idx];
    });
  }

  async delete(id) {
    return this.db.mutate((data) => {
      const before = data.ads.length;
      data.ads = data.ads.filter((a) => a.id !== id);
      data.users.forEach((u) => {
        if (Array.isArray(u.favorites)) {
          u.favorites = u.favorites.filter((favId) => favId !== id);
        }
      });
      return data.ads.length < before;
    });
  }

  async incrementViews(id) {
    return this.db.mutate((data) => {
      const found = data.ads.find((a) => a.id === id);
      if (!found) return null;
      found.views = (Number(found.views) || 0) + 1;
      return found;
    });
  }
}

module.exports = AdRepository;
