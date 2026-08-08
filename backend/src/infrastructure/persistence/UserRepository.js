'use strict';

const IUserRepository = require('../../domain/repositories/IUserRepository');
const User = require('../../domain/entities/User');

class UserRepository extends IUserRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  _hydrate(raw) {
    return new User(raw);
  }

  async findById(id) {
    const { users } = await this.db.read();
    const found = users.find((u) => u.id === id);
    return found ? this._hydrate(found) : null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const { users } = await this.db.read();
    const found = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    return found ? this._hydrate(found) : null;
  }

  async create(user) {
    return this.db.mutate((data) => {
      data.users.push({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        university: user.university,
        course: user.course,
        avatar: user.avatar,
        favorites: user.favorites,
        createdAt: user.createdAt
      });
      return user;
    });
  }

  async update(id, partial) {
    return this.db.mutate((data) => {
      const idx = data.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      data.users[idx] = { ...data.users[idx], ...partial, id };
      return this._hydrate(data.users[idx]);
    });
  }

  async addFavorite(userId, adId) {
    return this.db.mutate((data) => {
      const user = data.users.find((u) => u.id === userId);
      if (!user) return null;
      if (!Array.isArray(user.favorites)) user.favorites = [];
      if (!user.favorites.includes(adId)) user.favorites.push(adId);
      return user.favorites;
    });
  }

  async removeFavorite(userId, adId) {
    return this.db.mutate((data) => {
      const user = data.users.find((u) => u.id === userId);
      if (!user) return null;
      if (!Array.isArray(user.favorites)) user.favorites = [];
      user.favorites = user.favorites.filter((id) => id !== adId);
      return user.favorites;
    });
  }
}

module.exports = UserRepository;
