import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarTareas } from '../api/tareas.service';
import { useReferencias } from '../hooks/useReferencias';
import { useAuth } from '../context/AuthContext';
import { BadgeEstado, BadgePrioridad } from '../components/Badge';
import EstadoVacio from '../components/EstadoVacio';
import Spinner from '../components/Spinner';
import {
  LISTA_ESTADOS,
  LISTA_PRIORIDADES,
  esGestor,
  formatearFecha,
} from '../utils/constants';
import {
  Plus, Search, AlertTriangle, ChevronLeft, ChevronRight, ArrowUpDown, AlertCircle, RotateCcw,
} from 'lucide-react';

const FILTROS_INICIALES = {
  proyectoId: '',
  responsableId: '',
  estado: '',
  prioridad: '',
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  order: 'desc',
};

export default function Tareas() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { proyectos, usuarios, nombreProyecto, nombreUsuario } = useReferencias();
  const gestor = esGestor(usuario.rol);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [data, setData] = useState({ items: [], paginacion: { page: 1, totalPages: 1, total: 0, limit: 10 } });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await listarTareas(filtros);
      setData(res);
    } catch (err) {
      setError(err.uiMessage || 'No se pudieron cargar las tareas');
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const setFiltro = (campo, valor) =>
    setFiltros((f) => ({ ...f, [campo]: valor, page: 1 })); // resetea a página 1 al filtrar

  const cambiarOrden = (campo) => {
    setFiltros((f) => ({
      ...f,
      sortBy: campo,
      order: f.sortBy === campo && f.order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const resetear = () => setFiltros(FILTROS_INICIALES);

  const { paginacion } = data;
  const hayFiltrosActivos = filtros.proyectoId || filtros.responsableId || filtros.estado || filtros.prioridad;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Tareas</h1>
          <p>Listado de tareas con filtros, orden y paginación (resueltos en el backend).</p>
        </div>
        {gestor && (
          <button className="btn btn--primary" onClick={() => navigate('/tareas/nueva')}>
            <Plus size={18} /> Nueva tarea
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="card__body">
          <div className="filtros">
            <div className="field">
              <label htmlFor="f-proyecto">Proyecto</label>
              <select id="f-proyecto" className="select" value={filtros.proyectoId} onChange={(e) => setFiltro('proyectoId', e.target.value)}>
                <option value="">Todos</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.codigo} · {p.nombre}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-responsable">Responsable</label>
              <select id="f-responsable" className="select" value={filtros.responsableId} onChange={(e) => setFiltro('responsableId', e.target.value)}>
                <option value="">Todos</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-estado">Estado</label>
              <select id="f-estado" className="select" value={filtros.estado} onChange={(e) => setFiltro('estado', e.target.value)}>
                <option value="">Todos</option>
                {LISTA_ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-prioridad">Prioridad</label>
              <select id="f-prioridad" className="select" value={filtros.prioridad} onChange={(e) => setFiltro('prioridad', e.target.value)}>
                <option value="">Todas</option>
                {LISTA_PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>&nbsp;</label>
              <button className="btn btn--ghost" onClick={resetear} disabled={!hayFiltrosActivos}>
                <RotateCcw size={16} /> Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {error ? (
          <div className="card__body">
            <div className="alert alert--error" role="alert">
              <AlertCircle size={18} /> {error}
              <button className="btn btn--ghost btn--sm" onClick={cargar} style={{ marginLeft: 'auto' }}>Reintentar</button>
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
            {hayFiltrosActivos && <button className="btn btn--subtle" onClick={resetear}>Limpiar filtros</button>}
          </EstadoVacio>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => cambiarOrden('titulo')}>
                      <span className="row" style={{ gap: 4 }}>Tarea <ArrowUpDown size={13} /></span>
                    </th>
                    <th>Proyecto</th>
                    <th>Responsable</th>
                    <th className="sortable" onClick={() => cambiarOrden('prioridad')}>
                      <span className="row" style={{ gap: 4 }}>Prioridad <ArrowUpDown size={13} /></span>
                    </th>
                    <th>Estado</th>
                    <th className="sortable" onClick={() => cambiarOrden('fechaLimite')}>
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
                    onChange={(e) => setFiltros((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))}
                    aria-label="Tareas por página"
                  >
                    {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} / pág.</option>)}
                  </select>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}
                    disabled={paginacion.page <= 1}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}
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
    </div>
  );
}
