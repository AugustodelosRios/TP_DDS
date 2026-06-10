import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

/**
 * Sistema de notificaciones (toasts) para feedback de éxito/error.
 * Se auto-descartan a los ~3.5s. aria-live para lectores de pantalla.
 */
const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (mensaje, tipo = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, mensaje, tipo }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const value = {
    exito: (m) => notify(m, 'success'),
    error: (m) => notify(m, 'error'),
    info: (m) => notify(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => {
          const Icon = ICONS[t.tipo] || Info;
          return (
            <div key={t.id} className={`toast toast--${t.tipo}`} role="status">
              <Icon size={18} />
              <span>{t.mensaje}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
