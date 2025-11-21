// ====================================
// COMPONENTE DE RUTA PROTEGIDA
// ====================================
// Protege rutas que requieren autenticación y roles específicos

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * ==============
 * Componente que protege rutas según autenticación y roles
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Componente a renderizar si está autorizado
 * @param {Array<string>} props.allowedRoles - Roles permitidos (opcional)
 *
 * Flujo:
 * 1. Verificar si el usuario está autenticado
 * 2. Si no está autenticado → redirigir a /login
 * 3. Si está autenticado pero no tiene el rol → redirigir a /unauthorized
 * 4. Si todo está bien → renderizar el componente hijo
 *
 * Ejemplo de uso:
 * <ProtectedRoute allowedRoles={["ADMIN"]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Obtener usuario del contexto
  const { user, isAuthenticated } = useAuth();

  // ===== VALIDACIÓN 1: AUTENTICACIÓN =====
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ===== VALIDACIÓN 2: ROLES =====
  // Si se especificaron roles permitidos, verificar que el usuario tenga uno
  if (allowedRoles && allowedRoles.length > 0) {
    // Verificar si el rol del usuario está en la lista de roles permitidos
    const hasPermission = allowedRoles.includes(user.role);

    // Si no tiene permiso, redirigir a página de no autorizado
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ===== TODO OK: RENDERIZAR COMPONENTE =====
  return children;
};

export default ProtectedRoute;
