'use strict';

const AppError = require('../utils/AppError');
const {
  PRIORIDADES,
  ESTADOS_TAREA_VALIDOS,
  ROLES_VALIDOS,
  ESTADOS_TAREA,
} = require('../config/constants');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Middlewares de validación de entrada. Validan FORMA/PRESENCIA de los datos
 * (responsabilidad de entrada). Las reglas de negocio (responsable que integra
 * el proyecto, transiciones de estado, etc.) viven en los servicios.
 */

function validateRegister(req, res, next) {
  const { nombre, email, password, rol } = req.body || {};
  if (!isNonEmptyString(nombre)) return next(new AppError('El nombre es obligatorio', 400));
  if (!isNonEmptyString(email) || !emailRegex.test(email)) {
    return next(new AppError('El email es inválido', 400));
  }
  if (!isNonEmptyString(password) || password.length < 6) {
    return next(new AppError('La contraseña debe tener al menos 6 caracteres', 400));
  }
  if (rol !== undefined && !ROLES_VALIDOS.includes(rol)) {
    return next(new AppError(`Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}`, 400));
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!isNonEmptyString(email)) return next(new AppError('El email es obligatorio', 400));
  if (!isNonEmptyString(password)) return next(new AppError('La contraseña es obligatoria', 400));
  next();
}

function validateCrearTarea(req, res, next) {
  const { proyectoId, titulo, descripcion, responsableId, prioridad, estado, fechaLimite } =
    req.body || {};

  if (!isNonEmptyString(proyectoId)) return next(new AppError('El proyectoId es obligatorio', 400));
  if (!isNonEmptyString(titulo)) return next(new AppError('El título es obligatorio', 400));
  if (!isNonEmptyString(descripcion)) return next(new AppError('La descripción es obligatoria', 400));
  if (!isNonEmptyString(responsableId)) return next(new AppError('El responsableId es obligatorio', 400));

  if (!PRIORIDADES.includes(prioridad)) {
    return next(new AppError(`Prioridad inválida. Valores permitidos: ${PRIORIDADES.join(', ')}`, 400));
  }
  // El estado inicial es opcional; si viene, debe ser válido y solo pendiente o en_progreso.
  if (estado !== undefined) {
    if (!ESTADOS_TAREA_VALIDOS.includes(estado)) {
      return next(new AppError(`Estado inválido. Valores permitidos: ${ESTADOS_TAREA_VALIDOS.join(', ')}`, 400));
    }
    if (![ESTADOS_TAREA.PENDIENTE, ESTADOS_TAREA.EN_PROGRESO].includes(estado)) {
      return next(new AppError('El estado inicial solo puede ser pendiente o en_progreso', 400));
    }
  }
  if (!isNonEmptyString(fechaLimite) || Number.isNaN(Date.parse(fechaLimite))) {
    return next(new AppError('La fechaLimite es obligatoria y debe ser una fecha válida', 400));
  }
  next();
}

function validateEditarTarea(req, res, next) {
  const { titulo, descripcion, prioridad, estado, fechaLimite } = req.body || {};

  // En edición todos los campos son opcionales, pero si vienen deben ser válidos.
  if (titulo !== undefined && !isNonEmptyString(titulo)) {
    return next(new AppError('El título no puede estar vacío', 400));
  }
  if (descripcion !== undefined && !isNonEmptyString(descripcion)) {
    return next(new AppError('La descripción no puede estar vacía', 400));
  }
  if (prioridad !== undefined && !PRIORIDADES.includes(prioridad)) {
    return next(new AppError(`Prioridad inválida. Valores permitidos: ${PRIORIDADES.join(', ')}`, 400));
  }
  if (estado !== undefined && !ESTADOS_TAREA_VALIDOS.includes(estado)) {
    return next(new AppError(`Estado inválido. Valores permitidos: ${ESTADOS_TAREA_VALIDOS.join(', ')}`, 400));
  }
  if (fechaLimite !== undefined && (!isNonEmptyString(fechaLimite) || Number.isNaN(Date.parse(fechaLimite)))) {
    return next(new AppError('La fechaLimite debe ser una fecha válida', 400));
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateCrearTarea,
  validateEditarTarea,
};
