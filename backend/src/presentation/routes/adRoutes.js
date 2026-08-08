'use strict';

const { Router } = require('express');

function adRoutes({ adController, authOptional, authRequired }) {
  const router = Router();

  router.get('/', authOptional, adController.list);
  router.get('/:id', authOptional, adController.getOne);
  router.post('/', authRequired, adController.create);
  router.put('/:id', authRequired, adController.update);
  router.delete('/:id', authRequired, adController.remove);

  return router;
}

module.exports = adRoutes;
