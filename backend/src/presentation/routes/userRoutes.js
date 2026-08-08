'use strict';

const { Router } = require('express');

function userRoutes({ userController, authRequired, authOptional }) {
  const router = Router();

  router.post('/register', userController.register);
  router.post('/login', userController.login);
  router.get('/me', authRequired, userController.me);

  router.get('/:id', authOptional, userController.getById);
  router.put('/:id', authRequired, userController.updateProfile);

  router.get('/:id/ads', authOptional, userController.listUserAds);
  router.get('/:id/favorites', authOptional, userController.listUserFavorites);
  router.post('/:id/favorites', authRequired, userController.addFav);
  router.delete('/:id/favorites/:adId', authRequired, userController.removeFav);

  return router;
}

module.exports = userRoutes;
