// ====================================
// CONTEXT DE AUTENTICACIÓN
// ====================================
// Maneja el estado global de autenticación en toda la app

import { createContext, useState, useEffect, useContext } from "react";
import { login as loginApi, getMe } from "../api/authApi";

// Crear contexto
const AuthContext = createContext();

/**
 * AuthProvider
 * ============
 * Proveedor del contexto de autenticación
 *
 * Responsabilidades:
 * - Mantener estado del usuario autenticado
 * - Proporcionar funciones de login/logout
 * - Validar token al cargar la aplicación
 * - Proveer estado de carga
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Componentes hijos
 */
export const AuthProvider = ({ children }) => {
  // ===== ESTADOS =====

  // Usuario autenticado (null si no hay sesión)
  const [user, setUser] = useState(null);

  // Estado de carga (true mientras valida token)
  const [loading, setLoading] = useState(true);

  /**
   * useEffect inicial
   * =================
   * Se ejecuta al montar el componente
   *
   * Propósito:
   * - Verificar si hay token guardado
   * - Validar el token con el backend
   * - Cargar datos del usuario
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * checkAuth
   * =========
   * Verifica si hay una sesión activa
   *
   * Flujo:
   * 1. Buscar token en localStorage
   * 2. Si existe, llamar a /api/auth/me
   * 3. Si es válido, establecer usuario
   * 4. Si falló, limpiar localStorage
   */
  const checkAuth = async () => {
    try {
      // Buscar token guardado
      const token = localStorage.getItem("token");

      if (token) {
        // Validar token con el backend
        const userData = await getMe();

        // Establecer usuario en el estado
        setUser(userData);
      }
    } catch (error) {
      // Token inválido o expirado
      console.error("Error verificando autenticación:", error);

      // Limpiar datos de autenticación
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      // Terminar carga (mostrar UI)
      setLoading(false);
    }
  };

  /**
   * login
   * =====
   * Autentica un usuario
   *
   * @param {Object} credentials - Email y password
   * @returns {Promise<Object>} Datos del usuario autenticado
   *
   * Flujo:
   * 1. Llamar a API de login
   * 2. Guardar token en localStorage
   * 3. Guardar datos del usuario en estado
   * 4. Retornar datos del usuario
   */
  const login = async (credentials) => {
    try {
      // Llamar API de login
      const data = await loginApi(credentials);

      // Guardar token en localStorage (persistencia)
      localStorage.setItem("token", data.token);

      // Guardar usuario en localStorage (opcional, para referencia rápida)
      localStorage.setItem("user", JSON.stringify(data));

      // Establecer usuario en el estado
      setUser(data);

      return data;
    } catch (error) {
      // Propagar error para manejarlo en el componente
      throw error;
    }
  };

  /**
   * logout
   * ======
   * Cierra la sesión del usuario
   *
   * Flujo:
   * 1. Limpiar localStorage
   * 2. Limpiar estado del usuario
   * 3. Redirigir al login (manejado por el componente)
   */
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Limpiar estado
    setUser(null);
  };

  /**
   * updateUser
   * ==========
   * Actualiza los datos del usuario en el estado
   *
   * @param {Object} newData - Nuevos datos del usuario
   *
   * Uso: Después de actualizar el perfil
   */
  const updateUser = (newData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newData,
    }));

    // También actualizar en localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        ...newData,
      })
    );
  };

  // ===== VALOR DEL CONTEXTO =====
  // Todo lo que se expone a los componentes hijos
  const value = {
    user, // Usuario autenticado (null si no hay sesión)
    loading, // Estado de carga
    login, // Función para iniciar sesión
    logout, // Función para cerrar sesión
    updateUser, // Función para actualizar usuario
    isAuthenticated: !!user, // Boolean: true si hay usuario
  };

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.5rem",
        }}
      >
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
        <span style={{ marginLeft: "1rem" }}>Cargando...</span>
      </div>
    );
  }

  // Proveer contexto a los hijos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth
 * =======
 * Hook personalizado para acceder al contexto de autenticación
 *
 * @returns {Object} Contexto de autenticación
 *
 * Uso en componentes:
 * const { user, login, logout } = useAuth();
 *
 * Ventaja: Simplifica el acceso al contexto y valida que esté dentro del Provider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Validar que el hook se use dentro del Provider
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};
