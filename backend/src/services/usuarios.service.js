'use strict';

const { collection } = require('../data/store');

/**
 * Devuelve los usuarios en forma pública (sin passwordHash). Sirve para
 * poblar selects de responsables y mostrar nombres en el frontend.
 */
function listar() {
  return collection('usuarios').map(({ passwordHash, ...safe }) => safe);
}

module.exports = { listar };
