// ====================================
// API DE PERFIL
// ====================================

import api from "./axiosConfig";

/**
 * getMyProfile
 * ============
 * Obtiene el perfil del usuario autenticado
 */
export const getMyProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

/**
 * updateMyProfile
 * ===============
 * Actualiza el perfil del usuario autenticado
 */
export const updateMyProfile = async (data) => {
  const res = await api.put("/profile", data);
  return res.data;
};

/**
 * changePassword
 * ==============
 * Cambia la contraseña del usuario
 */
export const changePassword = async (data) => {
  const res = await api.put("/profile/password", data);
  return res.data;
};

/**
 * updateEmail
 * ===========
 * Actualiza el email del usuario
 */
export const updateEmail = async (data) => {
  const res = await api.put("/profile/email", data);
  return res.data;
};
