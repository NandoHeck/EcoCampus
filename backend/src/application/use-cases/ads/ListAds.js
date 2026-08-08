'use strict';

class ListAds {
  constructor({ adRepository }) {
    this.adRepository = adRepository;
  }

  async execute(filters = {}) {
    return this.adRepository.list(filters);
  }
}

module.exports = ListAds;
