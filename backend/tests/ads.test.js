'use strict';

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { startTestServer, apiCall } = require('./helpers/testServer');

describe('API /ads (CRUD + autorização)', () => {
  let server;
  let baseUrl;
  let aliceToken, aliceId;
  let bobToken, bobId;

  before(async () => {
    server = await startTestServer();
    baseUrl = server.baseUrl;

    const a = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Alice', email: 'alice@ads.test', password: 'senha123' }
    });
    aliceToken = a.body.data.token;
    aliceId = a.body.data.user.id;

    const b = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Bob', email: 'bob@ads.test', password: 'senha123' }
    });
    bobToken = b.body.data.token;
    bobId = b.body.data.user.id;
  });

  after(async () => {
    await server.close();
  });

  test('POST /api/ads sem token → 401', async () => {
    const { status } = await apiCall(baseUrl, 'POST', '/api/ads', {
      body: { title: 'X', description: 'Sem token', category: 'Livros', type: 'sale', price: 10 }
    });
    assert.equal(status, 401);
  });

  test('POST /api/ads com dados inválidos → 422', async () => {
    // título curto
    const { status } = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: { title: 'X', description: 'Descrição válida aqui.', category: 'Livros', type: 'sale', price: 10 }
    });
    assert.equal(status, 422);
  });

  test('POST /api/ads cria anúncio com sucesso (201)', async () => {
    const { status, body } = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: {
        title: 'Cálculo Vol. 1',
        description: 'Livro em ótimo estado, apenas anotações a lápis.',
        category: 'Livros',
        type: 'sale',
        price: 65
      }
    });
    assert.equal(status, 201);
    assert.ok(body.data.id);
    assert.equal(body.data.userId, aliceId);
    assert.equal(body.data.advertiser, 'Alice');
    assert.equal(body.data.price, 65);
    assert.equal(body.data.views, 0);
  });

  test('POST /api/ads tipo=donation força preço=0', async () => {
    const { status, body } = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: {
        title: 'Apostila de doação',
        description: 'Apostila para calouros de engenharia.',
        category: 'Apostilas',
        type: 'donation',
        price: 999 // deve ser ignorado
      }
    });
    assert.equal(status, 201);
    assert.equal(body.data.price, 0);
    assert.equal(body.data.type, 'donation');
  });

  test('GET /api/ads lista todos os anúncios', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', '/api/ads');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 2);
    assert.equal(typeof body.total, 'number');
  });

  test('GET /api/ads?type=donation filtra por tipo', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', '/api/ads?type=donation');
    assert.equal(status, 200);
    assert.ok(body.data.every((a) => a.type === 'donation'));
  });

  test('GET /api/ads?category=Livros filtra por categoria (case-insensitive)', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', '/api/ads?category=livros');
    assert.equal(status, 200);
    assert.ok(body.data.every((a) => a.category.toLowerCase() === 'livros'));
  });

  test('GET /api/ads?search=cálculo faz busca full-text simples', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', '/api/ads?search=cálculo');
    assert.equal(status, 200);
    assert.ok(body.data.length >= 1);
    assert.ok(body.data.some((a) => a.title.toLowerCase().includes('cálculo')));
  });

  test('GET /api/ads/:id incrementa views a cada acesso', async () => {
    const created = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: { title: 'Views Test', description: 'Contando views.', category: 'Outros', type: 'sale', price: 1 }
    });
    const id = created.body.data.id;

    const r1 = await apiCall(baseUrl, 'GET', `/api/ads/${id}`);
    const r2 = await apiCall(baseUrl, 'GET', `/api/ads/${id}`);
    assert.equal(r2.body.data.views, r1.body.data.views + 1);
  });

  test('GET /api/ads/:id inexistente → 404', async () => {
    const { status } = await apiCall(baseUrl, 'GET', '/api/ads/ad_naoexiste');
    assert.equal(status, 404);
  });

  test('PUT /api/ads/:id — dono pode editar', async () => {
    const created = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: { title: 'Título original', description: 'Descrição válida.', category: 'Outros', type: 'sale', price: 10 }
    });
    const id = created.body.data.id;

    const { status, body } = await apiCall(baseUrl, 'PUT', `/api/ads/${id}`, {
      token: aliceToken,
      body: { title: 'Título editado', price: 20 }
    });
    assert.equal(status, 200);
    assert.equal(body.data.title, 'Título editado');
    assert.equal(body.data.price, 20);
  });

  test('PUT /api/ads/:id — outro usuário NÃO pode editar (401)', async () => {
    const created = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: { title: 'De Alice', description: 'Só Alice edita.', category: 'Outros', type: 'sale', price: 5 }
    });
    const id = created.body.data.id;

    const { status } = await apiCall(baseUrl, 'PUT', `/api/ads/${id}`, {
      token: bobToken,
      body: { title: 'Hacker' }
    });
    assert.equal(status, 401);
  });

  test('DELETE /api/ads/:id — outro usuário NÃO pode deletar (401)', async () => {
    const created = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: { title: 'Não delete', description: 'Não delete isso.', category: 'Outros', type: 'sale', price: 5 }
    });
    const id = created.body.data.id;

    const { status } = await apiCall(baseUrl, 'DELETE', `/api/ads/${id}`, { token: bobToken });
    assert.equal(status, 401);

    const check = await apiCall(baseUrl, 'GET', `/api/ads/${id}`);
    assert.equal(check.status, 200, 'anúncio deve continuar existindo');
  });

  test('DELETE /api/ads/:id — dono deleta com sucesso (204)', async () => {
    const created = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: aliceToken,
      body: { title: 'Para deletar', description: 'Vou embora.', category: 'Outros', type: 'sale', price: 5 }
    });
    const id = created.body.data.id;

    const { status } = await apiCall(baseUrl, 'DELETE', `/api/ads/${id}`, { token: aliceToken });
    assert.equal(status, 204);

    const check = await apiCall(baseUrl, 'GET', `/api/ads/${id}`);
    assert.equal(check.status, 404);
  });

  test('GET /api/users/:id/ads retorna só os anúncios do usuário', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', `/api/users/${bobId}/ads`);
    assert.equal(status, 200);
    assert.ok(body.data.every((a) => a.userId === bobId));
  });
});
