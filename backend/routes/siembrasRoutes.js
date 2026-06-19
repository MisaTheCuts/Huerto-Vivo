const express = require('express');
const router  = express.Router();
const { getSiembras } = require('../controllers/siembrasController');

// GET /api/siembras
// GET /api/siembras?id_parcela=X
router.get('/', getSiembras);

module.exports = router;
