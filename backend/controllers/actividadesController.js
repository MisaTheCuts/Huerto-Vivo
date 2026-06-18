const db = require('../config/db');

// GET /api/actividades
const getActividades = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id_actividad, a.tipo, a.descripcion, a.fecha,
              u.nombre AS usuario,
              p.numero AS parcela
       FROM actividades a
       JOIN usuarios u ON a.id_usuario = u.id_usuario
       JOIN parcelas p ON a.id_parcela = p.id_parcela
       ORDER BY a.fecha DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/actividades
// Registra una nueva actividad en una parcela
const createActividad = async (req, res) => {
  const { id_parcela, id_usuario, tipo, descripcion } = req.body;

  if (!id_parcela || !id_usuario || !tipo) {
    return res.status(400).json({ error: 'id_parcela, id_usuario y tipo son requeridos' });
  }

  const tiposValidos = ['riego', 'fertilizacion', 'poda', 'control_plagas', 'otro'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: `Tipo inválido. Debe ser: ${tiposValidos.join(', ')}` });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO actividades (id_parcela, id_usuario, tipo, descripcion) VALUES (?, ?, ?, ?)',
      [id_parcela, id_usuario, tipo, descripcion || null]
    );
    res.status(201).json({
      mensaje: 'Actividad registrada correctamente',
      id_actividad: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getActividades, createActividad };
