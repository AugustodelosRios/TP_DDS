import { Inbox } from 'lucide-react';

/**
 * Estado vacío reutilizable (sin resultados / sin datos).
 */
export default function EstadoVacio({ titulo = 'Sin resultados', mensaje, icon: Icon = Inbox, children }) {
  return (
    <div className="state-box">
      <Icon className="icon" aria-hidden="true" />
      <h3>{titulo}</h3>
      {mensaje && <p>{mensaje}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
