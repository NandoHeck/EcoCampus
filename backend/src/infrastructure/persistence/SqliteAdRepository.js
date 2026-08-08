'use strict';

const IAdRepository = require('../../domain/repositories/IAdRepository');
const { Ad } = require('../../domain/entities/Ad');

/**
 * Repositório de anúncios sobre SQLite.
 * Mapeia snake_case (DB) ⇄ camelCase (domínio).
 */
class SqliteAdRepository extends IAdRepository {
  constructor(db) {
    super();
    this.db = db.raw();
    this._prepare();
  }

  _prepare() {
    this.stmts = {
      insert: this.db.prepare(`
        INSERT INTO ads (id, title, description, category, price, type,
                         image_url, advertiser, user_id, created_at, views)
        VALUES (@id, @title, @description, @category, @price, @type,
                @imageUrl, @advertiser, @userId, @createdAt, @views)
      `),
      findById: this.db.prepare('SELECT * FROM ads WHERE id = ?'),
      deleteById: this.db.prepare('DELETE FROM ads WHERE id = ?'),
      incrementViews: this.db.prepare('UPDATE ads SET views = views + 1 WHERE id = ?')
    };
  }

  _rowToAd(row) {
    if (!row) return null;
    return new Ad({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      price: row.price,
      type: row.type,
      imageUrl: row.image_url,
      advertiser: row.advertiser,
      userId: row.user_id,
      createdAt: row.created_at,
      views: row.views
    }).toJSON();
  }

  async list(filters = {}) {
    const where = [];
    const params = {};

    if (filters.category) {
      where.push('LOWER(category) = LOWER(@category)');
      params.category = filters.category;
    }
    if (filters.type) {
      where.push('type = @type');
      params.type = filters.type;
    }
    if (filters.search) {
      where.push('(LOWER(title) LIKE @search OR LOWER(description) LIKE @search OR LOWER(category) LIKE @search)');
      params.search = `%${String(filters.search).toLowerCase()}%`;
    }
    if (filters.userId) {
      where.push('user_id = @userId');
      params.userId = filters.userId;
    }

    let orderBy = 'created_at DESC';
    switch (filters.sortBy) {
      case 'views':      orderBy = 'views DESC'; break;
      case 'price-asc':  orderBy = 'price ASC'; break;
      case 'price-desc': orderBy = 'price DESC'; break;
      case 'recent':
      default:           orderBy = 'created_at DESC';
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limitClause = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';

    const sql = `SELECT * FROM ads ${whereClause} ORDER BY ${orderBy} ${limitClause}`;
    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this._rowToAd(r));
  }

  async findById(id) {
    return this._rowToAd(this.stmts.findById.get(id));
  }

  async listByUser(userId) {
    return this.list({ userId });
  }

  async create(ad) {
    const json = ad.toJSON ? ad.toJSON() : ad;
    this.stmts.insert.run(json);
    return json;
  }

  async update(id, partial) {
    const existing = this.stmts.findById.get(id);
    if (!existing) return null;

    // Mapeia camelCase → snake_case
    const map = {
      title: 'title',
      description: 'description',
      category: 'category',
      price: 'price',
      type: 'type',
      imageUrl: 'image_url',
      advertiser: 'advertiser'
    };

    const sets = [];
    const params = { id };
    for (const [key, val] of Object.entries(partial)) {
      if (val === undefined || !map[key]) continue;
      sets.push(`${map[key]} = @${map[key]}`);
      params[map[key]] = val;
    }
    if (sets.length === 0) return this._rowToAd(existing);

    // Se virou doação, força preço = 0
    if (partial.type === 'donation') {
      sets.push('price = 0');
      delete params.price;
    }

    this.db.prepare(`UPDATE ads SET ${sets.join(', ')} WHERE id = @id`).run(params);
    return this._rowToAd(this.stmts.findById.get(id));
  }

  async delete(id) {
    // Favoritos são deletados via ON DELETE CASCADE
    const info = this.stmts.deleteById.run(id);
    return info.changes > 0;
  }

  async incrementViews(id) {
    const info = this.stmts.incrementViews.run(id);
    if (info.changes === 0) return null;
    return this._rowToAd(this.stmts.findById.get(id));
  }
}

module.exports = SqliteAdRepository;
