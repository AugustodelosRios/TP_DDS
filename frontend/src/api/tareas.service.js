import apiClient from './client';

/**
 * Servicio de tareas. Usa params para filtros/paginación/orden y body en
 * POST/PUT/PATCH. El token lo agrega el interceptor del client.
 */
export async function listarTareas(filtros = {}) {
  // Limpiamos params vacíos para no ensuciar la URL.
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await apiClient.get('/tareas', { params });
  return data; // { items, paginacion }
}

export async function obtenerTarea(id) {
  const { data } = await apiClient.get(`/tareas/${id}`);
  return data;
}

export async function obtenerHistorial(id) {
  const { data } = await apiClient.get(`/tareas/${id}/historial`);
  return data;
}

export async function obtenerResumen() {
  const { data } = await apiClient.get('/tareas/resumen');
  return data;
}

export async function crearTarea(payload) {
  const { data } = await apiClient.post('/tareas', payload);
  return data;
}

export async function editarTarea(id, payload) {
  const { data } = await apiClient.put(`/tareas/${id}`, payload);
  return data;
}

// Transiciones de estado (PATCH).
export async function iniciarTarea(id) {
  const { data } = await apiClient.patch(`/tareas/${id}/iniciar`);
  return data;
}
export async function bloquearTarea(id) {
  const { data } = await apiClient.patch(`/tareas/${id}/bloquear`);
  return data;
}
export async function cancelarTarea(id) {
  const { data } = await apiClient.patch(`/tareas/${id}/cancelar`);
  return data;
}
export async function finalizarTarea(id) {
  const { data } = await apiClient.patch(`/tareas/${id}/finalizar`);
  return data;
}
