'use strict';

const AD_TYPES = Object.freeze(['sale', 'donation']);

const AD_CATEGORIES = Object.freeze([
  'Livros',
  'Apostilas',
  'Xerox',
  'Calculadoras',
  'Componentes Eletrônicos',
  'Jalecos',
  'Equipamentos',
  'Móveis',
  'Escritório',
  'Outros'
]);

class Ad {
  constructor({
    id,
    title,
    description,
    category,
    price = 0,
    type,
    imageUrl = '',
    advertiser,
    userId,
    createdAt,
    views = 0
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.price = type === 'donation' ? 0 : Number(price) || 0;
    this.type = type;
    this.imageUrl = imageUrl;
    this.advertiser = advertiser;
    this.userId = userId;
    this.createdAt = createdAt || new Date().toISOString();
    this.views = Number(views) || 0;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      price: this.price,
      type: this.type,
      imageUrl: this.imageUrl,
      advertiser: this.advertiser,
      userId: this.userId,
      createdAt: this.createdAt,
      views: this.views
    };
  }
}

module.exports = { Ad, AD_TYPES, AD_CATEGORIES };
