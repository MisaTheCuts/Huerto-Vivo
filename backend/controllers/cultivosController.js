const db = require('../config/db');

// GET /api/cultivos
const getCultivos = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id_cultivo, nombre, tipo, dias_cosecha, descripcion
       FROM cultivos
       ORDER BY nombre`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener cultivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getCultivos };
