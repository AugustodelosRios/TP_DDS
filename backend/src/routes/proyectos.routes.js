'use strict';

const express = require('express');
const router = express.Router();

const proyectosController = require('../controllers/proyectos.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Listado de proyectos: requiere usuario autenticado.
router.get('/', authenticate, proyectosController.listar);

module.exports = router;
