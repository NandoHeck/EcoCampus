'use strict';

const NotFoundError = require('../../../shared/errors/NotFoundError');

class GetAd {
  constructor({ adRepository }) {
    this.adRepository = adRepository;
  }

  async execute(id, { incrementViews = false } = {}) {
    const ad = await this.adRepository.findById(id);
    if (!ad) throw new NotFoundError('Anúncio não encontrado.');
    if (incrementViews) {
      await this.adRepository.incrementViews(id);
      ad.views = (ad.views || 0) + 1;
    }
    return ad;
  }
}

module.exports = GetAd;
