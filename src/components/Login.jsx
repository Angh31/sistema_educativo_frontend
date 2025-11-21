// ====================================
// COMPONENTE DE LOGIN CON REGISTRO
// ====================================

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../api/authApi";
import { useState, useEffect } from "react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();

  // Si ya está logueado, redirigir automáticamente
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = {
        ADMIN: "/admin",
        TEACHER: "/teacher",
        STUDENT: "/student",
        PARENT: "/parent",
      };
      navigate(roleRoutes[user.role] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ===== ESTADOS =====
  const [isRegistering, setIsRegistering] = useState(false); // Toggle login/register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  /**
   * handleLogin
   * ===========
   * Maneja el inicio de sesión
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const userData = await login({ email, password });

      // Redirigir según el rol
      switch (userData.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "TEACHER":
          navigate("/teacher");
          break;
        case "STUDENT":
          navigate("/student");
          break;
        case "PARENT":
          navigate("/parent");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError(
        err.response?.data?.message ||
          "Credenciales incorrectas. Verifica tu email y contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleRegister
   * ==============
   * Maneja el registro de nuevo usuario con validaciones mejoradas
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ===== VALIDACIONES =====

    // Validar campos obligatorios
    if (!email || !password || !name || !lastName) {
      setError("Por favor, completa todos los campos obligatorios");
      return;
    }

    // Validar formato de email con regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido");
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Validar que la contraseña tenga al menos un número
    if (!/\d/.test(password)) {
      setError("La contraseña debe contener al menos un número");
      return;
    }

    // Validar nombres (solo letras y espacios)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name) || !nameRegex.test(lastName)) {
      setError("Los nombres solo pueden contener letras");
      return;
    }

    setLoading(true);

    try {
      // Preparar datos según el rol
      const userData = {
        email: email.toLowerCase().trim(), // Normalizar email
        password,
        role,
        name: name.trim(),
        last_name: lastName.trim(),
      };

      // Campos adicionales para estudiantes
      if (role === "STUDENT") {
        userData.birth_date = "2000-01-01"; // Cambiar por date picker real
        userData.gender = "M"; // Cambiar por selector real
      }

      // Campos adicionales para docentes
      if (role === "TEACHER") {
        userData.specialty = "General";
      }

      await registerApi(userData);

      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");

      // Limpiar formulario
      setTimeout(() => {
        setIsRegistering(false);
        setEmail("");
        setPassword("");
        setName("");
        setLastName("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error en registro:", err);
      setError(
        err.response?.data?.message ||
          "Error al registrarse. El email puede estar en uso."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * toggleMode
   * ==========
   * Cambia entre login y registro
   */
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setName("");
    setLastName("");
  };

  // ===== RENDER =====
  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h2 className="login-title">
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
          </h2>
          <p className="login-subtitle">Sistema Académico Digital</p>
        </div>

        {/* Formulario de LOGIN */}
        {!isRegistering && (
          <form onSubmit={handleLogin} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                📧 Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                🔒 Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
        )}

        {/* Formulario de REGISTRO */}
        {isRegistering && (
          <form onSubmit={handleRegister} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="register-email" className="form-label">
                📧 Correo electrónico *
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            {/* Nombre */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                👤 Nombre *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="form-input"
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
                title="Solo letras permitidas"
              />
            </div>

            {/* Apellido */}
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                👤 Apellido *
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Tu apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                className="form-input"
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
                title="Solo letras permitidas"
              />
            </div>

            {/* Rol */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                🎭 Rol *
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="form-input"
              >
                <option value="STUDENT">Estudiante</option>
                <option value="TEACHER">Docente</option>
                <option value="PARENT">Padre/Tutor</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="register-password" className="form-label">
                🔒 Contraseña *
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="Mínimo 6 caracteres con un número"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input"
                minLength={6}
              />
              <small className="form-hint">
                Debe tener al menos 6 caracteres y un número
              </small>
            </div>

            {/* Success */}
            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>
        )}

        {/* Footer - Toggle entre login/registro */}
        <div className="login-footer">
          <p className="text-muted">
            {isRegistering ? (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={toggleMode}
                  disabled={loading}
                >
                  Inicia sesión aquí
                </button>
              </>
            ) : (
              <>
                ¿Primera vez?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={toggleMode}
                  disabled={loading}
                >
                  Regístrate aquí
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
