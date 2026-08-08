'use strict';

const IUserRepository = require('../../domain/repositories/IUserRepository');
const User = require('../../domain/entities/User');

class SqliteUserRepository extends IUserRepository {
  constructor(db) {
    super();
    this.db = db.raw();
    this._prepare();
  }

  _prepare() {
    this.stmts = {
      insertUser: this.db.prepare(`
        INSERT INTO users (id, name, email, password, university, course, avatar, created_at)
        VALUES (@id, @name, @email, @password, @university, @course, @avatar, @createdAt)
      `),
      findById: this.db.prepare('SELECT * FROM users WHERE id = ?'),
      findByEmail: this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)'),
      listFavIds: this.db.prepare('SELECT ad_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC'),
      addFav: this.db.prepare('INSERT OR IGNORE INTO favorites (user_id, ad_id, created_at) VALUES (?, ?, ?)'),
      removeFav: this.db.prepare('DELETE FROM favorites WHERE user_id = ? AND ad_id = ?')
    };
  }

  _rowToUser(row) {
    if (!row) return null;
    const favorites = this.stmts.listFavIds.all(row.id).map((r) => r.ad_id);
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      university: row.university,
      course: row.course,
      avatar: row.avatar,
      favorites,
      createdAt: row.created_at
    });
  }

  async findById(id) {
    return this._rowToUser(this.stmts.findById.get(id));
  }

  async findByEmail(email) {
    if (!email) return null;
    return this._rowToUser(this.stmts.findByEmail.get(String(email)));
  }

  async create(user) {
    this.stmts.insertUser.run({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      university: user.university || '',
      course: user.course || '',
      avatar: user.avatar || '',
      createdAt: user.createdAt
    });
    return user;
  }

  async update(id, partial) {
    const existing = this.stmts.findById.get(id);
    if (!existing) return null;

    const allowed = ['name', 'email', 'password', 'university', 'course', 'avatar'];
    const sets = [];
    const params = { id };
    for (const [key, val] of Object.entries(partial)) {
      if (val === undefined || !allowed.includes(key)) continue;
      sets.push(`${key} = @${key}`);
      params[key] = val;
    }
    if (sets.length === 0) return this._rowToUser(existing);

    this.db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(params);
    return this._rowToUser(this.stmts.findById.get(id));
  }

  async addFavorite(userId, adId) {
    const user = this.stmts.findById.get(userId);
    if (!user) return null;
    this.stmts.addFav.run(userId, adId, new Date().toISOString());
    return this.stmts.listFavIds.all(userId).map((r) => r.ad_id);
  }

  async removeFavorite(userId, adId) {
    const user = this.stmts.findById.get(userId);
    if (!user) return null;
    this.stmts.removeFav.run(userId, adId);
    return this.stmts.listFavIds.all(userId).map((r) => r.ad_id);
  }
}

module.exports = SqliteUserRepository;
