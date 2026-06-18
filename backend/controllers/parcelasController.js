const db = require('../config/db');

// GET /api/parcelas
const getParcelas = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id_parcela, p.numero, p.descripcion, p.tamanio_m2, p.estado,
              u.nombre AS vecino
       FROM parcelas p
       LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
       ORDER BY p.numero`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener parcelas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/parcelas/:id
const getParcelaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT p.id_parcela, p.numero, p.descripcion, p.tamanio_m2, p.estado,
              u.nombre AS vecino
       FROM parcelas p
       LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
       WHERE p.id_parcela = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Parcela no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener parcela:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getParcelas, getParcelaById };
