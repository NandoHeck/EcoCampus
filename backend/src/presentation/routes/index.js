'use strict';

const { Router } = require('express');
const adRoutes = require('./adRoutes');
const userRoutes = require('./userRoutes');

function buildRouter(deps) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({
      name: 'EcoCampus API',
      version: '1.0.0',
      docs: '/api/health',
      endpoints: [
        'GET /api/health',
        'POST /api/users/register',
        'POST /api/users/login',
        'GET /api/users/:id',
        'GET /api/users/:id/ads',
        'GET /api/users/:id/favorites',
        'GET /api/ads',
        'POST /api/ads',
        'GET /api/ads/:id',
        'PUT /api/ads/:id',
        'DELETE /api/ads/:id'
      ]
    });
  });

  router.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

  router.use('/ads', adRoutes(deps));
  router.use('/users', userRoutes(deps));

  return router;
}

module.exports = buildRouter;
