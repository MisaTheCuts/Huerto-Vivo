const express = require('express');
const router  = express.Router();
const { getTurnos, cumplirTurno, reiniciarDemo } = require('../controllers/turnosController');

// GET /api/turnos
router.get('/', getTurnos);

// PUT /api/turnos/:id/cumplir
router.put('/:id/cumplir', cumplirTurno);

// POST /api/turnos/reiniciar-demo
router.post('/reiniciar-demo', reiniciarDemo);

module.exports = router;
