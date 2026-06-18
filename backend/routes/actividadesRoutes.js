const express = require('express');
const router  = express.Router();
const { getActividades, createActividad } = require('../controllers/actividadesController');

// GET /api/actividades
router.get('/', getActividades);

// POST /api/actividades
router.post('/', createActividad);

module.exports = router;
