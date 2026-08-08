'use strict';

const crypto = require('crypto');
const User = require('../../../domain/entities/User');
const { generateId } = require('../../../shared/utils/id');
const {
  assertRequired,
  assertEmail,
  assertLength,
  sanitizeString
} = require('../../../shared/utils/validator');
const ValidationError = require('../../../shared/errors/ValidationError');
const { PASSWORD_SALT } = require('../../../config/env');

function hashPassword(plain) {
  return crypto.createHash('sha256').update(PASSWORD_SALT + plain).digest('hex');
}

class RegisterUser {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(input) {
    assertRequired(['name', 'email', 'password'], input);
    assertLength(input.name, 'name', 2, 80);
    assertEmail(input.email);
    assertLength(input.password, 'password', 6, 100);

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new ValidationError('E-mail já cadastrado.');

    const user = new User({
      id: generateId('usr'),
      name: sanitizeString(input.name, 80),
      email: input.email.toLowerCase().trim(),
      password: hashPassword(input.password),
      university: sanitizeString(input.university || '', 120),
      course: sanitizeString(input.course || '', 120),
      avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(input.email)}`,
      favorites: [],
      createdAt: new Date().toISOString()
    });

    await this.userRepository.create(user);

    const token = `${user.id}.${crypto
      .createHash('sha256')
      .update(user.id + user.password)
      .digest('hex')
      .slice(0, 24)}`;

    return { user: user.toPublicJSON(), token };
  }
}

module.exports = RegisterUser;
module.exports.hashPassword = hashPassword;
