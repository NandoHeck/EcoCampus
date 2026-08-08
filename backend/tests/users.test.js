'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { startTestServer, apiCall } = require('./helpers/testServer');

describe('API /users', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = await startTestServer();
    baseUrl = server.baseUrl;
  });

  after(async () => {
    await server.close();
  });

  test('GET /api/health responde 200 e status ok', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', '/api/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
    assert.ok(typeof body.ts === 'string');
  });

  test('POST /api/users/register cria usuário e retorna token', async () => {
    const { status, body } = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Alice Test', email: 'alice@test.com', password: 'senha123' }
    });
    assert.equal(status, 201);
    assert.ok(body.data);
    assert.equal(body.data.user.email, 'alice@test.com');
    assert.equal(body.data.user.avatar, '', 'novo usuário deve começar sem foto');
    assert.ok(!('password' in body.data.user), 'nunca vazar senha');
    assert.ok(body.data.token, 'deve retornar token');
    assert.match(body.data.token, /^usr_[a-f0-9]+\..+$/, 'token deve ter formato <userId>.<hash>');
  });

  test('POST /api/users/register rejeita email duplicado (422)', async () => {
    await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Bob', email: 'dup@test.com', password: 'senha123' }
    });
    const { status, body } = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Bob2', email: 'dup@test.com', password: 'senha456' }
    });
    assert.equal(status, 422);
    assert.ok(body.error);
    assert.match(body.error.message.toLowerCase(), /e-mail|email/);
  });

  test('POST /api/users/register rejeita senha curta (422)', async () => {
    const { status, body } = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'X', email: 'x@test.com', password: '12' }
    });
    assert.equal(status, 422);
    assert.ok(body.error);
  });

  test('POST /api/users/login autentica e devolve token', async () => {
    await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Carol', email: 'carol@test.com', password: 'senha123' }
    });
    const { status, body } = await apiCall(baseUrl, 'POST', '/api/users/login', {
      body: { email: 'carol@test.com', password: 'senha123' }
    });
    assert.equal(status, 200);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, 'carol@test.com');
  });

  test('POST /api/users/login rejeita senha errada (401)', async () => {
    await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Dan', email: 'dan@test.com', password: 'senha123' }
    });
    const { status } = await apiCall(baseUrl, 'POST', '/api/users/login', {
      body: { email: 'dan@test.com', password: 'senha-errada' }
    });
    assert.equal(status, 401);
  });

  test('GET /api/users/me sem token → 401', async () => {
    const { status } = await apiCall(baseUrl, 'GET', '/api/users/me');
    assert.equal(status, 401);
  });

  test('GET /api/users/me com token → devolve usuário logado', async () => {
    const reg = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Eve', email: 'eve@test.com', password: 'senha123' }
    });
    const { status, body } = await apiCall(baseUrl, 'GET', '/api/users/me', {
      token: reg.body.data.token
    });
    assert.equal(status, 200);
    assert.equal(body.data.email, 'eve@test.com');
  });

  test('PUT /api/users/:id atualiza avatar do próprio usuário', async () => {
    const reg = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Foo', email: 'foo@test.com', password: 'senha123' }
    });
    const { user, token } = reg.body.data;

    const { status, body } = await apiCall(baseUrl, 'PUT', `/api/users/${user.id}`, {
      token,
      body: { avatar: 'https://example.com/foo.png', course: 'Física' }
    });
    assert.equal(status, 200);
    assert.equal(body.data.avatar, 'https://example.com/foo.png');
    assert.equal(body.data.course, 'Física');
  });

  test('PUT /api/users/:id sem token → 401', async () => {
    const reg = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Ghi', email: 'ghi@test.com', password: 'senha123' }
    });
    const { status } = await apiCall(baseUrl, 'PUT', `/api/users/${reg.body.data.user.id}`, {
      body: { name: 'Hacker' }
    });
    assert.equal(status, 401);
  });
});
