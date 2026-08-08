'use strict';

const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message = 'Dados inválidos.', details = null) {
    super(message, 422, details);
    this.name = 'ValidationError';
  }
}

module.exports = ValidationError;
