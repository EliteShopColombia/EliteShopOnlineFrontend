import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guard de ruta. Exige sesión iniciada y, opcionalmente, uno de los roles indicados.
 *
 * - Sin sesión: redirige a /login conservando la ruta de origen en el state.
 * - Con sesión pero sin el rol requerido: redirige al inicio (no expone la pantalla).
 */
export default function ProtectedRoute({ children, roles }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
