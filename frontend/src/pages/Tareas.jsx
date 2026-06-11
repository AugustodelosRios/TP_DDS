import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarTareas } from '../api/tareas.service';
import { useReferencias } from '../hooks/useReferencias';
import { useAuth } from '../context/AuthContext';
import FiltrosTareas from '../components/FiltrosTareas';
import TablaTareas from '../components/TablaTareas';
import { esGestor } from '../utils/constants';
import { Plus } from 'lucide-react';

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

/**
 * Página de listado de tareas. Actúa como contenedor: maneja el estado de los
 * filtros y la consulta al backend, y delega la presentación en componentes
 * separados (FiltrosTareas y TablaTareas). El filtrado/orden/paginación se
 * resuelven en el backend; acá solo se envían params y se muestran resultados.
 */
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

  const cambiarPagina = (page) => setFiltros((f) => ({ ...f, page }));
  const cambiarLimit = (limit) => setFiltros((f) => ({ ...f, limit, page: 1 }));
  const resetear = () => setFiltros(FILTROS_INICIALES);

  const hayFiltrosActivos = filtros.proyectoId || filtros.responsableId || filtros.estado || filtros.prioridad;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Tareas</h1>
          <p>Listado de tareas con filtros, orden y paginación.</p>
        </div>
        {gestor && (
          <button className="btn btn--primary" onClick={() => navigate('/tareas/nueva')}>
            <Plus size={18} /> Nueva tarea
          </button>
        )}
      </div>

      <FiltrosTareas
        proyectos={proyectos}
        usuarios={usuarios}
        filtros={filtros}
        onFiltro={setFiltro}
        onReset={resetear}
        hayFiltrosActivos={hayFiltrosActivos}
      />

      <TablaTareas
        data={data}
        cargando={cargando}
        error={error}
        filtros={filtros}
        hayFiltrosActivos={hayFiltrosActivos}
        onReintentar={cargar}
        onCambiarOrden={cambiarOrden}
        onReset={resetear}
        onCambiarPagina={cambiarPagina}
        onCambiarLimit={cambiarLimit}
        nombreProyecto={nombreProyecto}
        nombreUsuario={nombreUsuario}
      />
    </div>
  );
}
