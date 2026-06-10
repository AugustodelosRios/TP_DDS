'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { buildSeedData } = require('./seed');

/**
 * Persistencia simple en archivo JSON.
 *
 * Mantiene los datos en memoria y los escribe en disco en cada cambio,
 * de modo que la información sobrevive al reinicio del backend (requisito
 * del enunciado). Si el archivo no existe, se crea a partir de la semilla.
 *
 * El acceso a colecciones se hace siempre por referencia controlada para
 * que las reglas de negocio queden centralizadas en los servicios.
 */

let db = null;

function emptyDb() {
  return { usuarios: [], proyectos: [], tareas: [], historial_tareas: [] };
}

function persist() {
  const dir = path.dirname(config.dbFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(config.dbFile, JSON.stringify(db, null, 2), 'utf-8');
}

/**
 * Carga la base desde disco. Si no existe, la inicializa con la semilla.
 */
function load() {
  if (fs.existsSync(config.dbFile)) {
    try {
      const raw = fs.readFileSync(config.dbFile, 'utf-8');
      db = { ...emptyDb(), ...JSON.parse(raw) };
    } catch (err) {
      // Archivo corrupto: re-seedeamos para no dejar el server inutilizable.
      db = buildSeedData();
      persist();
    }
  } else {
    db = buildSeedData();
    persist();
  }
  return db;
}

/**
 * Restaura la base a la semilla inicial. Usado por el script de seed y por
 * los tests (para que cada suite parta de datos previsibles).
 */
function resetDatabase() {
  db = buildSeedData();
  persist();
  return db;
}

function getDb() {
  if (!db) load();
  return db;
}

// Acceso a colecciones
const collection = (name) => getDb()[name];

module.exports = {
  load,
  resetDatabase,
  getDb,
  persist,
  collection,
};
