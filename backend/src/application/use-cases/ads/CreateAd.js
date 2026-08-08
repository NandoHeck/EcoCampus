'use strict';

const { Ad, AD_TYPES, AD_CATEGORIES } = require('../../../domain/entities/Ad');
const { generateId } = require('../../../shared/utils/id');
const {
  assertRequired,
  assertLength,
  assertEnum,
  assertNonNegativeNumber,
  sanitizeString
} = require('../../../shared/utils/validator');
const NotFoundError = require('../../../shared/errors/NotFoundError');

class CreateAd {
  constructor({ adRepository, userRepository }) {
    this.adRepository = adRepository;
    this.userRepository = userRepository;
  }

  async execute(input) {
    assertRequired(['title', 'description', 'category', 'type', 'userId'], input);
    assertLength(input.title, 'title', 3, 120);
    assertLength(input.description, 'description', 10, 2000);
    assertEnum(input.category, 'category', AD_CATEGORIES);
    assertEnum(input.type, 'type', AD_TYPES);

    const price = input.type === 'donation' ? 0 : Number(input.price) || 0;
    assertNonNegativeNumber(price, 'price');

    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundError('Usuário não encontrado.');

    const ad = new Ad({
      id: generateId('ad'),
      title: sanitizeString(input.title, 120),
      description: sanitizeString(input.description, 2000),
      category: input.category,
      type: input.type,
      price,
      imageUrl: sanitizeString(input.imageUrl || '', 500),
      advertiser: user.name,
      userId: user.id
    });

    return this.adRepository.create(ad);
  }
}

module.exports = CreateAd;
