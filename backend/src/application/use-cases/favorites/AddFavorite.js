'use strict';

const NotFoundError = require('../../../shared/errors/NotFoundError');

class AddFavorite {
  constructor({ userRepository, adRepository }) {
    this.userRepository = userRepository;
    this.adRepository = adRepository;
  }

  async execute(userId, adId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuário não encontrado.');
    const ad = await this.adRepository.findById(adId);
    if (!ad) throw new NotFoundError('Anúncio não encontrado.');
    return this.userRepository.addFavorite(userId, adId);
  }
}

module.exports = AddFavorite;
