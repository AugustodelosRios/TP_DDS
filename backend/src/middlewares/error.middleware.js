'use strict';

const AppError = require('../utils/AppError');

/**
 * Middleware para rutas no encontradas (404).
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Middleware CENTRAL de manejo de errores.
 * Firma obligatoria (err, req, res, next). Debe registrarse DESPUÉS de las rutas.
 * Devuelve siempre JSON claro con la forma { "error": "mensaje" }.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  // Errores no controlados: log para depuración y mensaje genérico al cliente.
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error('[ERROR 500]', err);
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Error interno del servidor' : err.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
