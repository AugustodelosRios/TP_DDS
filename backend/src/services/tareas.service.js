'use strict';

const AppError = require('../utils/AppError');
const { collection, persist } = require('../data/store');
const { nextId } = require('../utils/id');
const {
  PRIORIDADES,
  ESTADOS_TAREA,
  ESTADOS_TAREA_VALIDOS,
  ESTADOS_PROYECTO,
  TRANSICIONES_ESTADO,
  ESTADOS_TERMINALES,
  ROLES,
  ROLES_GESTION,
  ACCIONES_HISTORIAL,
} = require('../config/constants');

/* ------------------------------------------------------------------ *
 *  Helpers de acceso y reglas de dominio
 * ------------------------------------------------------------------ */

function buscarProyecto(proyectoId) {
  return collection('proyectos').find((p) => p.id === proyectoId) || null;
}

function buscarUsuario(usuarioId) {
  return collection('usuarios').find((u) => u.id === usuarioId) || null;
}

function buscarTareaOrFail(id) {
  const tarea = collection('tareas').find((t) => t.id === id);
  if (!tarea) throw new AppError('Tarea no encontrada', 404);
  return tarea;
}

function esGestor(usuario) {
  return ROLES_GESTION.includes(usuario.rol);
}

/**
 * Regla central: un usuario solo puede ser responsable si integra el proyecto.
 */
function validarResponsableEnProyecto(proyecto, responsableId) {
  const usuario = buscarUsuario(responsableId);
  if (!usuario) {
    throw new AppError('El responsable indicado no existe', 400);
  }
  if (!proyecto.integrantes.includes(responsableId)) {
    throw new AppError('El responsable no pertenece al proyecto', 400);
  }
  return usuario;
}

/**
 * Registra una entrada en el historial de auditoría de una tarea.
 */
function registrarHistorial({ tareaId, usuarioId, accion, valorAnterior, valorNuevo }) {
  const historial = collection('historial_tareas');
  historial.push({
    id: nextId(historial, 'hist', 1),
    tareaId,
    usuarioId,
    accion,
    fechaHora: new Date().toISOString(),
    valorAnterior: valorAnterior ?? null,
    valorNuevo: valorNuevo ?? null,
  });
}

/**
 * Indica si una tarea está vencida: fechaLimite anterior a hoy y el estado
 * no es finalizada ni cancelada.
 */
function estaVencida(tarea) {
  if ([ESTADOS_TAREA.FINALIZADA, ESTADOS_TAREA.CANCELADA].includes(tarea.estado)) {
    return false;
  }
  const limite = new Date(tarea.fechaLimite);
  if (Number.isNaN(limite.getTime())) return false;
  return limite.getTime() < Date.now();
}

/**
 * Devuelve la tarea con el flag calculado `vencida` para el frontend.
 */
function decorar(tarea) {
  return { ...tarea, vencida: estaVencida(tarea) };
}

/* ------------------------------------------------------------------ *
 *  Listado con filtros, paginación y ordenamiento (resuelto en backend)
 * ------------------------------------------------------------------ */

function listar(query = {}) {
  const {
    proyectoId,
    responsableId,
    estado,
    prioridad,
    vencidas,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
  } = query;

  let resultado = collection('tareas').slice();

  if (proyectoId) resultado = resultado.filter((t) => t.proyectoId === proyectoId);
  if (responsableId) resultado = resultado.filter((t) => t.responsableId === responsableId);

  if (estado) {
    if (!ESTADOS_TAREA_VALIDOS.includes(estado)) {
      throw new AppError(`Estado de filtro inválido: ${estado}`, 400);
    }
    resultado = resultado.filter((t) => t.estado === estado);
  }
  if (prioridad) {
    if (!PRIORIDADES.includes(prioridad)) {
      throw new AppError(`Prioridad de filtro inválida: ${prioridad}`, 400);
    }
    resultado = resultado.filter((t) => t.prioridad === prioridad);
  }

  let decorado = resultado.map(decorar);

  if (vencidas === 'true' || vencidas === true) {
    decorado = decorado.filter((t) => t.vencida);
  }

  // Ordenamiento
  const camposOrdenables = ['createdAt', 'fechaLimite', 'titulo', 'prioridad', 'estado'];
  const campo = camposOrdenables.includes(sortBy) ? sortBy : 'createdAt';
  const dir = order === 'asc' ? 1 : -1;

  // Orden especial para prioridad (por importancia, no alfabético).
  const pesoPrioridad = { baja: 1, media: 2, alta: 3, critica: 4 };
  decorado.sort((a, b) => {
    let va = a[campo];
    let vb = b[campo];
    if (campo === 'prioridad') {
      va = pesoPrioridad[a.prioridad] || 0;
      vb = pesoPrioridad[b.prioridad] || 0;
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  // Paginación
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const total = decorado.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const start = (pageNum - 1) * limitNum;
  const items = decorado.slice(start, start + limitNum);

  return {
    items,
    paginacion: { page: pageNum, limit: limitNum, total, totalPages },
  };
}

function obtenerPorId(id) {
  return decorar(buscarTareaOrFail(id));
}

function obtenerHistorial(id) {
  buscarTareaOrFail(id); // valida existencia (404 si no existe)
  return collection('historial_tareas')
    .filter((h) => h.tareaId === id)
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
}

/* ------------------------------------------------------------------ *
 *  Alta de tarea
 * ------------------------------------------------------------------ */

function crear(datos, actor) {
  const { proyectoId, titulo, descripcion, responsableId, prioridad, estado, fechaLimite } = datos;

  const proyecto = buscarProyecto(proyectoId);
  if (!proyecto) {
    throw new AppError('El proyecto indicado no existe', 404);
  }
  if (proyecto.estado === ESTADOS_PROYECTO.FINALIZADO) {
    throw new AppError('No se pueden crear tareas en un proyecto finalizado', 400);
  }
  if (proyecto.estado === ESTADOS_PROYECTO.PAUSADO) {
    throw new AppError('No se pueden crear tareas en un proyecto pausado', 400);
  }

  // Regla de dominio: responsable debe integrar el proyecto.
  validarResponsableEnProyecto(proyecto, responsableId);

  const tareas = collection('tareas');
  const nueva = {
    id: nextId(tareas, 'tar', 1001),
    proyectoId,
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    responsableId,
    prioridad,
    estado: estado || ESTADOS_TAREA.PENDIENTE,
    fechaLimite,
    createdAt: new Date().toISOString(),
  };

  tareas.push(nueva);
  registrarHistorial({
    tareaId: nueva.id,
    usuarioId: actor.id,
    accion: ACCIONES_HISTORIAL.CREACION,
    valorAnterior: null,
    valorNuevo: { estado: nueva.estado, responsableId, prioridad },
  });
  persist();

  return decorar(nueva);
}

/* ------------------------------------------------------------------ *
 *  Edición de tarea (PUT)
 * ------------------------------------------------------------------ */

function editar(id, cambios, actor) {
  const tarea = buscarTareaOrFail(id);
  const proyecto = buscarProyecto(tarea.proyectoId);

  // No se editan tareas en estado terminal, salvo observación administrativa
  // (admin puede agregar/editar el campo `observacion`).
  if (ESTADOS_TERMINALES.includes(tarea.estado)) {
    const soloObservacion =
      Object.keys(cambios).every((k) => k === 'observacion') &&
      actor.rol === ROLES.ADMIN;
    if (!soloObservacion) {
      throw new AppError(
        `No se puede editar una tarea ${tarea.estado}. Solo un admin puede agregar observaciones.`,
        400
      );
    }
  }

  // Proyecto finalizado: bloquea modificaciones.
  if (proyecto && proyecto.estado === ESTADOS_PROYECTO.FINALIZADO) {
    throw new AppError('No se pueden modificar tareas de un proyecto finalizado', 400);
  }

  // Permisos de edición:
  // - gestor (admin/líder): puede editar todo.
  // - colaborador: solo si es el responsable, y solo descripción.
  const gestor = esGestor(actor);
  if (!gestor) {
    if (tarea.responsableId !== actor.id) {
      throw new AppError('Solo podés editar tareas de las que sos responsable', 403);
    }
    const camposPermitidos = ['descripcion'];
    const intentaOtros = Object.keys(cambios).some((k) => !camposPermitidos.includes(k));
    if (intentaOtros) {
      throw new AppError(
        'Como colaborador solo podés editar la descripción de tu tarea',
        403
      );
    }
  }

  const anterior = { ...tarea };
  const acciones = [];

  // Reasignación de responsable (solo gestor llega acá por lo anterior).
  if (cambios.responsableId !== undefined && cambios.responsableId !== tarea.responsableId) {
    validarResponsableEnProyecto(proyecto, cambios.responsableId);
    tarea.responsableId = cambios.responsableId;
    acciones.push({
      accion: ACCIONES_HISTORIAL.REASIGNACION,
      valorAnterior: { responsableId: anterior.responsableId },
      valorNuevo: { responsableId: tarea.responsableId },
    });
  }

  // Cambio de prioridad
  if (cambios.prioridad !== undefined && cambios.prioridad !== tarea.prioridad) {
    tarea.prioridad = cambios.prioridad;
    acciones.push({
      accion: ACCIONES_HISTORIAL.CAMBIO_PRIORIDAD,
      valorAnterior: { prioridad: anterior.prioridad },
      valorNuevo: { prioridad: tarea.prioridad },
    });
  }

  // Cambio de estado por edición: respeta las transiciones permitidas.
  if (cambios.estado !== undefined && cambios.estado !== tarea.estado) {
    aplicarTransicion(tarea, cambios.estado);
    acciones.push({
      accion: ACCIONES_HISTORIAL.CAMBIO_ESTADO,
      valorAnterior: { estado: anterior.estado },
      valorNuevo: { estado: tarea.estado },
    });
  }

  // Campos simples
  let huboEdicionSimple = false;
  for (const campo of ['titulo', 'descripcion', 'fechaLimite', 'observacion']) {
    if (cambios[campo] !== undefined && cambios[campo] !== tarea[campo]) {
      tarea[campo] = typeof cambios[campo] === 'string' ? cambios[campo].trim() : cambios[campo];
      huboEdicionSimple = true;
    }
  }
  if (huboEdicionSimple) {
    acciones.push({
      accion: ACCIONES_HISTORIAL.EDICION,
      valorAnterior: {
        titulo: anterior.titulo,
        descripcion: anterior.descripcion,
        fechaLimite: anterior.fechaLimite,
      },
      valorNuevo: {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        fechaLimite: tarea.fechaLimite,
      },
    });
  }

  // Persistimos cada acción en el historial.
  for (const a of acciones) {
    registrarHistorial({ tareaId: tarea.id, usuarioId: actor.id, ...a });
  }
  persist();

  return decorar(tarea);
}

/* ------------------------------------------------------------------ *
 *  Transiciones de estado (PATCH)
 * ------------------------------------------------------------------ */

/**
 * Aplica una transición de estado validando que sea coherente.
 * Lanza 400 si la transición no está permitida.
 */
function aplicarTransicion(tarea, nuevoEstado) {
  if (!ESTADOS_TAREA_VALIDOS.includes(nuevoEstado)) {
    throw new AppError(`Estado inválido: ${nuevoEstado}`, 400);
  }
  const permitidos = TRANSICIONES_ESTADO[tarea.estado] || [];
  if (!permitidos.includes(nuevoEstado)) {
    throw new AppError(
      `Transición de estado no permitida: ${tarea.estado} -> ${nuevoEstado}`,
      400
    );
  }
  tarea.estado = nuevoEstado;
  return tarea;
}

/**
 * Cambia el estado de una tarea validando permisos por rol/propiedad.
 *
 * - iniciar / bloquear: el responsable (colaborador) o un gestor.
 * - finalizar / cancelar: solo gestor (admin/líder).
 */
function cambiarEstado(id, nuevoEstado, actor) {
  const tarea = buscarTareaOrFail(id);
  const proyecto = buscarProyecto(tarea.proyectoId);

  if (proyecto && proyecto.estado === ESTADOS_PROYECTO.FINALIZADO) {
    throw new AppError('No se pueden modificar tareas de un proyecto finalizado', 400);
  }

  const gestor = esGestor(actor);
  const esResponsable = tarea.responsableId === actor.id;

  const accionesSoloGestor = [ESTADOS_TAREA.FINALIZADA, ESTADOS_TAREA.CANCELADA];
  if (accionesSoloGestor.includes(nuevoEstado) && !gestor) {
    throw new AppError('Solo un admin o líder puede finalizar o cancelar una tarea', 403);
  }
  // Iniciar/bloquear: responsable o gestor.
  if (
    [ESTADOS_TAREA.EN_PROGRESO, ESTADOS_TAREA.BLOQUEADA].includes(nuevoEstado) &&
    !gestor &&
    !esResponsable
  ) {
    throw new AppError('No tenés permisos para cambiar el estado de esta tarea', 403);
  }

  const estadoAnterior = tarea.estado;
  aplicarTransicion(tarea, nuevoEstado);

  const accion =
    nuevoEstado === ESTADOS_TAREA.CANCELADA
      ? ACCIONES_HISTORIAL.CANCELACION
      : ACCIONES_HISTORIAL.CAMBIO_ESTADO;

  registrarHistorial({
    tareaId: tarea.id,
    usuarioId: actor.id,
    accion,
    valorAnterior: { estado: estadoAnterior },
    valorNuevo: { estado: tarea.estado },
  });
  persist();

  return decorar(tarea);
}

/* ------------------------------------------------------------------ *
 *  Resumen administrativo
 * ------------------------------------------------------------------ */

function resumen() {
  const tareas = collection('tareas');

  const porEstado = ESTADOS_TAREA_VALIDOS.reduce((acc, e) => ({ ...acc, [e]: 0 }), {});
  for (const t of tareas) {
    porEstado[t.estado] = (porEstado[t.estado] || 0) + 1;
  }

  const vencidas = tareas.filter(estaVencida);

  // Carga por responsable (solo tareas no terminales cuentan como "carga activa").
  const cargaPorResponsable = {};
  for (const t of tareas) {
    const activa = ![ESTADOS_TAREA.FINALIZADA, ESTADOS_TAREA.CANCELADA].includes(t.estado);
    if (!activa) continue;
    cargaPorResponsable[t.responsableId] = (cargaPorResponsable[t.responsableId] || 0) + 1;
  }
  const usuarios = collection('usuarios');
  const cargaResponsables = Object.entries(cargaPorResponsable).map(([usuarioId, cantidad]) => {
    const u = usuarios.find((x) => x.id === usuarioId);
    return { usuarioId, nombre: u ? u.nombre : usuarioId, cantidad };
  }).sort((a, b) => b.cantidad - a.cantidad);

  const criticas = tareas.filter((t) => t.prioridad === 'critica').length;

  return {
    totalTareas: tareas.length,
    tareasPorEstado: porEstado,
    tareasVencidas: vencidas.length,
    detalleVencidas: vencidas.map((t) => ({ id: t.id, titulo: t.titulo, fechaLimite: t.fechaLimite })),
    cargaPorResponsable: cargaResponsables,
    tareasCriticas: criticas,
  };
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerHistorial,
  crear,
  editar,
  cambiarEstado,
  resumen,
  // exportados para tests/uso interno
  estaVencida,
};
