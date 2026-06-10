'use strict';

const bcrypt = require('bcryptjs');

/**
 * Genera el set de datos semilla inicial.
 *
 * Incluye (cumpliendo el mínimo del enunciado):
 *  - 5 usuarios (1 admin, 1 líder y 3 colaboradores)
 *  - 4 proyectos (activo, activo, pausado y finalizado)
 *  - 15 tareas en distintos estados, prioridades y con vencimientos variados
 *
 * Todas las contraseñas semilla son "password123" (hasheadas con bcrypt).
 * Esto está documentado en el README como facilidad de prueba.
 */
function buildSeedData() {
  const passwordHash = bcrypt.hashSync('password123', 10);

  const usuarios = [
    { id: 'usr-001', nombre: 'Admin General', email: 'admin@dds.com', passwordHash, rol: 'admin', activo: true },
    { id: 'usr-002', nombre: 'Lucía Líder', email: 'lider@dds.com', passwordHash, rol: 'lider', activo: true },
    { id: 'usr-003', nombre: 'Mica Torres', email: 'mica@dds.com', passwordHash, rol: 'colaborador', activo: true },
    { id: 'usr-004', nombre: 'Juan Pérez', email: 'juan@dds.com', passwordHash, rol: 'colaborador', activo: true },
    { id: 'usr-005', nombre: 'Ana Gómez', email: 'ana@dds.com', passwordHash, rol: 'colaborador', activo: true },
  ];

  const proyectos = [
    {
      id: 'proy-001',
      codigo: 'DDS-API',
      nombre: 'API de seguimiento DDS',
      descripcion: 'Backend Express con autenticación, tareas y reportes.',
      estado: 'activo',
      integrantes: ['usr-001', 'usr-002', 'usr-003', 'usr-004'],
    },
    {
      id: 'proy-002',
      codigo: 'PORTAL-ALU',
      nombre: 'Portal de alumnos',
      descripcion: 'Frontend React para que los alumnos consulten su avance.',
      estado: 'activo',
      integrantes: ['usr-002', 'usr-003', 'usr-005'],
    },
    {
      id: 'proy-003',
      codigo: 'SIS-INT',
      nombre: 'Sistema interno de seguimiento académico',
      descripcion: 'Herramienta interna en pausa por reasignación de recursos.',
      estado: 'pausado',
      integrantes: ['usr-001', 'usr-002', 'usr-004'],
    },
    {
      id: 'proy-004',
      codigo: 'MIG-LEG',
      nombre: 'Migración legacy',
      descripcion: 'Proyecto ya cerrado de migración del sistema anterior.',
      estado: 'finalizado',
      integrantes: ['usr-001', 'usr-005'],
    },
  ];

  // Fechas relativas a una base fija para que el set sea predecible.
  const tareas = [
    // --- proy-001 (activo) ---
    t('tar-1001', 'proy-001', 'Implementar login con JWT', 'Crear endpoint y pantalla de login.', 'usr-003', 'alta', 'en_progreso', '2026-06-21', '2026-06-01T09:00:00'),
    t('tar-1002', 'proy-001', 'Diseñar middleware de errores', 'Middleware central (err, req, res, next).', 'usr-004', 'media', 'pendiente', '2026-06-18', '2026-06-02T10:00:00'),
    t('tar-1003', 'proy-001', 'Modelar entidad Tarea', 'Definir campos y relaciones de la tarea.', 'usr-002', 'alta', 'finalizada', '2026-06-05', '2026-05-28T08:30:00'),
    t('tar-1004', 'proy-001', 'Endpoint resumen administrativo', 'Agregados por estado, vencidas y críticas.', 'usr-003', 'critica', 'bloqueada', '2026-06-15', '2026-06-03T11:00:00'),
    t('tar-1005', 'proy-001', 'Validación de responsable', 'Rechazar responsable fuera de integrantes.', 'usr-004', 'alta', 'pendiente', '2026-05-30', '2026-05-25T14:00:00'), // vencida
    t('tar-1006', 'proy-001', 'Carga de datos semilla', 'Script con usuarios, proyectos y tareas.', 'usr-002', 'baja', 'finalizada', '2026-06-04', '2026-05-29T09:15:00'),

    // --- proy-002 (activo) ---
    t('tar-2001', 'proy-002', 'Maquetar listado de tareas', 'Tabla con filtros y paginación.', 'usr-003', 'media', 'en_progreso', '2026-06-22', '2026-06-04T09:00:00'),
    t('tar-2002', 'proy-002', 'Pantalla de detalle de tarea', 'Ruta dinámica /tareas/:id con historial.', 'usr-005', 'alta', 'pendiente', '2026-06-25', '2026-06-05T10:30:00'),
    t('tar-2003', 'proy-002', 'Formulario de alta/edición', 'Selección de proyecto, responsable y estado.', 'usr-003', 'critica', 'pendiente', '2026-06-09', '2026-06-05T16:00:00'),
    t('tar-2004', 'proy-002', 'Contexto de autenticación', 'Guardar token y rol en frontend.', 'usr-002', 'media', 'en_progreso', '2026-06-20', '2026-06-06T08:45:00'),
    t('tar-2005', 'proy-002', 'Manejo de errores de API', 'Mostrar errores de validación y permisos.', 'usr-005', 'baja', 'pendiente', '2026-06-02', '2026-05-27T12:00:00'), // vencida

    // --- proy-003 (pausado: no se crean nuevas, pero existen) ---
    t('tar-3001', 'proy-003', 'Relevar requerimientos académicos', 'Entrevistas con secretaría.', 'usr-004', 'media', 'bloqueada', '2026-06-12', '2026-05-20T09:00:00'),
    t('tar-3002', 'proy-003', 'Definir modelo de datos', 'Entidades y relaciones del sistema interno.', 'usr-002', 'alta', 'pendiente', '2026-05-26', '2026-05-18T10:00:00'), // vencida
    t('tar-3003', 'proy-003', 'Prototipo de tablero', 'Mock navegable para validar con el cliente.', 'usr-001', 'critica', 'en_progreso', '2026-06-28', '2026-05-30T11:30:00'),

    // --- proy-004 (finalizado) ---
    t('tar-4001', 'proy-004', 'Cierre y documentación final', 'Documentar migración completada.', 'usr-005', 'media', 'finalizada', '2026-05-15', '2026-05-01T09:00:00'),
  ];

  // Algo de historial inicial para las tareas finalizadas/avanzadas.
  const historial_tareas = [
    h('hist-001', 'tar-1003', 'usr-002', 'creacion', '2026-05-28T08:30:00', null, { estado: 'pendiente' }),
    h('hist-002', 'tar-1003', 'usr-002', 'cambio_estado', '2026-05-30T10:00:00', { estado: 'pendiente' }, { estado: 'en_progreso' }),
    h('hist-003', 'tar-1003', 'usr-002', 'cambio_estado', '2026-06-05T17:00:00', { estado: 'en_progreso' }, { estado: 'finalizada' }),
    h('hist-004', 'tar-1001', 'usr-002', 'creacion', '2026-06-01T09:00:00', null, { estado: 'pendiente' }),
    h('hist-005', 'tar-1001', 'usr-003', 'cambio_estado', '2026-06-02T09:30:00', { estado: 'pendiente' }, { estado: 'en_progreso' }),
  ];

  return { usuarios, proyectos, tareas, historial_tareas };
}

function t(id, proyectoId, titulo, descripcion, responsableId, prioridad, estado, fechaLimite, createdAt) {
  return { id, proyectoId, titulo, descripcion, responsableId, prioridad, estado, fechaLimite, createdAt };
}

function h(id, tareaId, usuarioId, accion, fechaHora, valorAnterior, valorNuevo) {
  return { id, tareaId, usuarioId, accion, fechaHora, valorAnterior, valorNuevo };
}

module.exports = { buildSeedData };
