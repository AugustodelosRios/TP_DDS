/**
 * Indicador de carga. `pantallaCompleta` lo centra en una zona grande.
 */
export default function Spinner({ pantallaCompleta = false, texto }) {
  if (pantallaCompleta) {
    return (
      <div className="spinner--full">
        <div className="spinner" role="status" aria-label="Cargando" />
        {texto && <div className="txt">{texto}</div>}
      </div>
    );
  }
  return <div className="spinner" role="status" aria-label="Cargando" />;
}
