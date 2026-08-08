'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { startTestServer, apiCall } = require('./helpers/testServer');

describe('API /users/:id/favorites', () => {
  let server;
  let baseUrl;
  let alice, adId;

  before(async () => {
    server = await startTestServer();
    baseUrl = server.baseUrl;

    const reg = await apiCall(baseUrl, 'POST', '/api/users/register', {
      body: { name: 'Alice', email: 'alice@fav.test', password: 'senha123' }
    });
    alice = reg.body.data;

    const created = await apiCall(baseUrl, 'POST', '/api/ads', {
      token: alice.token,
      body: {
        title: 'Item favoritável',
        description: 'Este anúncio será favoritado.',
        category: 'Outros',
        type: 'sale',
        price: 10
      }
    });
    adId = created.body.data.id;
  });

  after(async () => {
    await server.close();
  });

  test('lista favoritos vazia inicialmente', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', `/api/users/${alice.user.id}/favorites`);
    assert.equal(status, 200);
    assert.deepEqual(body.data, []);
  });

  test('POST /favorites sem token → 401', async () => {
    const { status } = await apiCall(baseUrl, 'POST', `/api/users/${alice.user.id}/favorites`, {
      body: { adId }
    });
    assert.equal(status, 401);
  });

  test('POST /favorites com token → adiciona', async () => {
    const { status, body } = await apiCall(baseUrl, 'POST', `/api/users/${alice.user.id}/favorites`, {
      token: alice.token,
      body: { adId }
    });
    assert.equal(status, 201);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.includes(adId));
  });

  test('GET /favorites agora retorna o anúncio', async () => {
    const { status, body } = await apiCall(baseUrl, 'GET', `/api/users/${alice.user.id}/favorites`);
    assert.equal(status, 200);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].id, adId);
  });

  test('POST /favorites com adId inexistente → 404', async () => {
    const { status } = await apiCall(baseUrl, 'POST', `/api/users/${alice.user.id}/favorites`, {
      token: alice.token,
      body: { adId: 'ad_naoexiste' }
    });
    assert.equal(status, 404);
  });

  test('DELETE /favorites/:adId remove com sucesso', async () => {
    const { status, body } = await apiCall(
      baseUrl,
      'DELETE',
      `/api/users/${alice.user.id}/favorites/${adId}`,
      { token: alice.token }
    );
    assert.equal(status, 200);
    assert.ok(!body.data.includes(adId));

    const check = await apiCall(baseUrl, 'GET', `/api/users/${alice.user.id}/favorites`);
    assert.deepEqual(check.body.data, []);
  });
});
