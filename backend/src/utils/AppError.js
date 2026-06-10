'use strict';

/**
 * Error de aplicación con status HTTP asociado.
 * Permite que los servicios lancen errores de negocio que el middleware
 * central de errores convierte en respuestas JSON coherentes.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
