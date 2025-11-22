// ====================================
// API DE PADRES
// ====================================

import api from "./axiosConfig";

/**
 * getParents
 * ==========
 * Obtiene todos los padres (solo admin)
 */
export const getParents = async () => {
  const res = await api.get("/parents");
  return res.data;
};

/**
 * getParentById
 * =============
 * Obtiene un padre específico con sus hijos
 */
export const getParentById = async (parentId) => {
  const res = await api.get(`/parents/${parentId}`);
  return res.data;
};

/**
 * getChildrenSummary
 * ==================
 * Obtiene resumen de todos los hijos de un padre
 */
export const getChildrenSummary = async (parentId) => {
  const res = await api.get(`/parents/${parentId}/children-summary`);
  return res.data;
};

/**
 * updateParent
 * ============
 * Actualiza información del padre
 */
export const updateParent = async (parentId, data) => {
  const res = await api.put(`/parents/${parentId}`, data);
  return res.data;
};

/**
 * deleteParent
 * ============
 * Elimina un padre
 */
export const deleteParent = async (parentId) => {
  const res = await api.delete(`/parents/${parentId}`);
  return res.data;
};

// Obtener detalles de un hijo específico (para padres)
export const getParentChildDetails = async (studentId) => {
  const response = await api.get(`/parents/child/${studentId}`);
  return response.data;
};
