import apiClient from './client';

export async function listarProyectos() {
  const { data } = await apiClient.get('/proyectos');
  return data;
}
