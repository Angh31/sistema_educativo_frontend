// ====================================
// API DE AUTENTICACIÓN
// ====================================
// Funciones para login, registro y obtención de perfil

import api from "./axiosConfig";

/**
 * login
 * =====
 * Autentica un usuario en el sistema
 *
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña
 * @returns {Promise} Respuesta con token y datos del usuario
 *
 * Ejemplo de uso:
 * const response = await login({ email: "admin@escuela.com", password: "123456" });
 * localStorage.setItem("token", response.data.token);
 */
export const login = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

/**
 * register
 * ========
 * Registra un nuevo usuario en el sistema
 *
 * @param {Object} userData - Datos del nuevo usuario
 * @param {string} userData.email - Email
 * @param {string} userData.password - Contraseña
 * @param {string} userData.role - Rol (ADMIN, TEACHER, STUDENT, PARENT)
 * @param {string} userData.name - Nombre
 * @param {string} userData.last_name - Apellido
 * @returns {Promise} Respuesta con token y datos del usuario creado
 *
 * Nota: Campos adicionales según el rol (birth_date para estudiantes, etc.)
 */
export const register = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

/**
 * getMe
 * =====
 * Obtiene el perfil del usuario autenticado
 *
 * @returns {Promise} Datos completos del usuario
 *
 * Uso:
 * - Validar si el token sigue siendo válido
 * - Obtener datos actualizados del usuario
 * - Cargar perfil al iniciar la aplicación
 */
export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
