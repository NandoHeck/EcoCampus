'use strict';

const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

module.exports = {
  PORT: Number(process.env.PORT) || 3333,
  HOST: process.env.HOST || '0.0.0.0',

  // Driver de persistência: 'sqlite' (default) ou 'json' (fallback).
  DB_DRIVER: (process.env.DB_DRIVER || 'sqlite').toLowerCase(),

  // Caminhos dos arquivos (relativos ao backend/).
  DB_PATH_SQLITE: process.env.DB_PATH_SQLITE || path.join(DATA_DIR, 'ecocampus.db'),
  DB_PATH_JSON: process.env.DB_PATH_JSON || path.join(DATA_DIR, 'db.json'),

  // Retro-compatibilidade: alguns módulos ainda importam DB_PATH.
  DB_PATH: process.env.DB_PATH_JSON || path.join(DATA_DIR, 'db.json'),

  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  PASSWORD_SALT: process.env.PASSWORD_SALT || 'ecocampus_salt_v1'
};
