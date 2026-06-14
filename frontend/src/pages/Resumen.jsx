import { useEffect, useState } from 'react';
import { obtenerResumen } from '../api/tareas.service';
import Spinner from '../components/Spinner';
import { ESTADOS } from '../utils/constants';
import {
  ListTodo, AlertTriangle, Flame, CheckCircle2, Users, AlertCircle, BarChart3,
} from 'lucide-react';

/**
 * Panel resumen para administración (ruta protegida por rol).
 * Muestra: tareas por estado, vencidas, carga por responsable y críticas.
 */
export default function Resumen() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setData(await obtenerResumen());
      } catch (err) {
        setError(err.uiMessage || 'No se pudo cargar el resumen');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <Spinner pantallaCompleta texto="Cargando resumen…" />;
  if (error) {
    return (
      <div className="alert alert--error" role="alert">
        <AlertCircle size={18} /> {error}
      </div>
    );
  }

  const maxCarga = Math.max(1, ...data.cargaPorResponsable.map((c) => c.cantidad));
  const maxEstado = Math.max(1, ...Object.values(data.tareasPorEstado));

  const stats = [
    { lbl: 'Tareas totales', num: data.totalTareas, icon: ListTodo, bg: 'var(--c-primary-soft)', fg: 'var(--c-primary)' },
    { lbl: 'Tareas vencidas', num: data.tareasVencidas, icon: AlertTriangle, bg: 'var(--c-danger-bg)', fg: 'var(--c-danger)' },
    { lbl: 'Prioridad crítica', num: data.tareasCriticas, icon: Flame, bg: 'var(--c-warning-bg)', fg: 'var(--c-warning)' },
    { lbl: 'Finalizadas', num: data.tareasPorEstado.finalizada || 0, icon: CheckCircle2, bg: 'var(--c-success-bg)', fg: 'var(--c-success)' },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Resumen administrativo</h1>
          <p>Información agregada del avance de las tareas. Acceso restringido a admin.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className="card stat-card" key={s.lbl}>
              <div className="ic" style={{ background: s.bg, color: s.fg }}><Icon size={24} /></div>
              <div>
                <div className="num tabular">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="resumen-grid">
        {/* Tareas por estado */}
        <div className="card">
          <div className="card__head"><h3><span className="row" style={{ gap: 8 }}><BarChart3 size={18} /> Tareas por estado</span></h3></div>
          <div className="card__body">
            {Object.entries(data.tareasPorEstado).map(([estado, cantidad]) => {
              const meta = ESTADOS[estado] || { label: estado, tono: 'neutral' };
              return (
                <div className="bar-row" key={estado}>
                  <span className="name">{meta.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(cantidad / maxEstado) * 100}%`,
                        background: `var(--c-${meta.tono === 'neutral' ? 'border-strong' : meta.tono === 'muted' ? 'text-muted' : meta.tono})`,
                      }}
                    />
                  </div>
                  <span className="val">{cantidad}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carga por responsable */}
        <div className="card">
          <div className="card__head"><h3><span className="row" style={{ gap: 8 }}><Users size={18} /> Carga por responsable</span></h3></div>
          <div className="card__body">
            {data.cargaPorResponsable.length === 0 ? (
              <p className="muted text-sm">No hay tareas activas asignadas.</p>
            ) : (
              data.cargaPorResponsable.map((c) => (
                <div className="bar-row" key={c.usuarioId}>
                  <span className="name" title={c.nombre}>{c.nombre}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(c.cantidad / maxCarga) * 100}%` }} />
                  </div>
                  <span className="val">{c.cantidad}</span>
                </div>
              ))
            )}
            <p className="muted text-sm" style={{ marginTop: 'var(--sp-3)' }}>
              Cuenta solo tareas activas (no finalizadas ni canceladas).
            </p>
          </div>
        </div>
      </div>

      {/* Detalle de vencidas */}
      {data.detalleVencidas.length > 0 && (
        <div className="card mt-5">
          <div className="card__head"><h3><span className="row" style={{ gap: 8, color: 'var(--c-danger)' }}><AlertTriangle size={18} /> Tareas vencidas</span></h3></div>
          <div className="card__body">
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>ID</th><th>Título</th><th>Vencía</th></tr></thead>
                <tbody>
                  {data.detalleVencidas.map((t) => (
                    <tr key={t.id} style={{ cursor: 'default' }}>
                      <td className="text-sm">{t.id}</td>
                      <td className="td-title">{t.titulo}</td>
                      <td className="tabular text-sm" style={{ color: 'var(--c-danger)' }}>{t.fechaLimite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
