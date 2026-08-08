'use strict';

const crypto = require('crypto');
const { hashPassword } = require('./RegisterUser');
const {
  assertRequired,
  assertEmail
} = require('../../../shared/utils/validator');
const UnauthorizedError = require('../../../shared/errors/UnauthorizedError');

class LoginUser {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(input) {
    assertRequired(['email', 'password'], input);
    assertEmail(input.email);

    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new UnauthorizedError('E-mail ou senha inválidos.');

    const hashed = hashPassword(input.password);
    if (hashed !== user.password) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const token = `${user.id}.${crypto
      .createHash('sha256')
      .update(user.id + user.password)
      .digest('hex')
      .slice(0, 24)}`;

    return { user: user.toPublicJSON(), token };
  }
}

module.exports = LoginUser;
