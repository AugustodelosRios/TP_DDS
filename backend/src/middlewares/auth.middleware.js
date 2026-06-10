'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AppError = require('../utils/AppError');
const { collection } = require('../data/store');

/**
 * Middleware de autenticación JWT.
 * - 401 si no se envía token o es inválido/expirado.
 * - Adjunta el usuario actual (sin passwordHash) en req.user.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('No se envió un token de autenticación', 401));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return next(new AppError('Token inválido o expirado', 401));
  }

  const usuario = collection('usuarios').find((u) => u.id === payload.sub);
  if (!usuario || !usuario.activo) {
    return next(new AppError('Usuario no autorizado o inactivo', 401));
  }

  // Nunca exponemos el hash de la contraseña.
  const { passwordHash, ...safe } = usuario;
  req.user = safe;
  next();
}

module.exports = { authenticate };
