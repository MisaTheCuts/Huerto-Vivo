const db = require('../config/db');

// POST /api/auth/login
// Busca el usuario por correo y contraseña (texto plano, solo para proyecto académico)
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.telefono, u.activo,
              r.id_rol, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.correo = ? AND u.contrasena = ?`,
      [correo, contrasena]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo, contacta al administrador' });
    }

    // Devuelve datos básicos sin la contraseña
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        correo:     usuario.correo,
        telefono:   usuario.telefono,
        id_rol:     usuario.id_rol,
        rol:        usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { login };
