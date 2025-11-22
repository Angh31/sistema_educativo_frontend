// ====================================
// MODAL DE ANÁLISIS DE ESTUDIANTE CON IA
// ====================================
// Con manejo de rate limit y cooldown

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./StudentAnalysisModal.css";

const StudentAnalysisModal = ({ studentId, studentName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Ref para evitar doble llamada en modo desarrollo
  const hasFetched = useRef(false);

  // Cargar análisis al montar (evita doble llamada)
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadAnalysis();
    }
  }, [studentId]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRateLimited(false);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/ai/analyze-student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(response.data);
      // Iniciar cooldown después de análisis exitoso
      setCooldown(15);
    } catch (err) {
      console.error("Error cargando análisis:", err);

      // Mensaje amigable según el tipo de error
      if (
        err.response?.status === 429 ||
        err.response?.data?.error === "rate_limit"
      ) {
        setError("⏳ Servicio de IA ocupado. Intenta en 1 minuto.");
        setIsRateLimited(true);
        setCooldown(60); // Cooldown más largo si hay rate limit
      } else {
        setError(
          err.response?.data?.message ||
            "Error al cargar análisis. Intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (cooldown > 0) return;
    hasFetched.current = false;
    loadAnalysis();
  };

  // Colores según nivel de riesgo
  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH":
        return "#ef4444";
      case "MEDIUM":
        return "#f59e0b";
      case "LOW":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case "HIGH":
        return "🚨 Alto Riesgo";
      case "MEDIUM":
        return "⚠️ Riesgo Medio";
      case "LOW":
        return "✅ Bajo Riesgo";
      default:
        return "📊 Sin clasificar";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "ALTA":
        return { color: "#ef4444", emoji: "🔴" };
      case "MEDIA":
        return { color: "#f59e0b", emoji: "🟡" };
      case "BAJA":
        return { color: "#10b981", emoji: "🟢" };
      default:
        return { color: "#6b7280", emoji: "⚪" };
    }
  };

  return (
    <div className="analysis-modal-overlay" onClick={onClose}>
      <div className="analysis-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="analysis-modal-header">
          <div className="header-info">
            <h2>🤖 Análisis IA - {studentName || "Estudiante"}</h2>
            <p className="subtitle">Powered by Gemini AI</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="analysis-modal-content">
          {/* Loading */}
          {loading && (
            <div className="analysis-loading">
              <div className="spinner-large"></div>
              <p>🔍 Analizando datos con IA...</p>
              <p className="loading-subtitle">Esto puede tomar unos segundos</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="analysis-error">
              <div className="error-icon">{isRateLimited ? "⏳" : "❌"}</div>
              <h3>
                {isRateLimited
                  ? "Servicio Ocupado"
                  : "Error al cargar análisis"}
              </h3>
              <p>{error}</p>
              {isRateLimited && (
                <p className="rate-limit-hint">
                  💡 Tip: Espera un momento antes de intentar nuevamente
                </p>
              )}
              <button
                className={`btn-retry ${cooldown > 0 ? "disabled" : ""}`}
                onClick={handleRefresh}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `⏱️ Espera ${cooldown}s` : "🔄 Reintentar"}
              </button>
            </div>
          )}

          {/* Data loaded */}
          {data && !loading && !error && (
            <>
              {/* Risk Level Banner */}
              <div
                className="risk-banner"
                style={{
                  backgroundColor: getRiskColor(data.analysis?.risk_level),
                }}
              >
                <span className="risk-label">
                  {getRiskLabel(data.analysis?.risk_level)}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-value">
                    {data.metrics?.average || 0}
                  </div>
                  <div className="metric-label">📊 Promedio</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {data.metrics?.attendance_rate || 0}%
                  </div>
                  <div className="metric-label">✅ Asistencia</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {data.metrics?.absences || 0}
                  </div>
                  <div className="metric-label">❌ Ausencias</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {data.metrics?.courses_enrolled || 0}
                  </div>
                  <div className="metric-label">📚 Cursos</div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="analysis-section">
                <h3>📋 Diagnóstico</h3>
                <p className="diagnosis-text">{data.analysis?.diagnosis}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="two-columns">
                <div className="analysis-section strengths">
                  <h3>💪 Fortalezas</h3>
                  <ul>
                    {data.analysis?.strengths?.map((item, idx) => (
                      <li key={idx}>✅ {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="analysis-section weaknesses">
                  <h3>⚠️ Áreas de Mejora</h3>
                  <ul>
                    {data.analysis?.weaknesses?.map((item, idx) => (
                      <li key={idx}>📌 {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk Factors */}
              {data.analysis?.risk_factors?.length > 0 && (
                <div className="analysis-section risk-factors">
                  <h3>🚨 Factores de Riesgo</h3>
                  <div className="risk-factors-list">
                    {data.analysis.risk_factors.map((factor, idx) => (
                      <span key={idx} className="risk-factor-badge">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="analysis-section recommendations">
                <h3>💡 Recomendaciones</h3>
                <div className="recommendations-list">
                  {data.analysis?.recommendations?.map((rec, idx) => {
                    const priority = getPriorityBadge(rec.priority);
                    return (
                      <div key={idx} className="recommendation-card">
                        <div className="rec-header">
                          <span
                            className="priority-badge"
                            style={{ backgroundColor: priority.color }}
                          >
                            {priority.emoji} {rec.priority}
                          </span>
                          <span className="responsible-badge">
                            👤 {rec.responsible}
                          </span>
                        </div>
                        <p className="rec-action">{rec.action}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Plan */}
              <div className="analysis-section action-plan">
                <h3>📝 Plan de Acción</h3>
                <div className="action-plan-box">
                  <p>{data.analysis?.action_plan}</p>
                </div>
              </div>

              {/* Subjects Performance */}
              {data.subjects?.length > 0 && (
                <div className="analysis-section subjects">
                  <h3>📈 Rendimiento por Materia</h3>
                  <div className="subjects-grid">
                    {data.subjects.map((subject, idx) => (
                      <div key={idx} className="subject-card">
                        <div className="subject-name">{subject.subject}</div>
                        <div
                          className={`subject-grade ${
                            parseFloat(subject.average) >= 60
                              ? "passing"
                              : "failing"
                          }`}
                        >
                          {subject.average}
                        </div>
                        <div className="subject-count">
                          ({subject.count} calificaciones)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="analysis-footer">
                <p className="generated-at">
                  🕐 Generado: {new Date(data.generated_at).toLocaleString()}
                </p>
                <button
                  className={`btn-refresh ${cooldown > 0 ? "disabled" : ""}`}
                  onClick={handleRefresh}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0
                    ? `⏱️ Espera ${cooldown}s`
                    : "🔄 Actualizar Análisis"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysisModal;
