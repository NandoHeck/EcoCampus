'use strict';

const path = require('path');

module.exports = {
  PORT: Number(process.env.PORT) || 3333,
  HOST: process.env.HOST || '0.0.0.0',
  DB_PATH: path.resolve(__dirname, '..', '..', 'data', 'db.json'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  PASSWORD_SALT: process.env.PASSWORD_SALT || 'ecocampus_salt_v1'
};
