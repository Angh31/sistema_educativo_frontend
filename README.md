# 🎓 Sistema Educativo — Frontend

Dashboard web para gestión académica — interfaz por rol con control de asistencia, calificaciones y alertas de riesgo estudiantil.

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ¿Qué es?

Interfaz web del sistema de gestión académica. Cada rol tiene su propio dashboard con acceso filtrado — el administrador ve todo, el docente gestiona su curso, el estudiante consulta su progreso y el tutor hace seguimiento.

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Autenticación | JWT (Context API) |

---

## Vistas por rol

| Rol | Vistas disponibles |
|---|---|
| Administrador | Dashboard, Usuarios, Cursos, Reportes, Alertas |
| Docente | Mi curso, Asistencia, Calificaciones, Alertas |
| Estudiante | Mi perfil, Mis notas, Mi asistencia, Horario |
| Padre/Tutor | Seguimiento del estudiante asignado |

---

## Instalación

```bash
git clone https://github.com/Angh31/sistema_educativo_frontend.git
cd sistema_educativo_frontend

npm install

# Configurar URL del backend
cp .env.example .env

npm run dev
```

Acceder en: `http://localhost:5173`

---

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000
```

---

## Estructura

```
sistema_educativo_frontend/
├── src/
│   ├── context/         # AuthContext (sesión JWT)
│   ├── services/        # api.js (Axios)
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Vistas por rol
│   └── App.jsx
├── .env.example
└── package.json
```

---

> API REST disponible en [sistema_educativo_backend](https://github.com/Angh31/sistema_educativo_backend)
