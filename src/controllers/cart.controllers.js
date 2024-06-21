const http = require('http')
const express = require("express")
const router = express.Router();
const fs = require('fs')
const socketIo = require('socket.io')
const io = require('socket.io')
const path = require('path')
const productsFilePath = path.join(__dirname, "../data/products.json")
const cartsFilePath = path.join(__dirname, "../data/carts.json")

function generateCartId(carts) {
    if (carts.length === 0) {
        return 1;
    }
    const maxId = carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0);
    for (let i = 1; i <= maxId; i++) {
        const idExists = carts.some(cart => cart.id === i);
        if (!idExists) {
            return i;
        }
    }
    return maxId + 1;
}

function getAllProducts() {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
}

function saveProducts(products) {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
}

function getAllCarts() {
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data);
}

function saveCart(carts) {
    fs.writeFileSync(cartsFilePath, JSON.stringify(products, null, 2), 'utf-8');
}

const createCart = async (req, res) => {
    try {
        const carts = getAllCarts();
        const newCartId = generateCartId(carts);
        const newCart = {
            id: newCartId,
            products: [] // vacio por defecto
        };
        carts.push(newCart);
        saveCart(newCart);
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear un nuevo carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al crear un nuevo carrito." });
    }
  };

const getById = async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const carts = getAllCarts();
        const cart = carts.find(cart => cart.id === cartId);
        // exixte?
        if (cart) {
            // respuesta
            res.json(cart.products);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al listar productos del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al listar productos del carrito" });
    }
}

const addProductById = async (req, res) =>{
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        let carts = getAllCarts();
        const cartIndex = carts.findIndex(cart => cart.id === cartId);
        if (cartIndex !== -1) {
            const cart = carts[cartIndex];
            const productIndex = cart.products.findIndex(product => product.id === productId);
            if (productIndex !== -1) {
                // exstente, incrementar cantidad
                cart.products[productIndex].quantity++;
            } else {
                // inexistente, nuevo contador
                cart.products.push({ id: productId, quantity: 1 });
            }
            saveCart(cart)
            res.json(cart);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al agregar un producto al carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al agregar un producto al carrito" });
    }
}

const deleteById = async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        let carts = getAllCarts();
        const index = carts.findIndex(cart => cart.id === cartId);
        if (index !== -1) {
            // eliminar
            carts.splice(index, 1);
            saveCart(carts)
            res.json({ message: "Carrito eliminado exitosamente" });
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el carrito:", error);
        res.status(500).json({ error: "Error al eliminar el carrito" });
    }
}

const getAll = async (req, res) => {
    try {
        const carts = getAllCarts();
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
    getAll
}