'use strict';

const crypto = require('crypto');
const UnauthorizedError = require('../../shared/errors/UnauthorizedError');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

function buildAuthMiddleware({ userRepository, required = true } = {}) {
  return async function authenticate(req, _res, next) {
    try {
      const token = extractToken(req);
      if (!token) {
        if (required) throw new UnauthorizedError('Token ausente.');
        return next();
      }
      const [userId, signature] = token.split('.');
      if (!userId || !signature) {
        if (required) throw new UnauthorizedError('Token inválido.');
        return next();
      }
      const user = await userRepository.findById(userId);
      if (!user) {
        if (required) throw new UnauthorizedError('Usuário não encontrado.');
        return next();
      }
      const expected = crypto
        .createHash('sha256')
        .update(user.id + user.password)
        .digest('hex')
        .slice(0, 24);
      if (expected !== signature) {
        if (required) throw new UnauthorizedError('Assinatura inválida.');
        return next();
      }
      req.user = user.toPublicJSON();
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { buildAuthMiddleware };
