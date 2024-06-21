const express = require('express');
const router = express.Router();
const controller = require("../controllers/cart.controllers")

// Crear un nuevo carrito
router.post('/',controller.createCart)

// Listar productos de un carrito por su id
router.get('/:cid', controller.getById)

// Agregar un producto a un carrito por su id
router.post('/:cid/product/:pid', controller.addProductById)

// Eliminar un carrito por su id
router.delete('/:cid', controller.deleteById)

// Listar todos los carritos
router.get('/', controller.getAll)

module.exports = router;
