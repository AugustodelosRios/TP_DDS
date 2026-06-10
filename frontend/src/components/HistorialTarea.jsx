import { formatearFecha } from '../utils/constants';
import { useReferencias } from '../hooks/useReferencias';
import { History } from 'lucide-react';

const LABEL_ACCION = {
  creacion: 'Creación',
  edicion: 'Edición',
  reasignacion: 'Reasignación',
  cambio_estado: 'Cambio de estado',
  cambio_prioridad: 'Cambio de prioridad',
  cancelacion: 'Cancelación',
};

/**
 * Muestra un valor de auditoría ({estado: "x"} -> "estado: x") de forma legible.
 */
function describirValor(valor) {
  if (!valor || typeof valor !== 'object') return null;
  return Object.entries(valor).map(([k, v]) => (
    <code key={k}>{k}: {String(v)}</code>
  ));
}

export default function HistorialTarea({ historial }) {
  const { nombreUsuario } = useReferencias();

  if (!historial || historial.length === 0) {
    return <p className="muted text-sm">Sin movimientos registrados todavía.</p>;
  }

  return (
    <div className="timeline">
      {historial.map((h) => (
        <div className="timeline-item" key={h.id}>
          <div className="row row--between">
            <span className="accion">{LABEL_ACCION[h.accion] || h.accion}</span>
            <span className="fecha">{formatearFecha(h.fechaHora, true)}</span>
          </div>
          <div className="cambio">
            Por <strong>{nombreUsuario(h.usuarioId)}</strong>
          </div>
          {(h.valorAnterior || h.valorNuevo) && (
            <div className="cambio" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {describirValor(h.valorAnterior)}
              {h.valorAnterior && h.valorNuevo && <span aria-hidden="true">→</span>}
              {describirValor(h.valorNuevo)}
            </div>
          )}
        </div>
      ))}
      <p className="muted text-sm" style={{ marginTop: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <History size={14} /> {historial.length} movimiento(s) en total.
      </p>
    </div>
  );
}
