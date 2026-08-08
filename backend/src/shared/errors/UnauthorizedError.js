'use strict';

const AppError = require('./AppError');

class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

module.exports = UnauthorizedError;
