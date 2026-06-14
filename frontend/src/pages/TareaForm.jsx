import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { crearTarea, editarTarea, obtenerTarea } from '../api/tareas.service';
import { useReferencias } from '../hooks/useReferencias';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import { LISTA_PRIORIDADES, esGestor } from '../utils/constants';
import { ArrowLeft, Save, AlertCircle, Info } from 'lucide-react';

const VACIO = {
  proyectoId: '',
  titulo: '',
  descripcion: '',
  responsableId: '',
  prioridad: 'media',
  estado: 'pendiente',
  fechaLimite: '',
};

/**
 * Pantalla transaccional de alta/edición de tarea.
 * Confirma la operación contra la API y muestra errores de validación,
 * permisos o recurso inexistente.
 */
export default function TareaForm({ modo }) {
  const esEdicion = modo === 'editar';
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario } = useAuth();
  const { proyectos, usuarios, cargando: cargandoRef } = useReferencias();
  const gestor = esGestor(usuario.rol);

  const [form, setForm] = useState(VACIO);
  const [tareaOriginal, setTareaOriginal] = useState(null);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);

  // En edición, traemos la tarea y precargamos.
  useEffect(() => {
    if (!esEdicion) return;
    (async () => {
      try {
        const t = await obtenerTarea(id);
        setTareaOriginal(t);
        setForm({
          proyectoId: t.proyectoId,
          titulo: t.titulo,
          descripcion: t.descripcion,
          responsableId: t.responsableId,
          prioridad: t.prioridad,
          estado: t.estado,
          fechaLimite: (t.fechaLimite || '').slice(0, 10),
        });
      } catch (err) {
        setErrorApi(err.uiMessage || 'No se pudo cargar la tarea');
      } finally {
        setCargando(false);
      }
    })();
  }, [esEdicion, id]);

  // Solo un gestor puede editar todos los campos; el colaborador responsable
  // únicamente la descripción.
  const soloDescripcion = esEdicion && !gestor;

  // Responsables válidos = todos los usuarios registrados (admin y colaboradores).
  const responsablesDisponibles = useMemo(
    () => [...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [usuarios]
  );

  const proyectoSel = proyectos.find((p) => p.id === form.proyectoId);
  const proyectoBloqueado = proyectoSel && ['pausado', 'finalizado'].includes(proyectoSel.estado);

  const set = (campo) => (e) => {
    const valor = e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
  };

  const validar = () => {
    const e = {};
    if (!soloDescripcion) {
      if (!form.proyectoId) e.proyectoId = 'Seleccioná un proyecto';
      if (!form.titulo.trim()) e.titulo = 'El título es obligatorio';
      if (!form.responsableId) e.responsableId = 'Seleccioná un responsable';
      if (!form.fechaLimite) e.fechaLimite = 'Indicá la fecha límite';
    }
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setErrorApi('');
    if (!validar()) return;
    setGuardando(true);
    try {
      if (esEdicion) {
        // Colaborador: solo descripción. Gestor: todos los campos editables.
        const payload = soloDescripcion
          ? { descripcion: form.descripcion }
          : {
              titulo: form.titulo,
              descripcion: form.descripcion,
              responsableId: form.responsableId,
              prioridad: form.prioridad,
              fechaLimite: form.fechaLimite,
            };
        await editarTarea(id, payload);
        toast.exito('Tarea actualizada');
        navigate(`/tareas/${id}`);
      } else {
        const creada = await crearTarea({
          proyectoId: form.proyectoId,
          titulo: form.titulo,
          descripcion: form.descripcion,
          responsableId: form.responsableId,
          prioridad: form.prioridad,
          estado: form.estado,
          fechaLimite: form.fechaLimite,
        });
        toast.exito('Tarea creada');
        navigate(`/tareas/${creada.id}`);
      }
    } catch (err) {
      setErrorApi(err.uiMessage || 'No se pudo guardar la tarea');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando || cargandoRef) return <Spinner pantallaCompleta texto="Cargando…" />;

  return (
    <div>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--sp-4)' }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="page-head">
        <div>
          <h1>{esEdicion ? 'Editar tarea' : 'Nueva tarea'}</h1>
          <p>
            {esEdicion
              ? 'Modificá los datos de la tarea y confirmá los cambios.'
              : 'Creá una tarea dentro de un proyecto, con responsable válido, prioridad y vencimiento.'}
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        <div className="card__body">
          {errorApi && (
            <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
              <AlertCircle size={18} /> {errorApi}
            </div>
          )}

          {soloDescripcion && (
            <div className="alert alert--info" style={{ marginBottom: 'var(--sp-4)' }}>
              <Info size={18} /> Como colaborador solo podés editar la <strong>descripción</strong> de tu tarea.
            </div>
          )}

          {!esEdicion && proyectoBloqueado && (
            <div className="alert alert--warning" style={{ marginBottom: 'var(--sp-4)' }}>
              <AlertCircle size={18} /> El proyecto seleccionado está <strong>{proyectoSel.estado}</strong>: no se pueden crear tareas nuevas.
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="titulo">Título<span className="req">*</span></label>
                <input
                  id="titulo" className={`input ${errores.titulo ? 'input--error' : ''}`}
                  value={form.titulo} onChange={set('titulo')} disabled={soloDescripcion}
                  placeholder="Ej: Implementar login con JWT"
                />
                {errores.titulo && <span className="field-error"><AlertCircle size={14} /> {errores.titulo}</span>}
              </div>

              <div className="field full">
                <label htmlFor="descripcion">Descripción<span className="req">*</span></label>
                <textarea
                  id="descripcion" className={`textarea ${errores.descripcion ? 'textarea--error' : ''}`}
                  value={form.descripcion} onChange={set('descripcion')}
                  placeholder="Detalle del trabajo esperado"
                />
                {errores.descripcion && <span className="field-error"><AlertCircle size={14} /> {errores.descripcion}</span>}
              </div>

              <div className="field">
                <label htmlFor="proyecto">Proyecto<span className="req">*</span></label>
                <select
                  id="proyecto" className={`select ${errores.proyectoId ? 'select--error' : ''}`}
                  value={form.proyectoId} onChange={set('proyectoId')}
                  disabled={soloDescripcion || esEdicion}
                >
                  <option value="">Seleccionar…</option>
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>{p.codigo} · {p.nombre} ({p.estado})</option>
                  ))}
                </select>
                {esEdicion && <span className="help">El proyecto no se cambia en la edición.</span>}
                {errores.proyectoId && <span className="field-error"><AlertCircle size={14} /> {errores.proyectoId}</span>}
              </div>

              <div className="field">
                <label htmlFor="responsable">Responsable<span className="req">*</span></label>
                <select
                  id="responsable" className={`select ${errores.responsableId ? 'select--error' : ''}`}
                  value={form.responsableId} onChange={set('responsableId')}
                  disabled={soloDescripcion}
                >
                  <option value="">Seleccionar…</option>
                  {responsablesDisponibles.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
                <span className="help">Cualquier usuario registrado puede ser responsable.</span>
                {errores.responsableId && <span className="field-error"><AlertCircle size={14} /> {errores.responsableId}</span>}
              </div>

              <div className="field">
                <label htmlFor="prioridad">Prioridad<span className="req">*</span></label>
                <select id="prioridad" className="select" value={form.prioridad} onChange={set('prioridad')} disabled={soloDescripcion}>
                  {LISTA_PRIORIDADES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="fechaLimite">Fecha límite<span className="req">*</span></label>
                <input
                  id="fechaLimite" type="date" className={`input ${errores.fechaLimite ? 'input--error' : ''}`}
                  value={form.fechaLimite} onChange={set('fechaLimite')} disabled={soloDescripcion}
                />
                {errores.fechaLimite && <span className="field-error"><AlertCircle size={14} /> {errores.fechaLimite}</span>}
              </div>

              {!esEdicion && (
                <div className="field">
                  <label htmlFor="estado">Estado inicial</label>
                  <select id="estado" className="select" value={form.estado} onChange={set('estado')}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En progreso</option>
                  </select>
                  <span className="help">Una tarea nueva arranca pendiente o en progreso.</span>
                </div>
              )}
            </div>

            <div className="row mt-5" style={{ gap: 'var(--sp-3)' }}>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={guardando || (!esEdicion && proyectoBloqueado)}
              >
                <Save size={18} /> {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear tarea'}
              </button>
              <Link to={esEdicion ? `/tareas/${id}` : '/tareas'} className="btn btn--ghost">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
