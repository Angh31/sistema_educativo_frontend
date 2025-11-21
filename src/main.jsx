// ====================================
// PUNTO DE ENTRADA DE LA APLICACIÓN
// ====================================
// Renderiza la aplicación React en el DOM

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ConfirmProvider } from "./context/ConfirmContext";

/**
 * Renderizar la aplicación
 * ========================
 *
 * StrictMode:
 * - Activa verificaciones y advertencias adicionales en desarrollo
 * - No afecta la producción
 * - Ayuda a identificar problemas potenciales
 *
 * createRoot:
 * - API moderna de React 18
 * - Renderiza la app en el elemento con id="root"
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
  </StrictMode>
);
