'use strict';

const NotFoundError = require('../../../shared/errors/NotFoundError');

class GetUserAds {
  constructor({ adRepository, userRepository }) {
    this.adRepository = adRepository;
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuário não encontrado.');
    return this.adRepository.listByUser(userId);
  }
}

module.exports = GetUserAds;
