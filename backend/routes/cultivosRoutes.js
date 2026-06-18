const express = require('express');
const router  = express.Router();
const { getCultivos } = require('../controllers/cultivosController');

// GET /api/cultivos
router.get('/', getCultivos);

module.exports = router;
