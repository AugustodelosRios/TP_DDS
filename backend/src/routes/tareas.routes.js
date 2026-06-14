'use strict';

const express = require('express');
const router = express.Router();

const tareasController = require('../controllers/tareas.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/authorize.middleware');
const {
  validateCrearTarea,
  validateEditarTarea,
} = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');

// Todas las rutas de tareas requieren autenticación.
router.use(authenticate);

/* --- Lecturas --- */
// El resumen administrativo debe estar protegido para roles de gestión.
router.get('/resumen', authorizeRoles(ROLES.ADMIN), tareasController.resumen);
router.get('/', tareasController.listar);
router.get('/:id', tareasController.obtener);
router.get('/:id/historial', tareasController.historial);

/* --- Escrituras --- */
// Crear: solo admin.
router.post('/', authorizeRoles(ROLES.ADMIN), validateCrearTarea, tareasController.crear);

// Editar: la validación fina de permisos (colaborador responsable vs gestor)
// se resuelve en el servicio, porque depende de los datos de la tarea.
router.put('/:id', validateEditarTarea, tareasController.editar);

// Transiciones de estado (PATCH).
router.patch('/:id/iniciar', tareasController.iniciar);
router.patch('/:id/bloquear', tareasController.bloquear);
router.patch('/:id/cancelar', tareasController.cancelar);
router.patch('/:id/finalizar', tareasController.finalizar);

module.exports = router;
