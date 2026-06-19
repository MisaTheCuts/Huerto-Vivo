const db = require('../config/db');

// GET /api/siembras?id_parcela=X
// Devuelve las siembras activas (en_crecimiento) de una parcela.
// Sin parámetro devuelve todas.
const getSiembras = async (req, res) => {
  try {
    const { id_parcela } = req.query;

    let query = `
      SELECT s.id_siembra,
             s.id_parcela,
             s.estado,
             s.fecha_siembra,
             cu.nombre AS cultivo,
             p.numero  AS parcela
      FROM siembras s
      JOIN cultivos cu ON s.id_cultivo = cu.id_cultivo
      JOIN parcelas p  ON s.id_parcela = p.id_parcela
    `;
    const params = [];

    if (id_parcela) {
      query += ' WHERE s.id_parcela = ?';
      params.push(id_parcela);
    }

    query += ' ORDER BY s.fecha_siembra DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener siembras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getSiembras };
