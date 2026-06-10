import apiClient from './client';

/**
 * Servicio de autenticación. Centraliza las llamadas HTTP de auth para que
 * los componentes no usen Axios directamente.
 */
export async function login(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data; // { usuario, token }
}

export async function registrar({ nombre, email, password }) {
  const { data } = await apiClient.post('/auth/register', { nombre, email, password });
  return data; // { usuario, token }
}

export async function obtenerPerfil() {
  const { data } = await apiClient.get('/auth/me');
  return data.usuario;
}
