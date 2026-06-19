const express = require('express');
const router  = express.Router();
const { getTurnos, cumplirTurno, cumplirPorParcela, reiniciarDemo } = require('../controllers/turnosController');

// GET /api/turnos
router.get('/', getTurnos);

// PUT /api/turnos/cumplir-por-parcela  — marca TODOS los pendientes de una parcela hasta hoy
router.put('/cumplir-por-parcela', cumplirPorParcela);

// PUT /api/turnos/:id/cumplir
router.put('/:id/cumplir', cumplirTurno);

// POST /api/turnos/reiniciar-demo
router.post('/reiniciar-demo', reiniciarDemo);

module.exports = router;
