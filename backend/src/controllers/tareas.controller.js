'use strict';

const tareasService = require('../services/tareas.service');
const { ESTADOS_TAREA } = require('../config/constants');

function listar(req, res, next) {
  try {
    res.status(200).json(tareasService.listar(req.query));
  } catch (err) {
    next(err);
  }
}

function resumen(req, res, next) {
  try {
    res.status(200).json(tareasService.resumen());
  } catch (err) {
    next(err);
  }
}

function obtener(req, res, next) {
  try {
    res.status(200).json(tareasService.obtenerPorId(req.params.id));
  } catch (err) {
    next(err);
  }
}

function historial(req, res, next) {
  try {
    res.status(200).json(tareasService.obtenerHistorial(req.params.id));
  } catch (err) {
    next(err);
  }
}

function crear(req, res, next) {
  try {
    const tarea = tareasService.crear(req.body, req.user);
    res.status(201).json(tarea);
  } catch (err) {
    next(err);
  }
}

function editar(req, res, next) {
  try {
    const tarea = tareasService.editar(req.params.id, req.body, req.user);
    res.status(200).json(tarea);
  } catch (err) {
    next(err);
  }
}

// Generador de handlers para las transiciones de estado (PATCH).
function transicion(nuevoEstado) {
  return (req, res, next) => {
    try {
      const tarea = tareasService.cambiarEstado(req.params.id, nuevoEstado, req.user);
      res.status(200).json(tarea);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  listar,
  resumen,
  obtener,
  historial,
  crear,
  editar,
  iniciar: transicion(ESTADOS_TAREA.EN_PROGRESO),
  bloquear: transicion(ESTADOS_TAREA.BLOQUEADA),
  cancelar: transicion(ESTADOS_TAREA.CANCELADA),
  finalizar: transicion(ESTADOS_TAREA.FINALIZADA),
};
