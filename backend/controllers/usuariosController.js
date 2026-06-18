const db = require('../config/db');

// GET /api/usuarios
// Devuelve todos los usuarios con su rol (sin contraseña)
const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.telefono, u.activo,
              u.fecha_registro, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       ORDER BY u.id_usuario`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getUsuarios };
