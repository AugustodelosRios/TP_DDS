import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { CheckSquare, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';

export default function Registro() {
  const { registrarse, estaAutenticado } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', email: '', password: '', password2: '' });
  const [verPass, setVerPass] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [cargando, setCargando] = useState(false);

  if (estaAutenticado) return <Navigate to="/tareas" replace />;

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  // Validación de UX en frontend (la fuente de verdad es el backend).
  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Ingresá tu nombre';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.password2) e.password2 = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setErrorApi('');
    if (!validar()) return;
    setCargando(true);
    try {
      await registrarse({ nombre: form.nombre, email: form.email, password: form.password });
      toast.exito('¡Cuenta creada! Bienvenido/a.');
      navigate('/tareas', { replace: true });
    } catch (err) {
      setErrorApi(err.uiMessage || 'No se pudo registrar');
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
          <h2>Creá tu cuenta</h2>
          <p>Sumate al equipo y empezá a hacer seguimiento de las tareas de tus proyectos.</p>
        </div>
        <span style={{ color: '#a5b4fc', fontSize: '0.85rem' }}>
          Las cuentas nuevas se crean con rol <strong>colaborador</strong>.
        </span>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <h1>Registrarse</h1>
          <p className="sub">Completá tus datos para crear una cuenta de colaborador.</p>

          {errorApi && (
            <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
              <AlertCircle size={18} /> {errorApi}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="nombre">Nombre completo<span className="req">*</span></label>
              <input id="nombre" className={`input ${errores.nombre ? 'input--error' : ''}`} value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" />
              {errores.nombre && <span className="field-error"><AlertCircle size={14} /> {errores.nombre}</span>}
            </div>

            <div className="field">
              <label htmlFor="email">Email<span className="req">*</span></label>
              <input id="email" type="email" className={`input ${errores.email ? 'input--error' : ''}`} value={form.email} onChange={set('email')} placeholder="tu@dds.com" autoComplete="email" />
              {errores.email && <span className="field-error"><AlertCircle size={14} /> {errores.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña<span className="req">*</span></label>
              <div className="input-group">
                <input id="password" type={verPass ? 'text' : 'password'} className={`input ${errores.password ? 'input--error' : ''}`} value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                <button type="button" className="toggle-pass" onClick={() => setVerPass((v) => !v)} aria-label="Mostrar/ocultar contraseña">
                  {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errores.password && <span className="field-error"><AlertCircle size={14} /> {errores.password}</span>}
            </div>

            <div className="field">
              <label htmlFor="password2">Repetir contraseña<span className="req">*</span></label>
              <input id="password2" type={verPass ? 'text' : 'password'} className={`input ${errores.password2 ? 'input--error' : ''}`} value={form.password2} onChange={set('password2')} autoComplete="new-password" />
              {errores.password2 && <span className="field-error"><AlertCircle size={14} /> {errores.password2}</span>}
            </div>

            <button type="submit" className="btn btn--primary btn--block mt-4" disabled={cargando}>
              <UserPlus size={18} /> {cargando ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
