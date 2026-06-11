import { LISTA_ESTADOS, LISTA_PRIORIDADES } from '../utils/constants';
import { RotateCcw } from 'lucide-react';

/**
 * Filtros del listado de tareas (proyecto, responsable, estado, prioridad).
 * Componente presentacional: recibe los valores y notifica cambios al padre,
 * que es quien arma los `params` y dispara la consulta al backend.
 */
export default function FiltrosTareas({
  proyectos,
  usuarios,
  filtros,
  onFiltro,
  onReset,
  hayFiltrosActivos,
}) {
  return (
    <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
      <div className="card__body">
        <div className="filtros">
          <div className="field">
            <label htmlFor="f-proyecto">Proyecto</label>
            <select id="f-proyecto" className="select" value={filtros.proyectoId} onChange={(e) => onFiltro('proyectoId', e.target.value)}>
              <option value="">Todos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} · {p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-responsable">Responsable</label>
            <select id="f-responsable" className="select" value={filtros.responsableId} onChange={(e) => onFiltro('responsableId', e.target.value)}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-estado">Estado</label>
            <select id="f-estado" className="select" value={filtros.estado} onChange={(e) => onFiltro('estado', e.target.value)}>
              <option value="">Todos</option>
              {LISTA_ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-prioridad">Prioridad</label>
            <select id="f-prioridad" className="select" value={filtros.prioridad} onChange={(e) => onFiltro('prioridad', e.target.value)}>
              <option value="">Todas</option>
              {LISTA_PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>&nbsp;</label>
            <button className="btn btn--ghost" onClick={onReset} disabled={!hayFiltrosActivos}>
              <RotateCcw size={16} /> Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
