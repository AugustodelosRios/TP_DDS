import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setStoredToken, getStoredToken } from '../api/client';
import * as authService from '../api/auth.service';

/**
 * Contexto de autenticación: conserva usuario + token + rol en el frontend.
 * - Persiste el token en localStorage (sesión sobrevive a recargas).
 * - Al montar, si hay token, revalida el perfil contra /auth/me.
 */
const AuthContext = createContext(null);

const USER_KEY = 'dds_user';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Revalida la sesión al cargar la app.
  useEffect(() => {
    async function revalidar() {
      const token = getStoredToken();
      if (!token) {
        setCargandoSesion(false);
        return;
      }
      try {
        const perfil = await authService.obtenerPerfil();
        setUsuario(perfil);
        localStorage.setItem(USER_KEY, JSON.stringify(perfil));
      } catch {
        // Token inválido/expirado: limpiamos sesión.
        cerrarSesion();
      } finally {
        setCargandoSesion(false);
      }
    }
    revalidar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarSesion = useCallback((data) => {
    setStoredToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }, []);

  const iniciarSesion = useCallback(
    async (email, password) => {
      const data = await authService.login(email, password);
      guardarSesion(data);
      return data.usuario;
    },
    [guardarSesion]
  );

  const registrarse = useCallback(
    async (datos) => {
      const data = await authService.registrar(datos);
      guardarSesion(data);
      return data.usuario;
    },
    [guardarSesion]
  );

  const cerrarSesion = useCallback(() => {
    setStoredToken(null);
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  const value = {
    usuario,
    cargandoSesion,
    estaAutenticado: !!usuario,
    iniciarSesion,
    registrarse,
    cerrarSesion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
