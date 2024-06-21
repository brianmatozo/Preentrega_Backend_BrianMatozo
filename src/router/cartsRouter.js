const express = require('express');
const router = express.Router();
const controller = require("../controllers/cart.controllers");

// Crear un nuevo carrito
router.post('/',controller.createCart);

// Listar todos los carritos
router.get('/', controller.getAll);

// Listar productos de un carrito por su id
router.get('/:cid', controller.getById);

//actualizar los productos del carrito
router.put("/:cid", controller.updateCartProducts);

//actualizar la cantidad de productos
router.put("/:cid/product/:pid", controller.updateProductQuantity);

// eliminar del carrito el producto seleccionado.
router.delete("/:cid/product/:pid", controller.deleteProductFromCart);

// eliminar del carrito todos los productos.
router.delete("/:cid/product", controller.deleteAllProductsFromCart);

// Eliminar un carrito por su id
router.delete('/:cid', controller.deleteById);

// Agregar un producto a un carrito por su id
router.post('/:cid/product/:pid', controller.addProductById);


module.exports = router;
