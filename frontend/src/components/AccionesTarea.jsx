import { useState } from 'react';
import {
  iniciarTarea, bloquearTarea, cancelarTarea, finalizarTarea,
} from '../api/tareas.service';
import { useToast } from './Toast';
import { esGestor } from '../utils/constants';
import { Play, Ban, XCircle, CheckCircle2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Acciones de cambio de estado visibles según rol/propiedad.
 *
 * Reglas (espejadas con el backend, que es la fuente de verdad):
 *  - iniciar / bloquear: responsable (colaborador) o gestor.
 *  - finalizar / cancelar: solo gestor (admin/líder).
 * Las transiciones inválidas se ocultan según el estado actual.
 */
export default function AccionesTarea({ tarea, usuario, onCambio }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [enProceso, setEnProceso] = useState(null);

  const gestor = esGestor(usuario.rol);
  const esResponsable = tarea.responsableId === usuario.id;
  const puedeOperar = gestor || esResponsable;

  const estado = tarea.estado;
  const terminal = estado === 'finalizada' || estado === 'cancelada';

  const ejecutar = async (clave, fn, mensajeOk) => {
    setEnProceso(clave);
    try {
      const actualizada = await fn(tarea.id);
      toast.exito(mensajeOk);
      onCambio(actualizada);
    } catch (err) {
      toast.error(err.uiMessage || 'No se pudo completar la acción');
    } finally {
      setEnProceso(null);
    }
  };

  // Botones disponibles según transiciones permitidas.
  const acciones = [];

  // iniciar: desde pendiente o bloqueada (responsable o gestor)
  if (['pendiente', 'bloqueada'].includes(estado) && puedeOperar) {
    acciones.push({
      clave: 'iniciar', label: 'Iniciar', icon: Play, clase: 'btn--success',
      fn: iniciarTarea, ok: 'Tarea iniciada (en progreso)',
    });
  }
  // bloquear: desde en_progreso (responsable o gestor)
  if (estado === 'en_progreso' && puedeOperar) {
    acciones.push({
      clave: 'bloquear', label: 'Bloquear', icon: Ban, clase: 'btn--warning',
      fn: bloquearTarea, ok: 'Tarea bloqueada',
    });
  }
  // finalizar: desde en_progreso (solo gestor)
  if (estado === 'en_progreso' && gestor) {
    acciones.push({
      clave: 'finalizar', label: 'Finalizar', icon: CheckCircle2, clase: 'btn--primary',
      fn: finalizarTarea, ok: 'Tarea finalizada',
    });
  }
  // cancelar: cualquier no terminal (solo gestor)
  if (!terminal && gestor) {
    acciones.push({
      clave: 'cancelar', label: 'Cancelar', icon: XCircle, clase: 'btn--danger',
      fn: cancelarTarea, ok: 'Tarea cancelada', confirmar: true,
    });
  }

  const onClick = (a) => {
    if (a.confirmar && !window.confirm(`¿Seguro que querés ${a.label.toLowerCase()} esta tarea? Esta acción no se puede deshacer.`)) {
      return;
    }
    ejecutar(a.clave, a.fn, a.ok);
  };

  const puedeEditar = gestor || (esResponsable && !terminal);

  return (
    <div>
      <div className="acciones-tarea">
        {acciones.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.clave}
              className={`btn ${a.clase} btn--sm`}
              onClick={() => onClick(a)}
              disabled={enProceso !== null}
            >
              <Icon size={16} /> {enProceso === a.clave ? '…' : a.label}
            </button>
          );
        })}

        {puedeEditar && (
          <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/tareas/${tarea.id}/editar`)}>
            <Pencil size={16} /> Editar
          </button>
        )}
      </div>

      {terminal && (
        <p className="muted text-sm mt-4">
          Esta tarea está <strong>{estado}</strong>. No admite más cambios de estado.
        </p>
      )}
      {!puedeOperar && !gestor && !terminal && (
        <p className="muted text-sm mt-4">
          Solo el responsable o un admin/líder pueden operar esta tarea.
        </p>
      )}
    </div>
  );
}
