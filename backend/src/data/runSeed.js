'use strict';

/**
 * Script ejecutable para (re)generar la base de datos con los datos semilla.
 * Uso: npm run seed
 */
const { resetDatabase } = require('./store');
const config = require('../config/config');

resetDatabase();
console.log(`✅ Base de datos semilla generada en: ${config.dbFile}`);
console.log('   - 5 usuarios (admin@dds.com / lider@dds.com / mica@dds.com / juan@dds.com / ana@dds.com)');
console.log('   - 4 proyectos (activo, activo, pausado, finalizado)');
console.log('   - 15 tareas en distintos estados y prioridades');
console.log('   Contraseña de todos los usuarios semilla: password123');
