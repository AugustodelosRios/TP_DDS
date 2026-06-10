'use strict';

const proyectosService = require('../services/proyectos.service');

function listar(req, res, next) {
  try {
    res.status(200).json(proyectosService.listar());
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
