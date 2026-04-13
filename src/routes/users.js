const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para crear perfil
router.post('/perfil', userController.crearPerfil);

// Ruta para borrado lógico de perfil
router.delete('/perfil/:id', userController.eliminarPerfil);

// Ruta para registrar conductores
router.post('/conductor', userController.registrarConductor);

module.exports = router;
