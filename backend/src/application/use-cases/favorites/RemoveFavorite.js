'use strict';

const NotFoundError = require('../../../shared/errors/NotFoundError');

class RemoveFavorite {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId, adId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuário não encontrado.');
    return this.userRepository.removeFavorite(userId, adId);
  }
}

module.exports = RemoveFavorite;
