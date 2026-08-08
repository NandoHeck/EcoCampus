'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    university  TEXT DEFAULT '',
    course      TEXT DEFAULT '',
    avatar      TEXT DEFAULT '',
    created_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS ads (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    category    TEXT NOT NULL,
    price       REAL NOT NULL DEFAULT 0,
    type        TEXT NOT NULL CHECK (type IN ('sale', 'donation')),
    image_url   TEXT DEFAULT '',
    advertiser  TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    views       INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_ads_user     ON ads(user_id);
  CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category);
  CREATE INDEX IF NOT EXISTS idx_ads_type     ON ads(type);
  CREATE INDEX IF NOT EXISTS idx_ads_created  ON ads(created_at DESC);

  CREATE TABLE IF NOT EXISTS favorites (
    user_id    TEXT NOT NULL,
    ad_id      TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, ad_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ad_id)   REFERENCES ads(id)   ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
`;

class SqliteDatabase {
  constructor(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.db = new Database(filePath);
    this.db.exec(SCHEMA);
  }

  raw() { return this.db; }

  close() { this.db.close(); }
}

module.exports = SqliteDatabase;
