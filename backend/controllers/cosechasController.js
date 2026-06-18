const db = require('../config/db');

// GET /api/cosechas
const getCosechas = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id_cosecha, c.fecha, c.cantidad_kg, c.notas,
              u.nombre AS usuario,
              cu.nombre AS cultivo,
              p.numero  AS parcela
       FROM cosechas c
       JOIN usuarios u  ON c.id_usuario   = u.id_usuario
       JOIN siembras s  ON c.id_siembra   = s.id_siembra
       JOIN cultivos cu ON s.id_cultivo   = cu.id_cultivo
       JOIN parcelas p  ON s.id_parcela   = p.id_parcela
       ORDER BY c.fecha DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener cosechas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/cosechas
// Registra una nueva cosecha y actualiza el estado de la siembra a 'cosechado'
const createCosecha = async (req, res) => {
  const { id_siembra, id_usuario, fecha, cantidad_kg, notas } = req.body;

  if (!id_siembra || !id_usuario || !fecha) {
    return res.status(400).json({ error: 'id_siembra, id_usuario y fecha son requeridos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO cosechas (id_siembra, id_usuario, fecha, cantidad_kg, notas) VALUES (?, ?, ?, ?, ?)',
      [id_siembra, id_usuario, fecha, cantidad_kg || null, notas || null]
    );

    // Actualiza el estado de la siembra a cosechado
    await db.query(
      "UPDATE siembras SET estado = 'cosechado' WHERE id_siembra = ?",
      [id_siembra]
    );

    res.status(201).json({
      mensaje: 'Cosecha registrada correctamente',
      id_cosecha: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear cosecha:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getCosechas, createCosecha };
