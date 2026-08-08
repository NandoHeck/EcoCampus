'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  assertRequired,
  assertEmail,
  assertLength,
  assertEnum,
  assertNonNegativeNumber,
  sanitizeString
} = require('../src/shared/utils/validator');

describe('shared/utils/validator', () => {
  test('assertRequired detecta campos ausentes', () => {
    assert.throws(
      () => assertRequired(['a', 'b'], { a: 'x' }),
      (err) => err.name === 'ValidationError' && err.statusCode === 422
    );
  });

  test('assertRequired passa quando todos estão presentes', () => {
    assert.doesNotThrow(() => assertRequired(['a'], { a: 'x' }));
  });

  test('assertEmail aceita formato válido', () => {
    assert.doesNotThrow(() => assertEmail('foo@bar.com'));
  });

  test('assertEmail rejeita string sem @', () => {
    assert.throws(() => assertEmail('foo.bar.com'));
  });

  test('assertLength respeita min/max', () => {
    assert.doesNotThrow(() => assertLength('abc', 'title', 2, 10));
    assert.throws(() => assertLength('a', 'title', 2, 10));
    assert.throws(() => assertLength('a'.repeat(20), 'title', 2, 10));
  });

  test('assertEnum aceita valores da lista', () => {
    assert.doesNotThrow(() => assertEnum('sale', 'type', ['sale', 'donation']));
    assert.throws(() => assertEnum('foo', 'type', ['sale', 'donation']));
  });

  test('assertNonNegativeNumber aceita 0 e positivos', () => {
    assert.doesNotThrow(() => assertNonNegativeNumber(0, 'price'));
    assert.doesNotThrow(() => assertNonNegativeNumber(10.5, 'price'));
    assert.throws(() => assertNonNegativeNumber(-1, 'price'));
    assert.throws(() => assertNonNegativeNumber('abc', 'price'));
    assert.throws(() => assertNonNegativeNumber(NaN, 'price'));
  });

  test('sanitizeString escapa < e >', () => {
    assert.equal(sanitizeString('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('sanitizeString apara e limita tamanho', () => {
    assert.equal(sanitizeString('   hello   '), 'hello');
    assert.equal(sanitizeString('a'.repeat(10), 5).length, 5);
  });

  test('sanitizeString devolve string vazia para não-string', () => {
    assert.equal(sanitizeString(null), '');
    assert.equal(sanitizeString(undefined), '');
    assert.equal(sanitizeString(42), '');
  });
});
