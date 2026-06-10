import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { obtenerTarea, obtenerHistorial } from '../api/tareas.service';
import { useReferencias } from '../hooks/useReferencias';
import { useAuth } from '../context/AuthContext';
import { BadgeEstado, BadgePrioridad, BadgeProyecto } from '../components/Badge';
import AccionesTarea from '../components/AccionesTarea';
import HistorialTarea from '../components/HistorialTarea';
import Spinner from '../components/Spinner';
import EstadoVacio from '../components/EstadoVacio';
import { formatearFecha } from '../utils/constants';
import {
  ArrowLeft, Calendar, User, FolderKanban, Flag, Activity, AlertTriangle, FileX2, AlertCircle,
} from 'lucide-react';

export default function TareaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { nombreProyecto, codigoProyecto, proyectoPorId, nombreUsuario } = useReferencias();

  const [tarea, setTarea] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const t = await obtenerTarea(id);
      setTarea(t);
      const h = await obtenerHistorial(id);
      setHistorial(h);
    } catch (err) {
      setError(err.uiMessage || 'No se pudo cargar la tarea');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cuando una acción cambia la tarea, refrescamos tarea + historial.
  const onCambioTarea = async (tareaActualizada) => {
    setTarea(tareaActualizada);
    try {
      const h = await obtenerHistorial(id);
      setHistorial(h);
    } catch { /* noop */ }
  };

  if (cargando) return <Spinner pantallaCompleta texto="Cargando tarea…" />;

  if (error) {
    const noEncontrada = /no encontrada/i.test(error);
    return (
      <EstadoVacio
        titulo={noEncontrada ? 'Tarea no encontrada' : 'Error'}
        mensaje={error}
        icon={noEncontrada ? FileX2 : AlertCircle}
      >
        <Link to="/tareas" className="btn btn--subtle"><ArrowLeft size={16} /> Volver a tareas</Link>
      </EstadoVacio>
    );
  }

  const proyecto = proyectoPorId(tarea.proyectoId);

  return (
    <div>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/tareas')} style={{ marginBottom: 'var(--sp-4)' }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="page-head">
        <div>
          <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <h1>{tarea.titulo}</h1>
            {tarea.vencida && (
              <span className="badge badge--vencida"><AlertTriangle size={13} /> Vencida</span>
            )}
          </div>
          <p>{tarea.id} · creada el {formatearFecha(tarea.createdAt, true)}</p>
        </div>
      </div>

      <div className="detalle-grid">
        {/* Columna principal */}
        <div className="card">
          <div className="card__head"><h3>Descripción</h3><BadgeEstado estado={tarea.estado} /></div>
          <div className="card__body">
            <p style={{ color: 'var(--c-text-soft)', lineHeight: 1.6 }}>{tarea.descripcion}</p>
            {tarea.observacion && (
              <div className="alert alert--info mt-4">
                <Activity size={18} /> <strong>Observación administrativa:</strong> {tarea.observacion}
              </div>
            )}

            <div className="card__head" style={{ margin: 'var(--sp-5) calc(-1 * var(--sp-5)) var(--sp-4)', borderTop: '1px solid var(--c-border)' }}>
              <h3>Acciones</h3>
            </div>
            <AccionesTarea tarea={tarea} usuario={usuario} onCambio={onCambioTarea} />
          </div>
        </div>

        {/* Columna lateral: metadatos */}
        <div className="card">
          <div className="card__head"><h3>Detalles</h3></div>
          <div className="card__body">
            <div className="meta-list">
              <div className="meta-item">
                <span className="k"><FolderKanban size={15} /> Proyecto</span>
                <span className="v">{codigoProyecto(tarea.proyectoId) || nombreProyecto(tarea.proyectoId)}</span>
              </div>
              {proyecto && (
                <div className="meta-item">
                  <span className="k">Estado del proyecto</span>
                  <span className="v"><BadgeProyecto estado={proyecto.estado} /></span>
                </div>
              )}
              <div className="meta-item">
                <span className="k"><User size={15} /> Responsable</span>
                <span className="v">{nombreUsuario(tarea.responsableId)}</span>
              </div>
              <div className="meta-item">
                <span className="k"><Flag size={15} /> Prioridad</span>
                <span className="v"><BadgePrioridad prioridad={tarea.prioridad} /></span>
              </div>
              <div className="meta-item">
                <span className="k"><Activity size={15} /> Estado</span>
                <span className="v"><BadgeEstado estado={tarea.estado} /></span>
              </div>
              <div className="meta-item">
                <span className="k"><Calendar size={15} /> Vence</span>
                <span className="v" style={tarea.vencida ? { color: 'var(--c-danger)' } : undefined}>
                  {formatearFecha(tarea.fechaLimite)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="card mt-5">
        <div className="card__head"><h3>Historial de cambios</h3></div>
        <div className="card__body">
          <HistorialTarea historial={historial} />
        </div>
      </div>
    </div>
  );
}
