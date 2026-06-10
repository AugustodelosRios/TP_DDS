'use strict';

/**
 * Genera un id incremental con prefijo a partir de los ids existentes
 * de una colección (ej: tar-1001 -> tar-1002). Si no hay coincidencias,
 * arranca desde un valor base.
 */
function nextId(coleccion, prefijo, base = 1) {
  let max = base - 1;
  for (const item of coleccion) {
    if (typeof item.id === 'string' && item.id.startsWith(`${prefijo}-`)) {
      const num = parseInt(item.id.slice(prefijo.length + 1), 10);
      if (!Number.isNaN(num) && num > max) max = num;
    }
  }
  return `${prefijo}-${max + 1}`;
}

module.exports = { nextId };
