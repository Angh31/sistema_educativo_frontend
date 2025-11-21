// ====================================
// PÁGINA DE NO AUTORIZADO
// ====================================
// Se muestra cuando el usuario no tiene permisos

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Unauthorized.css";

/**
 * Unauthorized
 * ============
 * Página que se muestra cuando el usuario intenta acceder
 * a una ruta para la que no tiene permisos
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /**
   * handleGoBack
   * ============
   * Redirige según el rol del usuario
   */
  const handleGoBack = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Redirigir según rol
    switch (user.role) {
      case "ADMIN":
        navigate("/admin");
        break;
      case "TEACHER":
        navigate("/teacher");
        break;
      case "STUDENT":
        navigate("/student");
        break;
      case "PARENT":
        navigate("/parent");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🚫</div>
        <h1>Acceso Denegado</h1>
        <p className="unauthorized-message">
          No tienes permisos para acceder a esta página.
        </p>
        <div className="unauthorized-actions">
          <button className="btn-primary" onClick={handleGoBack}>
            ← Volver al inicio
          </button>
          <button className="btn-danger" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
