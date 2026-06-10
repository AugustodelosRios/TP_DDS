import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { esGestor } from '../utils/constants';
import Spinner from './Spinner';

/**
 * Protege rutas en el frontend:
 * - Si no hay sesión -> redirige a /login (guardando a dónde quería ir).
 * - Si requiere rol de gestión y el usuario no lo tiene -> /tareas.
 *
 * Esto NO reemplaza la protección del backend; es protección de navegación.
 */
export default function ProtectedRoute({ children, soloGestion = false }) {
  const { estaAutenticado, cargandoSesion, usuario } = useAuth();
  const location = useLocation();

  if (cargandoSesion) {
    return <Spinner pantallaCompleta texto="Cargando sesión…" />;
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (soloGestion && !esGestor(usuario.rol)) {
    return <Navigate to="/tareas" replace />;
  }

  return children;
}
