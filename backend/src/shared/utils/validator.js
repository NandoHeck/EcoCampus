'use strict';

const ValidationError = require('../errors/ValidationError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isString(v) { return typeof v === 'string'; }
function isNumber(v) { return typeof v === 'number' && !Number.isNaN(v); }
function nonEmpty(s) { return isString(s) && s.trim().length > 0; }

function assertRequired(fields, source) {
  const missing = fields.filter((f) => source[f] === undefined || source[f] === null || source[f] === '');
  if (missing.length > 0) {
    throw new ValidationError(`Campos obrigatórios ausentes: ${missing.join(', ')}.`, { missing });
  }
}

function assertEmail(email) {
  if (!isString(email) || !EMAIL_REGEX.test(email)) {
    throw new ValidationError('E-mail inválido.');
  }
}

function assertLength(value, name, min, max) {
  if (!isString(value) || value.length < min || value.length > max) {
    throw new ValidationError(`Campo "${name}" deve ter entre ${min} e ${max} caracteres.`);
  }
}

function assertEnum(value, name, allowed) {
  if (!allowed.includes(value)) {
    throw new ValidationError(`Campo "${name}" deve ser um de: ${allowed.join(', ')}.`);
  }
}

function assertNonNegativeNumber(value, name) {
  if (!isNumber(value) || value < 0) {
    throw new ValidationError(`Campo "${name}" deve ser um número maior ou igual a zero.`);
  }
}

function sanitizeString(str, max = 500) {
  if (!isString(str)) return '';
  return str
    .replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'))
    .trim()
    .slice(0, max);
}

module.exports = {
  EMAIL_REGEX,
  isString,
  isNumber,
  nonEmpty,
  assertRequired,
  assertEmail,
  assertLength,
  assertEnum,
  assertNonNegativeNumber,
  sanitizeString
};
