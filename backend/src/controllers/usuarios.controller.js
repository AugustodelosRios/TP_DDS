'use strict';

const usuariosService = require('../services/usuarios.service');

function listar(req, res, next) {
  try {
    res.status(200).json(usuariosService.listar());
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
