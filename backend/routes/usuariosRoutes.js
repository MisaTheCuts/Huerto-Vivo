const express = require('express');
const router  = express.Router();
const { getUsuarios } = require('../controllers/usuariosController');

// GET /api/usuarios
router.get('/', getUsuarios);

module.exports = router;
