'use strict';

const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuarios.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Listado de usuarios (público dentro de la app autenticada).
router.get('/', authenticate, usuariosController.listar);

module.exports = router;
