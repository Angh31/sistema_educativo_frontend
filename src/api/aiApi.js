// ====================================
// API DE INTELIGENCIA ARTIFICIAL - CORREGIDO
// ====================================
// Endpoints para predicciones y alertas

import axios from "axios";

const API_URL = "http://localhost:3000/api/ai";

// Obtener token del localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  console.log("Token:", token); // Debug
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Obtener alertas de estudiantes en riesgo
 * @param {string} endpoint - Ruta personalizada (ej: "/alerts", "/alerts/my-children", "/alerts/my-students")
 */
export const getAIAlerts = async (endpoint = "/alerts") => {
  // ✅ CORRECTO: Paréntesis + template literal
  const response = await axios.get(`${API_URL}${endpoint}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Predecir riesgo académico de un estudiante
 * @param {string} studentId - ID del estudiante
 */
export const predictStudentRisk = async (studentId) => {
  // ✅ CORRECTO: Paréntesis + template literal
  const response = await axios.get(`${API_URL}/predict-student/${studentId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Analizar rendimiento de un curso
 * @param {string} courseId - ID del curso
 */
export const analyzeCourse = async (courseId) => {
  // ✅ CORRECTO: Paréntesis + template literal
  const response = await axios.get(`${API_URL}/course-analysis/${courseId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
