// ====================================
// PANEL DE ALERTAS DE IA - CON BOTÓN ANALIZAR
// ====================================
// Muestra estudiantes en riesgo detectados por IA

import { useState, useEffect } from "react";
import { getAIAlerts } from "../api/aiApi";
import { useToast } from "../context/ToastContext";
import "./AIAlertsPanel.css";

const AIAlertsPanel = ({
  endpoint = "/alerts",
  title = "🤖 Alertas de IA",
  onAnalyze = null, // ✅ NUEVO: Callback para analizar estudiante
}) => {
  const { showToast } = useToast();

  // Estados
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  // Cargar alertas al montar o cuando cambie el endpoint
  useEffect(() => {
    loadAlerts();
  }, [endpoint]);

  /**
   * Cargar alertas de IA
   */
  const loadAlerts = async () => {
    try {
      setLoading(true);
      console.log("🔍 Consultando endpoint:", endpoint);

      const data = await getAIAlerts(endpoint);

      console.log("✅ Alertas recibidas:", data);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error("❌ Error cargando alertas:", error);
      showToast("Error al cargar alertas de IA", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener color según nivel de riesgo
   */
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

  /**
   * Obtener emoji según nivel
   */
  const getRiskEmoji = (level) => {
    switch (level) {
      case "HIGH":
        return "🚨";
      case "MEDIUM":
        return "⚠️";
      case "LOW":
        return "✅";
      default:
        return "📊";
    }
  };

  // Render loading
  if (loading) {
    return (
      <div className="ai-alerts-panel">
        <div className="panel-header">
          <h3>{title}</h3>
        </div>
        <div className="panel-loading">
          <div className="spinner"></div>
          <p>Analizando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-alerts-panel">
      {/* Header con toggle */}
      <div className="panel-header" onClick={() => setExpanded(!expanded)}>
        <div className="panel-title">
          <h3>{title}</h3>
          <span className="alerts-count">{alerts.length}</span>
        </div>
        <button className="toggle-btn">{expanded ? "▼" : "▶"}</button>
      </div>

      {/* Contenido expandible */}
      {expanded && (
        <div className="panel-content">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              <div className="success-icon">✅</div>
              <p>¡Excelente! No hay estudiantes en riesgo</p>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div
                  key={alert.student_id}
                  className="alert-item"
                  style={{ borderLeftColor: getRiskColor(alert.risk_level) }}
                >
                  {/* Emoji de riesgo */}
                  <div className="alert-icon">
                    {getRiskEmoji(alert.risk_level)}
                  </div>

                  {/* Información del estudiante */}
                  <div className="alert-info">
                    <h4>{alert.name}</h4>
                    <div className="alert-metrics">
                      <span className="metric">
                        📊 Promedio: <strong>{alert.average || 0}</strong>
                      </span>
                      <span className="metric">
                        ✅ Asistencia:{" "}
                        <strong>{alert.attendance_rate || 0}%</strong>
                      </span>
                    </div>
                    {alert.reason && (
                      <p className="alert-reason">{alert.reason}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="alert-actions">
                    {/* Badge de nivel */}
                    <div
                      className="risk-badge"
                      style={{
                        backgroundColor: getRiskColor(alert.risk_level),
                      }}
                    >
                      {alert.risk_level}
                    </div>

                    {/* ✅ NUEVO: Botón de análisis */}
                    {onAnalyze && (
                      <button
                        className="btn-analyze"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnalyze(alert);
                        }}
                        title="Analizar con IA"
                      >
                        🔍 Analizar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón refrescar */}
          <button className="refresh-btn" onClick={loadAlerts}>
            🔄 Actualizar
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAlertsPanel;
