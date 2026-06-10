import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass } from 'lucide-react';

/**
 * Página comodín (404) para rutas no encontradas.
 */
export default function NotFound() {
  const { estaAutenticado } = useAuth();
  return (
    <div className="notfound">
      <div>
        <Compass size={56} style={{ color: 'var(--c-primary)', marginBottom: 'var(--sp-3)' }} />
        <div className="code">404</div>
        <h1>Página no encontrada</h1>
        <p>La ruta que buscás no existe o fue movida.</p>
        <Link to={estaAutenticado ? '/tareas' : '/login'} className="btn btn--primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
