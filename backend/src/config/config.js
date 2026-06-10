'use strict';

require('dotenv').config();

const path = require('path');

const isTest = process.env.NODE_ENV === 'test';

/**
 * Configuración central de la aplicación.
 * En modo test se usa un archivo de base de datos separado para no
 * pisar los datos de desarrollo y poder resetearlos entre pruebas.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  jwt: {
    secret: process.env.JWT_SECRET || 'dds_2026_3k4_secret_super_seguro',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dbFile: isTest
    ? path.join(__dirname, '..', 'data', 'db.test.json')
    : path.join(__dirname, '..', 'data', 'db.json'),
};

module.exports = config;
