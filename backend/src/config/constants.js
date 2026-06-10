'use strict';

/**
 * Valores permitidos del dominio. Se validan SIEMPRE en el backend
 * (los selects del frontend son solo ayuda de UX, no la fuente de verdad).
 */

const ROLES = {
  COLABORADOR: 'colaborador',
  LIDER: 'lider',
  ADMIN: 'admin',
};

const ROLES_VALIDOS = Object.values(ROLES);

// Roles con permisos de gestión completa sobre las tareas del proyecto.
const ROLES_GESTION = [ROLES.LIDER, ROLES.ADMIN];

const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];

const ESTADOS_TAREA = {
  PENDIENTE: 'pendiente',
  EN_PROGRESO: 'en_progreso',
  BLOQUEADA: 'bloqueada',
  FINALIZADA: 'finalizada',
  CANCELADA: 'cancelada',
};

const ESTADOS_TAREA_VALIDOS = Object.values(ESTADOS_TAREA);

const ESTADOS_PROYECTO = {
  ACTIVO: 'activo',
  PAUSADO: 'pausado',
  FINALIZADO: 'finalizado',
};

const ESTADOS_PROYECTO_VALIDOS = Object.values(ESTADOS_PROYECTO);

/**
 * Transiciones de estado permitidas para una tarea.
 * - pendiente   -> en_progreso, cancelada
 * - en_progreso -> bloqueada, finalizada, cancelada
 * - bloqueada   -> en_progreso, cancelada
 * - finalizada  -> (ninguna, estado terminal)
 * - cancelada   -> (ninguna, estado terminal)
 */
const TRANSICIONES_ESTADO = {
  [ESTADOS_TAREA.PENDIENTE]: [ESTADOS_TAREA.EN_PROGRESO, ESTADOS_TAREA.CANCELADA],
  [ESTADOS_TAREA.EN_PROGRESO]: [
    ESTADOS_TAREA.BLOQUEADA,
    ESTADOS_TAREA.FINALIZADA,
    ESTADOS_TAREA.CANCELADA,
  ],
  [ESTADOS_TAREA.BLOQUEADA]: [ESTADOS_TAREA.EN_PROGRESO, ESTADOS_TAREA.CANCELADA],
  [ESTADOS_TAREA.FINALIZADA]: [],
  [ESTADOS_TAREA.CANCELADA]: [],
};

// Estados terminales: no se puede editar la tarea (salvo observación administrativa).
const ESTADOS_TERMINALES = [ESTADOS_TAREA.FINALIZADA, ESTADOS_TAREA.CANCELADA];

const ACCIONES_HISTORIAL = {
  CREACION: 'creacion',
  EDICION: 'edicion',
  REASIGNACION: 'reasignacion',
  CAMBIO_ESTADO: 'cambio_estado',
  CAMBIO_PRIORIDAD: 'cambio_prioridad',
  CANCELACION: 'cancelacion',
};

module.exports = {
  ROLES,
  ROLES_VALIDOS,
  ROLES_GESTION,
  PRIORIDADES,
  ESTADOS_TAREA,
  ESTADOS_TAREA_VALIDOS,
  ESTADOS_PROYECTO,
  ESTADOS_PROYECTO_VALIDOS,
  TRANSICIONES_ESTADO,
  ESTADOS_TERMINALES,
  ACCIONES_HISTORIAL,
};
