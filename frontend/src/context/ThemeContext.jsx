import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * Contexto de tema (claro / oscuro).
 * - Persiste la preferencia en localStorage (sobrevive a recargas).
 * - Si no hay preferencia guardada, respeta la del sistema operativo.
 * - Aplica el atributo data-theme en <html>, que activa los tokens CSS.
 *
 * El valor inicial se setea también en index.html (script inline) para evitar
 * el parpadeo de tema al cargar la página (FOUC).
 */
const ThemeContext = createContext(null);

const THEME_KEY = 'dds_theme';

function temaInicial() {
  const guardado = localStorage.getItem(THEME_KEY);
  if (guardado === 'light' || guardado === 'dark') return guardado;
  const prefiereOscuro = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefiereOscuro ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem(THEME_KEY, tema);
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
