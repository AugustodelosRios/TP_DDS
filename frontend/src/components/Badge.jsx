import { ESTADOS, PRIORIDADES, ESTADOS_PROYECTO } from '../utils/constants';

/**
 * Badge genérico con punto de color. El color no es el único indicador:
 * siempre va acompañado de texto (accesibilidad).
 */
export function Badge({ tono = 'neutral', children }) {
  return (
    <span className={`badge badge--${tono}`}>
      <span className="dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export function BadgeEstado({ estado }) {
  const meta = ESTADOS[estado] || { label: estado, tono: 'neutral' };
  return <Badge tono={meta.tono}>{meta.label}</Badge>;
}

export function BadgePrioridad({ prioridad }) {
  const meta = PRIORIDADES[prioridad] || { label: prioridad, tono: 'neutral' };
  return <Badge tono={meta.tono}>{meta.label}</Badge>;
}

export function BadgeProyecto({ estado }) {
  const meta = ESTADOS_PROYECTO[estado] || { label: estado, tono: 'neutral' };
  return <Badge tono={meta.tono}>{meta.label}</Badge>;
}
