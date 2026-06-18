# Huerto Vivo

Aplicación web para la gestión de un huerto urbano comunitario. Permite organizar parcelas, turnos de riego, siembras, cosechas, reportes de problemas, comunidad de vecinos y notificaciones, reemplazando la coordinación informal por WhatsApp.

---

## Roles del sistema

| Rol | Usuario | Correo |
|-----|---------|--------|
| Coordinadora (admin) | Carmen López | carmen@huertovivo.cl |
| Vecino | Juan Contreras | juan@huertovivo.cl |

---

## Funcionalidades principales

- Login con acceso por rol (admin / vecino)
- Dashboard del administrador con estado general del huerto
- Resumen de cosecha del mes y reparto comunitario
- Participación vecinal y ranking de actividad
- Turnos de riego con estado (pendiente / cumplido / atrasado)
- Reinicio de turnos demo para presentaciones
- Vista de parcela del vecino con indicadores de riego
- Registro de riego, siembra, cosecha y reporte de problemas
- Directorio de comunidad con 18 vecinos
- Notificaciones por usuario
- Ajustes de perfil y preferencias

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

## Requisitos

- Node.js (v18 o superior)
- MySQL Server (v8 o superior)
- MySQL Workbench *(opcional, para explorar la base de datos)*
- Visual Studio Code *(recomendado)*

---

## Configuración de la base de datos

1. Abrir MySQL Workbench o el cliente MySQL de preferencia.
2. Ejecutar el script:

```
db/huerto_vivo.sql
```

Esto crea la base de datos `huerto_vivo` con todas las tablas y datos de prueba.

---

## Configuración del backend

Dentro de la carpeta `/backend`, crear un archivo `.env` usando `.env.example` como base:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=huerto_vivo
DB_PORT=3306
PORT=3001
```

---

## Ejecutar el backend

```bash
cd backend
npm install
npm run dev
```

El servidor quedará disponible en: `http://localhost:3001`

---

## Ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación quedará disponible en: `http://localhost:5173`

---

## Usuarios de prueba

**Coordinadora (admin)**
- Correo: `carmen@huertovivo.cl`
- Contraseña: `admin123`

**Vecino**
- Correo: `juan@huertovivo.cl`
- Contraseña: `vecino123`

---

## Flujo de prueba sugerido

1. Ingresar como **vecino** (Juan Contreras)
2. Marcar el turno de riego del día como cumplido
3. Registrar una cosecha desde "Mi Parcela"
4. Cerrar sesión
5. Ingresar como **coordinadora** (Carmen López)
6. Verificar que el dashboard refleja los cambios
7. Usar el botón **Reiniciar demo** para restaurar los turnos del día

---

## Nota

Este proyecto fue desarrollado con asistencia de inteligencia artificial (ChatGPT y Claude Code) como parte de una actividad académica.
