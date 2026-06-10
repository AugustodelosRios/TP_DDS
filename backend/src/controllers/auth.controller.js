'use strict';

const authService = require('../services/auth.service');

/**
 * Los controladores son finos: orquestan request/response y delegan
 * las reglas a los servicios. Los errores se propagan con next(err) al
 * middleware central.
 */

function register(req, res, next) {
  try {
    const resultado = authService.registrar(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

function login(req, res, next) {
  try {
    const resultado = authService.login(req.body);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  // req.user lo setea el middleware authenticate.
  res.status(200).json({ usuario: req.user });
}

module.exports = { register, login, me };
