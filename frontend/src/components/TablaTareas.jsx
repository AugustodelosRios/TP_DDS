import { useNavigate } from 'react-router-dom';
import { BadgeEstado, BadgePrioridad } from './Badge';
import EstadoVacio from './EstadoVacio';
import Spinner from './Spinner';
import { formatearFecha } from '../utils/constants';
import {
  Search, AlertTriangle, ChevronLeft, ChevronRight, ArrowUpDown, AlertCircle,
} from 'lucide-react';

/**
 * Tabla/listado de tareas con sus estados (carga, vacío, error) y paginación.
 * Componente presentacional: el listado, los filtros y el orden los resuelve
 * el backend; acá solo se muestran los resultados y se notifican interacciones
 * (orden, página, tamaño de página) al padre.
 */
export default function TablaTareas({
  data,
  cargando,
  error,
  filtros,
  hayFiltrosActivos,
  onReintentar,
  onCambiarOrden,
  onReset,
  onCambiarPagina,
  onCambiarLimit,
  nombreProyecto,
  nombreUsuario,
}) {
  const navigate = useNavigate();
  const { paginacion } = data;

  return (
    <div className="card">
      {error ? (
        <div className="card__body">
          <div className="alert alert--error" role="alert">
            <AlertCircle size={18} /> {error}
            <button className="btn btn--ghost btn--sm" onClick={onReintentar} style={{ marginLeft: 'auto' }}>Reintentar</button>
          </div>
        </div>
      ) : cargando ? (
        <div className="card__body"><Spinner pantallaCompleta texto="Cargando tareas…" /></div>
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="No hay tareas para mostrar"
          mensaje={hayFiltrosActivos ? 'Probá ajustar o limpiar los filtros.' : 'Todavía no se crearon tareas.'}
          icon={Search}
        >
          {hayFiltrosActivos && <button className="btn btn--subtle" onClick={onReset}>Limpiar filtros</button>}
        </EstadoVacio>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => onCambiarOrden('titulo')}>
                    <span className="row" style={{ gap: 4 }}>Tarea <ArrowUpDown size={13} /></span>
                  </th>
                  <th>Proyecto</th>
                  <th>Responsable</th>
                  <th className="sortable" onClick={() => onCambiarOrden('prioridad')}>
                    <span className="row" style={{ gap: 4 }}>Prioridad <ArrowUpDown size={13} /></span>
                  </th>
                  <th>Estado</th>
                  <th className="sortable" onClick={() => onCambiarOrden('fechaLimite')}>
                    <span className="row" style={{ gap: 4 }}>Vence <ArrowUpDown size={13} /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/tareas/${t.id}`)}>
                    <td>
                      <div className="td-title">{t.titulo}</div>
                      <div className="td-sub">{t.id}</div>
                    </td>
                    <td className="text-sm">{nombreProyecto(t.proyectoId)}</td>
                    <td className="text-sm">{nombreUsuario(t.responsableId)}</td>
                    <td><BadgePrioridad prioridad={t.prioridad} /></td>
                    <td><BadgeEstado estado={t.estado} /></td>
                    <td className="tabular text-sm">
                      <span className="row" style={{ gap: 6 }}>
                        {t.vencida && <AlertTriangle size={15} style={{ color: 'var(--c-danger)' }} title="Vencida" />}
                        <span style={t.vencida ? { color: 'var(--c-danger)', fontWeight: 600 } : undefined}>
                          {formatearFecha(t.fechaLimite)}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="card__body" style={{ paddingTop: 'var(--sp-3)' }}>
            <div className="pagination">
              <span className="info">
                Mostrando {data.items.length} de {paginacion.total} tareas · Página {paginacion.page} de {paginacion.totalPages}
              </span>
              <div className="controls">
                <select
                  className="select"
                  style={{ width: 'auto', minHeight: 34, padding: '4px 8px' }}
                  value={filtros.limit}
                  onChange={(e) => onCambiarLimit(Number(e.target.value))}
                  aria-label="Tareas por página"
                >
                  {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} / pág.</option>)}
                </select>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => onCambiarPagina(paginacion.page - 1)}
                  disabled={paginacion.page <= 1}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => onCambiarPagina(paginacion.page + 1)}
                  disabled={paginacion.page >= paginacion.totalPages}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
