import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { esGestor, ROLES } from '../utils/constants';
import { ListChecks, LayoutDashboard, LogOut, Menu, X, CheckSquare } from 'lucide-react';

/**
 * Layout principal de la app autenticada: sidebar de navegación (adaptable a
 * mobile con drawer) + topbar con datos del usuario y logout.
 */
export default function Layout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  const gestor = esGestor(usuario.rol);
  const iniciales = usuario.nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  const cerrarDrawer = () => setAbierto(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${abierto ? 'open' : ''}`}>
        <div className="sidebar__brand">
          <span className="logo"><CheckSquare size={20} /></span>
          <span>TaskFlow DDS</span>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/tareas" className="nav-link" onClick={cerrarDrawer}>
            <ListChecks size={18} /> Tareas
          </NavLink>
          {gestor && (
            <NavLink to="/resumen" className="nav-link" onClick={cerrarDrawer}>
              <LayoutDashboard size={18} /> Resumen
            </NavLink>
          )}
        </nav>

        <div className="sidebar__footer">
          DDS 2026 · Curso 3K4<br />
          Seguimiento de tareas
        </div>
      </aside>

      {/* Backdrop para mobile */}
      <div
        className={`sidebar-backdrop ${abierto ? 'show' : ''}`}
        onClick={cerrarDrawer}
        aria-hidden="true"
      />

      <div className="main">
        <header className="topbar">
          <div className="row">
            <button className="burger" onClick={() => setAbierto((v) => !v)} aria-label="Abrir menú">
              {abierto ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="topbar__title">Gestión de tareas</span>
          </div>

          <div className="topbar__user">
            <div className="user-meta">
              <span className="name">{usuario.nombre}</span>
              <span className="role">{ROLES[usuario.rol] || usuario.rol}</span>
            </div>
            <div className="avatar" title={usuario.email}>{iniciales}</div>
            <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
