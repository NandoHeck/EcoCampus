'use strict';

/**
 * Helper para os testes: sobe uma instância do backend em porta aleatória,
 * com persistência em arquivo JSON temporário (isolamento total entre suites).
 * Retorna { baseUrl, close } — sem seed automático.
 */

const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

const JsonDatabase = require('../../src/infrastructure/persistence/JsonDatabase');
const AdRepository = require('../../src/infrastructure/persistence/AdRepository');
const UserRepository = require('../../src/infrastructure/persistence/UserRepository');
const createApp = require('../../src/createApp');

async function startTestServer() {
  const tmpFile = path.join(os.tmpdir(), `ecocampus-test-${crypto.randomBytes(6).toString('hex')}.json`);
  const db = new JsonDatabase(tmpFile);
  const userRepository = new UserRepository(db);
  const adRepository = new AdRepository(db);

  const app = createApp({
    userRepository,
    adRepository,
    corsOrigin: '*',
    enableRateLimit: false,   // desliga rate-limit para não interferir em testes
    enableStatic: false       // não precisa de arquivos estáticos nos testes
  });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function close() {
    await new Promise((resolve) => server.close(resolve));
    try { fs.unlinkSync(tmpFile); } catch { /* ok */ }
  }

  return { baseUrl, close, userRepository, adRepository, tmpFile };
}

/**
 * Wrapper conveniente sobre fetch para testes.
 */
async function apiCall(baseUrl, method, path, { body, token, headers = {} } = {}) {
  const opts = {
    method,
    headers: { Accept: 'application/json', ...headers }
  };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(baseUrl + path, opts);
  let payload = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    payload = await res.json().catch(() => null);
  } else {
    payload = await res.text().catch(() => null);
  }
  return { status: res.status, headers: res.headers, body: payload };
}

module.exports = { startTestServer, apiCall };
