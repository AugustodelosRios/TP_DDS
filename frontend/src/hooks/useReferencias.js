import { useEffect, useState } from 'react';
import { listarProyectos } from '../api/proyectos.service';
import { listarUsuarios } from '../api/usuarios.service';

/**
 * Carga (y cachea en memoria) proyectos y usuarios, usados para mostrar
 * nombres y poblar selects. Devuelve helpers de lookup por id.
 */
let cache = null;

export function useReferencias() {
  const [datos, setDatos] = useState(cache || { proyectos: [], usuarios: [] });
  const [cargando, setCargando] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let activo = true;
    (async () => {
      try {
        const [proyectos, usuarios] = await Promise.all([listarProyectos(), listarUsuarios()]);
        cache = { proyectos, usuarios };
        if (activo) setDatos(cache);
      } catch {
        // Silencioso: las páginas muestran sus propios estados de error.
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  const nombreProyecto = (id) => datos.proyectos.find((p) => p.id === id)?.nombre || id;
  const codigoProyecto = (id) => datos.proyectos.find((p) => p.id === id)?.codigo || '';
  const proyectoPorId = (id) => datos.proyectos.find((p) => p.id === id) || null;
  const nombreUsuario = (id) => datos.usuarios.find((u) => u.id === id)?.nombre || id;

  return {
    proyectos: datos.proyectos,
    usuarios: datos.usuarios,
    cargando,
    nombreProyecto,
    codigoProyecto,
    proyectoPorId,
    nombreUsuario,
  };
}

// Permite invalidar la caché si fuese necesario (no usado por ahora).
export function invalidarReferencias() {
  cache = null;
}
