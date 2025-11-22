// ====================================
// TARJETA DE ESTADO DEL SERVIDOR
// ====================================

import { useState, useEffect } from "react";
import "./ServerStatusCard.css";

const ServerStatusCard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const MCP_URL = "http://localhost:8080";

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      setLoading(true);

      const healthResponse = await fetch(`${MCP_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!healthResponse.ok) {
        throw new Error("MCP Server no disponible");
      }

      const healthData = await healthResponse.json();

      let aiAnalysis = null;
      try {
        const aiResponse = await fetch(`${MCP_URL}/aiops/check-api`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "mi_clave_secreta_123",
          },
        });

        if (aiResponse.ok) {
          aiAnalysis = await aiResponse.json();
        }
      } catch (aiError) {
        console.warn("AIOps no disponible:", aiError);
      }

      let overallStatus = "ok";
      let statusMessage = "Sistema funcionando correctamente";

      if (aiAnalysis) {
        if (aiAnalysis.anomaly === "Sí") {
          overallStatus = "error";
          statusMessage = "Anomalía detectada";
        } else if (aiAnalysis.anomaly === "Potencial") {
          overallStatus = "warning";
          statusMessage = "Posible anomalía";
        }
      }

      setStatus({
        overall: overallStatus,
        message: statusMessage,
        health: healthData,
        aiAnalysis: aiAnalysis,
        mcpConnected: true,
      });

      setLastChecked(new Date());
    } catch (error) {
      console.error("Error verificando servidor:", error);

      setStatus({
        overall: "disconnected",
        message: "MCP Server no disponible",
        mcpConnected: false,
        health: null,
        aiAnalysis: null,
      });

      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (statusType) => {
    switch (statusType) {
      case "ok":
        return {
          icon: "🟢",
          color: "#10b981",
          bgColor: "#ecfdf5",
          label: "Normal",
        };
      case "warning":
        return {
          icon: "🟡",
          color: "#f59e0b",
          bgColor: "#fffbeb",
          label: "Advertencia",
        };
      case "error":
        return {
          icon: "🔴",
          color: "#ef4444",
          bgColor: "#fef2f2",
          label: "Crítico",
        };
      case "disconnected":
        return {
          icon: "⚫",
          color: "#6b7280",
          bgColor: "#f3f4f6",
          label: "Desconectado",
        };
      default:
        return {
          icon: "⚪",
          color: "#9ca3af",
          bgColor: "#f9fafb",
          label: "Desconocido",
        };
    }
  };

  const openGrafana = () => {
    window.open("http://localhost:3001", "_blank");
  };

  if (loading && !status) {
    return (
      <div className="server-status-card">
        <div className="status-header">
          <h3>🖥️ Estado del Servidor</h3>
        </div>
        <div className="status-loading">
          <div className="spinner"></div>
          <p>Verificando estado...</p>
        </div>
      </div>
    );
  }

  const config = getStatusConfig(status?.overall);

  return (
    <div
      className="server-status-card"
      style={{ backgroundColor: config.bgColor }}
    >
      {/* Header */}
      <div className="status-header" onClick={() => setExpanded(!expanded)}>
        <div className="status-title">
          <h3>🖥️ Estado del Servidor</h3>
          <span
            className="status-badge"
            style={{ backgroundColor: config.color }}
          >
            {config.icon} {config.label}
          </span>
        </div>
        <button className="expand-btn">{expanded ? "▼" : "▶"}</button>
      </div>

      {/* Estado principal */}
      <div className="status-main">
        <div className="status-message">
          <span className="status-icon-large">{config.icon}</span>
          <div className="status-text">
            <strong>{status?.message}</strong>
            {lastChecked && (
              <small>
                Última verificación: {lastChecked.toLocaleTimeString()}
              </small>
            )}
          </div>
        </div>

        <div className="status-actions">
          <button
            className="btn-refresh"
            onClick={checkServerStatus}
            disabled={loading}
          >
            {loading ? "⏳" : "🔄"} Verificar
          </button>
          <button className="btn-grafana" onClick={openGrafana}>
            📊 Ver Grafana
          </button>
        </div>
      </div>

      {/* Detalles expandibles */}
      {expanded && (
        <div className="status-details">
          <div className="detail-row">
            <span className="detail-label">MCP Server:</span>
            <span
              className={`detail-value ${
                status?.mcpConnected ? "success" : "error"
              }`}
            >
              {status?.mcpConnected ? "✅ Conectado" : "❌ Desconectado"}
            </span>
          </div>

          {status?.health && (
            <div className="detail-row">
              <span className="detail-label">Servicio:</span>
              <span className="detail-value">
                {status.health.service || "MCP-API"}
              </span>
            </div>
          )}

          {status?.aiAnalysis && (
            <div className="ai-section">
              <h4>🤖 Análisis IA</h4>

              {status.aiAnalysis.api_state && (
                <div className="metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Total Requests</span>
                    <span className="metric-value">
                      {status.aiAnalysis.api_state.total_requests || "N/A"}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Tasa de Errores</span>
                    <span className="metric-value">
                      {status.aiAnalysis.api_state.error_rate?.toFixed(2) ||
                        "0"}
                      %
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Tiempo Respuesta</span>
                    <span className="metric-value">
                      {status.aiAnalysis.api_state.avg_response_time?.toFixed(
                        4
                      ) || "N/A"}
                      s
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Total Errores</span>
                    <span className="metric-value">
                      {status.aiAnalysis.api_state.total_errors || "0"}
                    </span>
                  </div>
                </div>
              )}

              {status.aiAnalysis.explanation && (
                <div className="ai-diagnosis">
                  <strong>Diagnóstico:</strong>
                  <p>{status.aiAnalysis.explanation}</p>
                </div>
              )}
            </div>
          )}

          {!status?.mcpConnected && (
            <div className="mcp-warning">
              ⚠️ Para habilitar el monitoreo, ejecuta:{" "}
              <code>docker-compose up -d</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServerStatusCard;
