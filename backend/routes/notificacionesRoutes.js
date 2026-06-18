const express = require('express');
const router  = express.Router();
const { getNotificaciones, marcarLeida } = require('../controllers/notificacionesController');

// GET /api/notificaciones          (todos)
// GET /api/notificaciones?id_usuario=2  (filtrado por usuario)
router.get('/', getNotificaciones);

// PUT /api/notificaciones/:id/leida
router.put('/:id/leida', marcarLeida);

module.exports = router;
