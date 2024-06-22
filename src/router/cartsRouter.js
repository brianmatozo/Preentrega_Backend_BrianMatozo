const express = require('express');
const router = express.Router();
const controller = require("../controllers/cart.controllers");

// Crear un nuevo carrito
router.post('/',controller.createCart);

// Listar todos los carritos
router.get('/', controller.getAll);

// Listar productos de un carrito por su id
router.get('/:cid', controller.getById);

// Agregar un producto a un carrito por su id
router.post('/:cid/product/:pid', controller.addProductById);

//actualizar los productos del carrito
router.put("/:cid", controller.updateCartProducts);

//actualizar la cantidad de productos
router.put("/:cid/product/:pid", controller.updateProductQuantity);

// Eliminar un carrito por su id
router.delete('/:cid', controller.deleteById);

router.post('/:cartId/product/:productId/delete', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const cart = await CartModel.findById(cartId);

        cart.products = cart.products.filter(p => p._id.toString() !== productId);

        await cart.save();
        res.redirect('/');
    } catch (error) {
        console.error("Error al eliminar el producto del carrito:", error);
        res.status(500).send("Error del servidor");
    }
});

// eliminar del carrito el producto seleccionado.
router.delete("/:cid/product/:pid", controller.deleteProductFromCart);

// eliminar del carrito todos los productos.
router.delete("/:cid/product", controller.deleteAllProductsFromCart);


module.exports = router;
