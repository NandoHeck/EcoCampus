'use strict';

const NotFoundError = require('../../../shared/errors/NotFoundError');
const UnauthorizedError = require('../../../shared/errors/UnauthorizedError');

class DeleteAd {
  constructor({ adRepository }) {
    this.adRepository = adRepository;
  }

  async execute(id, { requesterId } = {}) {
    const existing = await this.adRepository.findById(id);
    if (!existing) throw new NotFoundError('Anúncio não encontrado.');
    if (requesterId && existing.userId !== requesterId) {
      throw new UnauthorizedError('Você não pode excluir este anúncio.');
    }
    await this.adRepository.delete(id);
    return { id };
  }
}

module.exports = DeleteAd;
