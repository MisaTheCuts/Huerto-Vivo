# Huerto Vivo

Huerto Vivo es una aplicación web para la gestión de un huerto urbano comunitario. Permite gestionar parcelas, riegos, siembras, cosechas, actividades, reportes y participación de vecinos.

---

## Aplicación publicada

| Componente | URL |
|------------|-----|
| Frontend | https://huerto-vivo.vercel.app |
| Backend | https://huerto-vivo-backend.onrender.com |
| Repositorio | https://github.com/MisaTheCuts/Huerto-Vivo |

---

## Arquitectura de despliegue

- **Frontend:** React + Vite desplegado en Vercel.
- **Backend:** Node.js + Express desplegado en Render.
- **Base de datos:** MySQL desplegada en Railway.
- **GitHub** se utiliza para control de versiones y despliegues automáticos.

```
Usuario / Navegador
        ↓
 Frontend en Vercel
        ↓
  Backend en Render
        ↓
Base de datos MySQL en Railway
```

> **Nota sobre el plan gratuito de Render:** el backend puede entrar en reposo tras un período de inactividad. La primera petición puede tardar unos segundos mientras el servidor se reactiva. Esto es normal y no afecta el funcionamiento de la aplicación.

---

## Funcionalidades principales

- Login por rol: coordinadora y vecino.
- Dashboard de coordinadora con estado general del huerto.
- Turnos de riego con alertas de pendientes y atrasados.
- Registro de riego, siembra, cosecha y reporte de problemas.
- Actualización de indicadores en el panel administrador al registrar actividades.
- Gestión de parcelas, actividades y participación vecinal.
- Reinicio de demo para restaurar los turnos de riego del día.

---

## Usuarios de prueba

**Coordinadora (admin)**
- Correo: `carmen@huertovivo.cl`
- Contraseña: `admin123`

**Vecino**
- Correo: `juan@huertovivo.cl` (Para ingresar con otro vecino basta con solo cambiar el nombre antes del @)
- Contraseña: `vecino123`

---

## Ejecución local

### Requisitos previos

- Node.js (v18 o superior)
- MySQL Server (v8 o superior)

### Base de datos

Ejecutar el script de inicialización en MySQL:

```
db/huerto_vivo.sql
```

Esto crea la base de datos `huerto_vivo` con todas las tablas y datos de prueba.

### Backend

```bash
cd backend
npm install
npm run dev
```

El servidor quedará disponible en: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación quedará disponible en: `http://localhost:5173`

---

## Variables de entorno

### `backend/.env`

Crear el archivo basándose en el siguiente ejemplo (sin modificar credenciales reales):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=huerto_vivo
DB_PORT=3306
PORT=3001
```

### `frontend/.env`

Para desarrollo local:

```env
VITE_API_URL=http://localhost:3001
```

En producción, Vercel utiliza la variable de entorno configurada en el panel del proyecto:

```env
VITE_API_URL=https://huerto-vivo-backend.onrender.com
```

---

## Estructura de carpetas

```
Huerto-Vivo/
├── backend/      # API REST con Node.js y Express
├── frontend/     # Interfaz de usuario con React y Vite
├── db/           # Script SQL para crear e inicializar la base de datos
└── docs/         # Documentación y recursos del proyecto
```

---

## Nota

Este proyecto fue desarrollado con asistencia de inteligencia artificial (Claude Code) como parte de una actividad académica.
