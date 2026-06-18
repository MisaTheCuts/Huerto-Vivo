const db = require('../config/db');

// GET /api/notificaciones
// Acepta query param ?id_usuario=X para filtrar por destinatario
const getNotificaciones = async (req, res) => {
  const { id_usuario } = req.query;
  try {
    let query = `
      SELECT n.id_notificacion, n.titulo, n.mensaje, n.tipo, n.leida, n.fecha_envio,
             u.nombre AS destinatario
      FROM notificaciones n
      JOIN usuarios u ON n.id_usuario = u.id_usuario
    `;
    const params = [];

    if (id_usuario) {
      query += ' WHERE n.id_usuario = ?';
      params.push(id_usuario);
    }

    query += ' ORDER BY n.fecha_envio DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT /api/notificaciones/:id/leida
// Marca una notificación como leída
const marcarLeida = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al actualizar notificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getNotificaciones, marcarLeida };
