'use strict';

const { AD_TYPES, AD_CATEGORIES } = require('../../../domain/entities/Ad');
const {
  assertLength,
  assertEnum,
  assertNonNegativeNumber,
  sanitizeString
} = require('../../../shared/utils/validator');
const NotFoundError = require('../../../shared/errors/NotFoundError');
const UnauthorizedError = require('../../../shared/errors/UnauthorizedError');

class UpdateAd {
  constructor({ adRepository }) {
    this.adRepository = adRepository;
  }

  async execute(id, input, { requesterId }) {
    const existing = await this.adRepository.findById(id);
    if (!existing) throw new NotFoundError('Anúncio não encontrado.');
    if (requesterId && existing.userId !== requesterId) {
      throw new UnauthorizedError('Você não pode editar este anúncio.');
    }

    const partial = {};

    if (input.title !== undefined) {
      assertLength(input.title, 'title', 3, 120);
      partial.title = sanitizeString(input.title, 120);
    }
    if (input.description !== undefined) {
      assertLength(input.description, 'description', 10, 2000);
      partial.description = sanitizeString(input.description, 2000);
    }
    if (input.category !== undefined) {
      assertEnum(input.category, 'category', AD_CATEGORIES);
      partial.category = input.category;
    }
    if (input.type !== undefined) {
      assertEnum(input.type, 'type', AD_TYPES);
      partial.type = input.type;
    }
    const finalType = partial.type || existing.type;
    if (input.price !== undefined || partial.type) {
      const priceCandidate = finalType === 'donation' ? 0 : Number(input.price ?? existing.price) || 0;
      assertNonNegativeNumber(priceCandidate, 'price');
      partial.price = priceCandidate;
    }
    if (input.imageUrl !== undefined) {
      partial.imageUrl = sanitizeString(input.imageUrl, 500);
    }

    return this.adRepository.update(id, partial);
  }
}

module.exports = UpdateAd;
