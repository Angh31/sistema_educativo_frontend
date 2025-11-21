// ====================================
// PÁGINA DE PERFIL
// ====================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getMyProfile, updateMyProfile } from "../api/profileApi";
import ChangePasswordModal from "../components/ChangePasswordModal";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ===== ESTADOS =====
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    phone: "",
    address: "",
    specialty: "",
    birth_date: "",
    gender: "",
  });

  /**
   * useEffect - Cargar perfil
   */
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * loadProfile
   * ===========
   * Carga el perfil del usuario
   */
  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);

      // Llenar formulario según el rol
      let profileData = {};

      if (data.student) {
        profileData = {
          name: data.student.name || "",
          last_name: data.student.last_name || "",
          phone: data.student.phone || "",
          address: data.student.address || "",
          birth_date: data.student.birth_date
            ? data.student.birth_date.split("T")[0]
            : "",
          gender: data.student.gender || "",
        };
      } else if (data.teacher) {
        profileData = {
          name: data.teacher.name || "",
          last_name: data.teacher.last_name || "",
          phone: data.teacher.phone || "",
          specialty: data.teacher.specialty || "",
        };
      } else if (data.parent) {
        profileData = {
          name: data.parent.name || "",
          last_name: data.parent.last_name || "",
          phone: data.parent.phone || "",
          address: data.parent.address || "",
        };
      }

      setFormData(profileData);
    } catch (error) {
      console.error("Error cargando perfil:", error);
      showToast("Error al cargar perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleChange
   * ============
   * Maneja cambios en los inputs
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * handleSubmit
   * ============
   * Guarda cambios del perfil
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateMyProfile(formData);
      showToast("Perfil actualizado exitosamente", "success");
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      showToast(
        error.response?.data?.error || "Error al actualizar perfil",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * handleCancel
   * ============
   * Cancela la edición
   */
  const handleCancel = () => {
    setEditing(false);
    loadProfile(); // Recargar datos originales
  };

  /**
   * goBack
   * ======
   * Volver al dashboard
   */
  const goBack = () => {
    const roleRoutes = {
      ADMIN: "/admin",
      TEACHER: "/teacher",
      STUDENT: "/student",
      PARENT: "/parent",
    };
    navigate(roleRoutes[user.role]);
  };

  // ===== RENDER: LOADING =====
  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER: PERFIL =====
  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="btn-back" onClick={goBack}>
          ← Volver
        </button>
        <h1>👤 Mi Perfil</h1>
        <button className="btn-danger" onClick={logout}>
          🚪 Cerrar Sesión
        </button>
        <button onClick={() => navigate("/profile")} className="btn-secondary">
          👤 Mi Perfil
        </button>
      </div>

      <div className="profile-container">
        {/* Card de información básica */}
        <div className="profile-card info-card">
          <h2>📧 Información de cuenta</h2>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{profile.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rol:</span>
            <span className="role-badge">{getRoleLabel(profile.role)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Miembro desde:</span>
            <span className="info-value">
              {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Card de datos personales */}
        {user.role !== "ADMIN" && (
          <div className="profile-card data-card">
            <div className="card-header">
              <h2>👨‍💼 Datos personales</h2>
              {!editing && (
                <button
                  className="btn-primary btn-sm"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Editar
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nombre *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="last_name">Apellido *</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {user.role === "STUDENT" && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="birth_date">Fecha de nacimiento</label>
                        <input
                          type="date"
                          id="birth_date"
                          name="birth_date"
                          value={formData.birth_date}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="gender">Género</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="O">Otro</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {user.role === "TEACHER" && (
                    <div className="form-group">
                      <label htmlFor="specialty">Especialidad</label>
                      <input
                        type="text"
                        id="specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                {(user.role === "STUDENT" || user.role === "PARENT") && (
                  <div className="form-group">
                    <label htmlFor="address">Dirección</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-data">
                <div className="data-row">
                  <span className="data-label">Nombre completo:</span>
                  <span className="data-value">
                    {formData.name} {formData.last_name}
                  </span>
                </div>

                {formData.phone && (
                  <div className="data-row">
                    <span className="data-label">Teléfono:</span>
                    <span className="data-value">{formData.phone}</span>
                  </div>
                )}

                {formData.specialty && (
                  <div className="data-row">
                    <span className="data-label">Especialidad:</span>
                    <span className="data-value">{formData.specialty}</span>
                  </div>
                )}

                {formData.address && (
                  <div className="data-row">
                    <span className="data-label">Dirección:</span>
                    <span className="data-value">{formData.address}</span>
                  </div>
                )}

                {formData.birth_date && (
                  <div className="data-row">
                    <span className="data-label">Fecha de nacimiento:</span>
                    <span className="data-value">
                      {new Date(formData.birth_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {formData.gender && (
                  <div className="data-row">
                    <span className="data-label">Género:</span>
                    <span className="data-value">
                      {getGenderLabel(formData.gender)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card de información adicional */}
        {user.role === "STUDENT" && profile.student?.parent && (
          <div className="profile-card">
            <h2>👨‍👩‍👧 Padre/Tutor</h2>
            <div className="data-row">
              <span className="data-label">Nombre:</span>
              <span className="data-value">
                {profile.student.parent.name} {profile.student.parent.last_name}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">Email:</span>
              <span className="data-value">
                {profile.student.parent.user.email}
              </span>
            </div>
            {profile.student.parent.phone && (
              <div className="data-row">
                <span className="data-label">Teléfono:</span>
                <span className="data-value">
                  {profile.student.parent.phone}
                </span>
              </div>
            )}
          </div>
        )}

        {user.role === "PARENT" && profile.parent?.students?.length > 0 && (
          <div className="profile-card">
            <h2>👨‍👩‍👧‍👦 Mis Hijos</h2>
            <div className="children-list">
              {profile.parent.students.map((child) => (
                <div key={child.id} className="child-item">
                  <div className="child-icon">👤</div>
                  <div className="child-info">
                    <h4>
                      {child.name} {child.last_name}
                    </h4>
                    <p>{child.user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card de seguridad */}
        <div className="profile-card security-card">
          <h2>🔒 Seguridad</h2>
          <button
            className="btn-primary btn-block"
            onClick={() => setShowPasswordModal(true)}
          >
            🔑 Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* MODAL DE CAMBIAR CONTRASEÑA */}
      {showPasswordModal && (
        <ChangePasswordModal
          onSuccess={() => {
            setShowPasswordModal(false);
            showToast("Contraseña cambiada exitosamente", "success");
          }}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

// ===== FUNCIONES AUXILIARES =====

const getRoleLabel = (role) => {
  const roles = {
    ADMIN: "Administrador",
    TEACHER: "Docente",
    STUDENT: "Estudiante",
    PARENT: "Padre/Tutor",
  };
  return roles[role] || role;
};

const getGenderLabel = (gender) => {
  const genders = {
    M: "Masculino",
    F: "Femenino",
    O: "Otro",
  };
  return genders[gender] || gender;
};

export default ProfilePage;
