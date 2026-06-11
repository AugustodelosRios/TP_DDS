import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { CheckSquare, Eye, EyeOff, AlertCircle, ShieldCheck, Layers, Activity } from 'lucide-react';

export default function Login() {
  const { iniciarSesion, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from?.pathname || '/tareas';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (estaAutenticado) return <Navigate to={destino} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await iniciarSesion(email, password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.uiMessage || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="brand">
          <span className="logo"><CheckSquare size={22} /></span>
          TaskFlow DDS
        </div>
        <div>
          <h2>Seguimiento de tareas de proyectos</h2>
          <p>Coordiná proyectos, responsables, prioridades y estados desde una sola herramienta interna.</p>
          <ul>
            <li><Layers size={18} /> Tareas dentro de proyectos reales</li>
            <li><ShieldCheck size={18} /> Roles y permisos con JWT</li>
            <li><Activity size={18} /> Historial y resumen de avance</li>
          </ul>
        </div>
        <span style={{ color: '#a5b4fc', fontSize: '0.85rem' }}>DDS 2026 · Curso 3K4</span>
      </aside>

      <section className="auth-panel">
        <ThemeToggle className="theme-toggle--floating" />
        <div className="auth-card">
          <h1>Iniciar sesión</h1>
          <p className="sub">Ingresá con tu cuenta para gestionar las tareas.</p>

          {error && (
            <div className="alert alert--error mt-4" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="tu@dds.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="input-group">
                <input
                  id="password"
                  type={verPass ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setVerPass((v) => !v)}
                  aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--block mt-4" disabled={cargando}>
              {cargando ? <span className="spinner" style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} /> : 'Entrar'}
            </button>
          </form>

          <div className="seed-hint">
            <strong>Usuarios de prueba</strong> (contraseña <code>password123</code>):<br />
            Admin: <code>admin@dds.com</code> · Líder: <code>lider@dds.com</code> · Colaborador: <code>mica@dds.com</code>
          </div>

          <p className="auth-switch">
            ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
