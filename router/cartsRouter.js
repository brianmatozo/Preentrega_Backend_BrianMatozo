const express = require('express');
const router = express.Router();

// Crear un nuevo carrito
router.post('/', (req, res) => {
});

// Listar productos de un carrito por su id
router.get('/:cid', (req, res) => {
});

// Agregar un producto a un carrito por su id
router.post('/:cid/product/:pid', (req, res) => {
});

module.exports = router;
