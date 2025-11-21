// ====================================
// API DE HORARIOS
// ====================================
// Funciones para gestión de horarios de cursos

import api from "./axiosConfig";

/**
 * getSchedules
 * ============
 * Obtiene todos los horarios con filtros opcionales
 * @param {Object} params - Parámetros de consulta
 * @param {string} params.course_id - Filtrar por curso
 * @param {string} params.day_week - Filtrar por día de la semana
 */
export const getSchedules = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await api.get(`/schedules?${queryString}`);
  return res.data;
};

/**
 * getSchedulesByCourse
 * ====================
 * Obtiene todos los horarios de un curso específico
 * @param {string} courseId - ID del curso
 */
export const getSchedulesByCourse = async (courseId) => {
  const res = await api.get(`/schedules/course/${courseId}`);
  return res.data;
};

/**
 * createSchedule
 * ==============
 * Crea un nuevo horario para un curso
 * @param {Object} data - Datos del horario
 * @param {string} data.course_id - ID del curso
 * @param {string} data.day_week - Día de la semana (MONDAY, TUESDAY, etc)
 * @param {string} data.start_time - Hora de inicio (HH:MM)
 * @param {string} data.end_time - Hora de fin (HH:MM)
 * @param {string} data.classroom - Aula (opcional)
 */
export const createSchedule = async (data) => {
  const res = await api.post("/schedules", data);
  return res.data;
};

/**
 * updateSchedule
 * ==============
 * Actualiza un horario existente
 * @param {string} scheduleId - ID del horario
 * @param {Object} data - Datos a actualizar
 */
export const updateSchedule = async (scheduleId, data) => {
  const res = await api.put(`/schedules/${scheduleId}`, data);
  return res.data;
};

/**
 * deleteSchedule
 * ==============
 * Elimina un horario
 * @param {string} scheduleId - ID del horario
 */
export const deleteSchedule = async (scheduleId) => {
  const res = await api.delete(`/schedules/${scheduleId}`);
  return res.data;
};

/**
 * getWeeklySchedule
 * =================
 * Obtiene el horario semanal de todos los cursos
 * Útil para vista de calendario
 */
export const getWeeklySchedule = async () => {
  const res = await api.get("/schedules/weekly");
  return res.data;
};
