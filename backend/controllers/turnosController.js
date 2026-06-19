const db = require('../config/db');

// Horarios escalonados para los turnos demo (9 parcelas reales en la BD)
const HORAS_DEMO = [
  { hora_inicio: '07:00:00', hora_fin: '07:30:00' },
  { hora_inicio: '07:30:00', hora_fin: '08:00:00' },
  { hora_inicio: '08:00:00', hora_fin: '08:30:00' },
  { hora_inicio: '08:30:00', hora_fin: '09:00:00' },
  { hora_inicio: '09:00:00', hora_fin: '09:30:00' },
  { hora_inicio: '09:30:00', hora_fin: '10:00:00' },
  { hora_inicio: '10:00:00', hora_fin: '10:30:00' },
  { hora_inicio: '10:30:00', hora_fin: '11:00:00' },
  { hora_inicio: '11:00:00', hora_fin: '11:30:00' },
];

// GET /api/turnos
const getTurnos = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.id_turno, t.fecha, t.hora_inicio, t.hora_fin, t.completado,
              u.nombre AS vecino,
              p.numero AS parcela
       FROM turnos_riego t
       JOIN usuarios u ON t.id_usuario = u.id_usuario
       JOIN parcelas p ON t.id_parcela = p.id_parcela
       ORDER BY t.fecha, t.hora_inicio`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT /api/turnos/:id/cumplir
const cumplirTurno = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'UPDATE turnos_riego SET completado = 1 WHERE id_turno = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json({ mensaje: 'Turno marcado como completado' });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT /api/turnos/cumplir-por-parcela
// Marca como completados TODOS los turnos pendientes de una parcela hasta hoy.
// Evita duplicados: no importa cuántas filas haya para la misma parcela.
const cumplirPorParcela = async (req, res) => {
  const { id_parcela } = req.body;
  if (!id_parcela) return res.status(400).json({ error: 'id_parcela es requerido' });
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      'UPDATE turnos_riego SET completado = 1 WHERE id_parcela = ? AND completado = 0 AND fecha <= ?',
      [id_parcela, hoy]
    );
    res.json({ mensaje: 'Turnos marcados como completados', afectados: result.affectedRows });
  } catch (error) {
    console.error('Error al cumplir turnos por parcela:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/turnos/reiniciar-demo
// Limpia atrasos pendientes, elimina turnos de hoy y crea una tanda fresca.
const reiniciarDemo = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // 1. Marcar como cumplidos los turnos pendientes de días anteriores
    //    para que no sigan apareciendo como "atrasados" tras el reinicio
    await db.query(
      'UPDATE turnos_riego SET completado = 1 WHERE completado = 0 AND fecha < ?',
      [hoy]
    );

    // 2. Borrar todos los turnos del día actual
    await db.query('DELETE FROM turnos_riego WHERE fecha = ?', [hoy]);

    // 3. Obtener parcelas ocupadas con su usuario asignado, ordenadas por número
    const [parcelas] = await db.query(
      `SELECT p.id_parcela, p.id_usuario
       FROM parcelas p
       WHERE p.estado = 'ocupada' AND p.id_usuario IS NOT NULL
       ORDER BY p.numero
       LIMIT 9`
    );

    // 4. Insertar un turno pendiente por parcela con horario escalonado
    for (let i = 0; i < parcelas.length; i++) {
      const { id_parcela, id_usuario } = parcelas[i];
      const { hora_inicio, hora_fin }  = HORAS_DEMO[i];
      await db.query(
        `INSERT INTO turnos_riego (id_usuario, id_parcela, fecha, hora_inicio, hora_fin, completado)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [id_usuario, id_parcela, hoy, hora_inicio, hora_fin]
      );
    }

    res.json({
      mensaje: `Turnos demo reiniciados: ${parcelas.length} parcelas programadas para hoy, todas pendientes.`,
      total: parcelas.length,
    });
  } catch (error) {
    console.error('Error en reiniciarDemo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getTurnos, cumplirTurno, cumplirPorParcela, reiniciarDemo };
