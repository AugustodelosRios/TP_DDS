import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Botón para alternar entre modo claro y oscuro.
 * Reutilizable: se usa en la topbar y en las pantallas de auth.
 */
export default function ThemeToggle({ className = '' }) {
  const { tema, alternarTema } = useTheme();
  const oscuro = tema === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={alternarTema}
      aria-label={oscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      {oscuro ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
