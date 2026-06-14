/**
 * Etiquetas y metadatos visuales del dominio.
 * Centralizados para mantener consistencia (mismos colores/labels en toda la app).
 */

export const ESTADOS = {
  pendiente: { label: 'Pendiente', tono: 'neutral' },
  en_progreso: { label: 'En progreso', tono: 'info' },
  bloqueada: { label: 'Bloqueada', tono: 'warning' },
  finalizada: { label: 'Finalizada', tono: 'success' },
  cancelada: { label: 'Cancelada', tono: 'muted' },
};

export const PRIORIDADES = {
  baja: { label: 'Baja', tono: 'muted' },
  media: { label: 'Media', tono: 'info' },
  alta: { label: 'Alta', tono: 'warning' },
  critica: { label: 'Crítica', tono: 'danger' },
};

export const ESTADOS_PROYECTO = {
  activo: { label: 'Activo', tono: 'success' },
  pausado: { label: 'Pausado', tono: 'warning' },
  finalizado: { label: 'Finalizado', tono: 'muted' },
};

export const ROLES = {
  admin: 'Administrador',
  colaborador: 'Colaborador',
};

export const ROLES_GESTION = ['admin'];

export const esGestor = (rol) => ROLES_GESTION.includes(rol);

export const LISTA_ESTADOS = Object.entries(ESTADOS).map(([value, v]) => ({ value, label: v.label }));
export const LISTA_PRIORIDADES = Object.entries(PRIORIDADES).map(([value, v]) => ({ value, label: v.label }));

/**
 * Formatea una fecha ISO a un formato legible es-AR. Tolera fechas solo-fecha.
 */
export function formatearFecha(iso, conHora = false) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const opts = conHora
    ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' };
  return d.toLocaleDateString('es-AR', opts);
}
