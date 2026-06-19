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
// Recibe id_cultivo + id_parcela (no id_siembra).
// Resuelve internamente el FK a siembras: busca una siembra existente para esa
// parcela+cultivo o crea una nueva de referencia para no romper la integridad referencial.
const createCosecha = async (req, res) => {
  const { id_cultivo, id_parcela, id_usuario, fecha, cantidad_kg, notas } = req.body;

  if (!id_cultivo || !id_parcela || !id_usuario || !fecha) {
    return res.status(400).json({ error: 'id_cultivo, id_parcela, id_usuario y fecha son requeridos' });
  }

  try {
    // Buscar siembra existente para esta parcela + cultivo
    const [siembrasExistentes] = await db.query(
      'SELECT id_siembra FROM siembras WHERE id_parcela = ? AND id_cultivo = ? LIMIT 1',
      [id_parcela, id_cultivo]
    );

    let id_siembra;
    if (siembrasExistentes.length > 0) {
      id_siembra = siembrasExistentes[0].id_siembra;
    } else {
      // Crear siembra de referencia para mantener integridad referencial
      const [nuevaSiembra] = await db.query(
        `INSERT INTO siembras (id_parcela, id_cultivo, id_usuario, fecha_siembra, estado)
         VALUES (?, ?, ?, ?, 'cosechado')`,
        [id_parcela, id_cultivo, id_usuario, fecha]
      );
      id_siembra = nuevaSiembra.insertId;
    }

    const [result] = await db.query(
      'INSERT INTO cosechas (id_siembra, id_usuario, fecha, cantidad_kg, notas) VALUES (?, ?, ?, ?, ?)',
      [id_siembra, id_usuario, fecha, cantidad_kg || null, notas || null]
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
