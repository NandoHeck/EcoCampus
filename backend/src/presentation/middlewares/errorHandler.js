'use strict';

const AppError = require('../../shared/errors/AppError');

function notFound(req, res, _next) {
  res.status(404).json({
    error: {
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND'
    }
  });
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.name,
        details: err.details || undefined
      }
    });
  }

  // eslint-disable-next-line no-console
  console.error('[UnhandledError]', err);
  return res.status(500).json({
    error: {
      message: 'Erro interno do servidor.',
      code: 'INTERNAL_ERROR'
    }
  });
}

module.exports = { notFound, errorHandler };
