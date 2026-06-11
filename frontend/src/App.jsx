import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Registro from './pages/Registro';
import Tareas from './pages/Tareas';
import TareaDetalle from './pages/TareaDetalle';
import TareaForm from './pages/TareaForm';
import Resumen from './pages/Resumen';
import NotFound from './pages/NotFound';

/**
 * Definición de rutas. Las rutas privadas van envueltas en <ProtectedRoute>
 * y comparten el <Layout> (sidebar + topbar). La ruta comodín * captura
 * cualquier URL no encontrada (404).
 */
export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Privadas (con layout) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/tareas" replace />} />
        <Route path="/tareas" element={<Tareas />} />
        <Route
          path="/tareas/nueva"
          element={
            <ProtectedRoute soloGestion>
              <TareaForm modo="crear" />
            </ProtectedRoute>
          }
        />
        <Route path="/tareas/:id" element={<TareaDetalle />} />
        <Route path="/tareas/:id/editar" element={<TareaForm modo="editar" />} />
        <Route
          path="/resumen"
          element={
            <ProtectedRoute soloGestion>
              <Resumen />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Comodín 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
