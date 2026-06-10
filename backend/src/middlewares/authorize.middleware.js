'use strict';

const AppError = require('../utils/AppError');

/**
 * Middleware de autorización por rol.
 * Debe usarse SIEMPRE después de authenticate.
 * - 403 si el usuario autenticado no tiene un rol permitido.
 *
 * La validación de "propiedad del recurso" (ej: un colaborador solo opera
 * sus propias tareas) se resuelve en el servicio, porque depende de los datos.
 */
function authorizeRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401));
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(
        new AppError('No tenés permisos para realizar esta acción', 403)
      );
    }
    next();
  };
}

module.exports = { authorizeRoles };
