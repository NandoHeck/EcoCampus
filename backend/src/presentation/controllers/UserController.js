'use strict';

const NotFoundError = require('../../shared/errors/NotFoundError');

class UserController {
  constructor({
    registerUser,
    loginUser,
    getUserAds,
    getUserFavorites,
    addFavorite,
    removeFavorite,
    userRepository
  }) {
    this.registerUser = registerUser;
    this.loginUser = loginUser;
    this.getUserAds = getUserAds;
    this.getUserFavorites = getUserFavorites;
    this.addFavorite = addFavorite;
    this.removeFavorite = removeFavorite;
    this.userRepository = userRepository;
  }

  register = async (req, res, next) => {
    try {
      const result = await this.registerUser.execute(req.body);
      res.status(201).json({ data: result });
    } catch (err) { next(err); }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.json({ data: result });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const user = await this.userRepository.findById(req.params.id);
      if (!user) throw new NotFoundError('Usuário não encontrado.');
      res.json({ data: user.toPublicJSON() });
    } catch (err) { next(err); }
  };

  updateProfile = async (req, res, next) => {
    try {
      const targetId = req.params.id;
      if (req.user && req.user.id !== targetId) {
        return res.status(403).json({ error: { message: 'Acesso negado.', code: 'FORBIDDEN' } });
      }
      const allowed = ['name', 'university', 'course', 'avatar'];
      const partial = {};
      allowed.forEach((k) => {
        if (req.body[k] !== undefined) partial[k] = String(req.body[k]).slice(0, 200);
      });
      const updated = await this.userRepository.update(targetId, partial);
      if (!updated) throw new NotFoundError('Usuário não encontrado.');
      res.json({ data: updated.toPublicJSON() });
    } catch (err) { next(err); }
  };

  me = async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: { message: 'Não autenticado.' } });
      res.json({ data: req.user });
    } catch (err) { next(err); }
  };

  listUserAds = async (req, res, next) => {
    try {
      const ads = await this.getUserAds.execute(req.params.id);
      res.json({ data: ads, total: ads.length });
    } catch (err) { next(err); }
  };

  listUserFavorites = async (req, res, next) => {
    try {
      const ads = await this.getUserFavorites.execute(req.params.id);
      res.json({ data: ads, total: ads.length });
    } catch (err) { next(err); }
  };

  addFav = async (req, res, next) => {
    try {
      const favorites = await this.addFavorite.execute(req.params.id, req.body.adId);
      res.status(201).json({ data: favorites });
    } catch (err) { next(err); }
  };

  removeFav = async (req, res, next) => {
    try {
      const favorites = await this.removeFavorite.execute(req.params.id, req.params.adId);
      res.json({ data: favorites });
    } catch (err) { next(err); }
  };
}

module.exports = UserController;
