'use strict';

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const proyectosRoutes = require('./proyectos.routes');
const tareasRoutes = require('./tareas.routes');
const usuariosRoutes = require('./usuarios.routes');

router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/proyectos', proyectosRoutes);
router.use('/tareas', tareasRoutes);
router.use('/usuarios', usuariosRoutes);

module.exports = router;
