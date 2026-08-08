'use strict';

const { DB_DRIVER, DB_PATH_SQLITE, DB_PATH_JSON } = require('../../config/env');

/**
 * Instancia a camada de persistência conforme DB_DRIVER.
 *
 * Regras:
 *   1. Se DB_DRIVER === 'json' → usa JSON File.
 *   2. Se DB_DRIVER === 'sqlite' (default) → tenta SQLite.
 *      - Se `better-sqlite3` não estiver instalado (ex.: Node muito novo
 *        sem prebuild + sem toolchain nativo local), cai automaticamente
 *        para JSON com um warning. Isso permite rodar o projeto localmente
 *        sem instalar Visual Studio Build Tools no Windows.
 *
 * Retorna { userRepository, adRepository, driver, filePath }.
 */
function buildPersistence() {
  const wantsSqlite = DB_DRIVER !== 'json';

  if (wantsSqlite) {
    try {
      const SqliteDatabase = require('./SqliteDatabase');
      const SqliteAdRepository = require('./SqliteAdRepository');
      const SqliteUserRepository = require('./SqliteUserRepository');
      const db = new SqliteDatabase(DB_PATH_SQLITE);
      return {
        userRepository: new SqliteUserRepository(db),
        adRepository: new SqliteAdRepository(db),
        driver: 'sqlite',
        filePath: DB_PATH_SQLITE
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        `[db] SQLite indisponível (${err.code || err.message}). ` +
        `Caindo para JSON File. Para forçar SQLite, instale 'better-sqlite3' ` +
        `manualmente ou defina DB_DRIVER=json para silenciar este aviso.`
      );
    }
  }

  const JsonDatabase = require('./JsonDatabase');
  const AdRepository = require('./AdRepository');
  const UserRepository = require('./UserRepository');
  const db = new JsonDatabase(DB_PATH_JSON);
  return {
    userRepository: new UserRepository(db),
    adRepository: new AdRepository(db),
    driver: 'json',
    filePath: DB_PATH_JSON
  };
}

module.exports = buildPersistence;
