// ====================================
// APLICACIÓN PRINCIPAL - APP.JSX
// ====================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import ProfilePage from "./pages/ProfilePage";
import Unauthorized from "./pages/Unauthorized";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Ruta pública: Login */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas por rol */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["TEACHER"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={["PARENT"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* NUEVA RUTA: Gestión de Inscripciones (solo admin) */}
            <Route
              path="/enrollments"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <EnrollmentsPage />
                </ProtectedRoute>
              }
            />

            {/* RUTA: Perfil de Usuario (todos los roles) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "TEACHER", "STUDENT", "PARENT"]}
                >
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Ruta de no autorizado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Ruta por defecto: redirigir a login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Ruta 404: redirigir a login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
