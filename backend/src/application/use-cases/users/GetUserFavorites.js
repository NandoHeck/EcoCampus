'use strict';

const NotFoundError = require('../../../shared/errors/NotFoundError');

class GetUserFavorites {
  constructor({ adRepository, userRepository }) {
    this.adRepository = adRepository;
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuário não encontrado.');
    const favIds = user.favorites || [];
    if (favIds.length === 0) return [];
    const ads = await this.adRepository.list();
    return ads.filter((a) => favIds.includes(a.id));
  }
}

module.exports = GetUserFavorites;
