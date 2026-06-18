const express = require('express');
const router  = express.Router();
const { getCosechas, createCosecha } = require('../controllers/cosechasController');

// GET /api/cosechas
router.get('/', getCosechas);

// POST /api/cosechas
router.post('/', createCosecha);

module.exports = router;
