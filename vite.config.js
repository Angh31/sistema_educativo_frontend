import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimizaciones de build
    sourcemap: false, // No generar sourcemaps en producción
    minify: "terser", // Minificación con terser
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
      },
    },
    rollupOptions: {
      output: {
        // Separar chunks para mejor caching
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "axios-vendor": ["axios"],
        },
      },
    },
    // Tamaño de chunk warning
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy para desarrollo
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
