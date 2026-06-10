'use strict';

const { collection } = require('../data/store');

/**
 * Lista todos los proyectos. Útil para poblar selects del frontend
 * (alta/edición de tareas) y para el contexto general.
 */
function listar() {
  return collection('proyectos');
}

function obtenerPorId(id) {
  return collection('proyectos').find((p) => p.id === id) || null;
}

module.exports = { listar, obtenerPorId };
