import apiClient from './client';

export async function listarUsuarios() {
  const { data } = await apiClient.get('/usuarios');
  return data;
}
