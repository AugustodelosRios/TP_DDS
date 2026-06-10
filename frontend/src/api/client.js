import axios from 'axios';

/**
 * Instancia central de Axios.
 * - baseURL configurable por variable de entorno (cae a /api con proxy Vite).
 * - Interceptor de request: agrega el header Authorization: Bearer <token>.
 * - Interceptor de response: normaliza el mensaje de error de la API para
 *   que los componentes muestren algo comprensible.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'dds_token';

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Request: inyecta el token en cada llamada protegida.
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: extrae el mensaje de error de la API ({ error: "..." }).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error.response?.data?.error;
    const status = error.response?.status;

    let mensaje = apiMessage;
    if (!mensaje) {
      if (error.code === 'ERR_NETWORK') {
        mensaje = 'No se pudo conectar con el servidor. ¿El backend está corriendo?';
      } else {
        mensaje = 'Ocurrió un error inesperado';
      }
    }

    // Adjuntamos info útil para los componentes.
    error.uiMessage = mensaje;
    error.status = status;
    return Promise.reject(error);
  }
);

export default apiClient;
