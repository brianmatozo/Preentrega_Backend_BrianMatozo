const http = require('http')
const express = require("express")
const router = express.Router();
const fs = require('fs')
const socketIo = require('socket.io')
const io = require('socket.io')
const path = require('path')
const productsFilePath = path.join(__dirname, "../data/products.json")
const cartsFilePath = path.join(__dirname, "../data/carts.json")
const { CartModel } = require("../daos/mongodb/models/carts.model")
const { ProductModel } = require('../daos/mongodb/models/product.model');
const { ObjectId } = require('mongoose').Types;
const { json } = require('body-parser');

// function generateCartId(carts) {
//     if (carts.length === 0) {
//         return 1;
//     }
//     const maxId = carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0);
//     for (let i = 1; i <= maxId; i++) {
//         const idExists = carts.some(cart => cart.id === i);
//         if (!idExists) {
//             return i;
//         }
//     }
//     return maxId + 1;
// }

// function getAllProducts() {
//     const data = fs.readFileSync(productsFilePath, 'utf-8');
//     return JSON.parse(data);
// }

// function saveProducts(products) {
//     fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
// }

// function getAllCarts() {
//     const data = fs.readFileSync(cartsFilePath, 'utf-8');
//     return JSON.parse(data);
// }

// function saveCart(carts) {
//     fs.writeFileSync(cartsFilePath, JSON.stringify(products, null, 2), 'utf-8');
// }
//     try {
//         const carts = getAllCarts();
//         const newCartId = generateCartId(carts);
//         const newCart = {
//             id: newCartId,
//             products: [] // vacio por defecto
//         };
//         carts.push(newCart);
//         saveCart(newCart);
//         res.status(201).json(newCart);
//     } catch (error) {
//         console.error("Error al crear un nuevo carrito:", error);
//         res.status(500).json({ error: "Error interno del servidor al crear un nuevo carrito." });
//     }
//   };

const createCart = async (req, res) => {
    try {
        const newCart = new CartModel({ products: [] });
        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear un nuevo carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al crear un nuevo carrito." });
    }
};

// const getById = async (req, res) => {
//     try {
//         const cartId = req.params.cid;

//         if (!ObjectId.isValid(cartId)) {
//             return res.status(404).json({ error: "Carrito no encontrado" });
//         }

//         const cart = await CartModel.findById(cartId).populate('products._id');
        
//         if (!cart) {
//             return res.status(404).json({ error: "Carrito no encontrado" });
//         }

//         res.json(cart.products);
//         res.render('carts', { cartId, products: cart.products});
//     } catch (error) {
//         console.error("Error al listar productos del carrito:", error);
//         res.status(500).json({ error: "Error interno del servidor al listar productos del carrito" });
//     }
// }

const getById = async (req, res) => {
    try {
        const cartId = req.params.cid;

        if (!ObjectId.isValid(cartId)) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const cart = await CartModel.findById(cartId).populate('products._id');
        
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.render('carts', { cartId, products: cart.products });
    } catch (error) {
        console.error("Error al listar productos del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al listar productos del carrito" });
    }
};


const addProductById = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        // Verificar si el producto existe
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Buscar el carrito y agregar el producto
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // Verificar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(p => p._id.toString() === productId);
        if (productIndex !== -1) {
            // Si el producto ya está en el carrito, incrementar la cantidad
            cart.products[productIndex].quantity++;
        } else {
            // Si el producto no está en el carrito, agregarlo con cantidad 1
            cart.products.push({ _id: product._id, quantity: 1 });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error al agregar un producto al carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al agregar un producto al carrito" });
    }
};

const updateCartProducts = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const { products } = req.body;

        // Buscar el carrito y actualizar los productos
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        cart.products = products; // Reemplazar los productos del carrito con los nuevos

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error al actualizar los productos del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al actualizar los productos del carrito" });
    }
}

const updateProductQuantity = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body;

        // Buscar el carrito y actualizar la cantidad del producto
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // Verificar si el producto está en el carrito
        const productIndex = cart.products.findIndex(p => p._id.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ error: "Producto no encontrado en el carrito" });
        }

        // Actualizar la cantidad del producto
        cart.products[productIndex].quantity = quantity;

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error al actualizar la cantidad del producto en el carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al actualizar la cantidad del producto en el carrito" });
    }
};

const deleteProductFromCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        cart.products = cart.products.filter(p => p._id.toString() !== productId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error al eliminar un producto del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al eliminar un producto del carrito" });
    }
};

const deleteAllProductsFromCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        cart.products = [];
        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error al eliminar todos los productos del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al eliminar todos los productos del carrito" });
    }
};

const deleteById = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const deletedCart = await CartModel.findByIdAndDelete(cartId);
        if (!deletedCart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        res.json({ message: "Carrito eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar el carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al eliminar el carrito" });
    }
};

const getAll = async (req, res) => {
    try {
        const carts = await CartModel.find().populate('product._id')
        res.json(carts);
    } catch (error) {
        console.error("Error al leer los carritos:", error);
        res.status(500).json({ error: "Error al leer los carritos" });
    }
}

module.exports = {
    createCart, 
    getById,
    addProductById,
    deleteById,
    getAll,
    updateCartProducts,
    updateProductQuantity,
    deleteProductFromCart,
    deleteAllProductsFromCart
}