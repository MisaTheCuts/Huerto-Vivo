const express = require('express');
const router  = express.Router();
const { getParcelas, getParcelaById } = require('../controllers/parcelasController');

// GET /api/parcelas
router.get('/', getParcelas);

// GET /api/parcelas/:id
router.get('/:id', getParcelaById);

module.exports = router;
