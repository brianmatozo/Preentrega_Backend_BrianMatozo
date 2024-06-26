const http = require('http');
const express = require("express");
const router = express.Router();
const fs = require('fs');
const socketIo = require('socket.io');
const io = require('socket.io');
const path = require('path');
const { ProductModel } = require('../daos/mongodb/models/product.model');
const { CartModel } = require("../daos/mongodb/models/carts.model")
const productsFilePath = path.join(__dirname, "../data/products.json")
const mongoosePaginate = require('mongoose-paginate-v2')

const getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort, query } = req.query; // Asegúrate de recibir `query` correctamente

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined
        };

        let filter = {};
        if (query !== undefined) {
            if (query === 'true' || query === 'false') {
                filter = { status: query === 'true' };
            } else {
                filter = { category: query };
            }
        }

        const result = await ProductModel.paginate(filter, options);
        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.hasPrevPage ? result.prevPage : null,
            nextPage: result.hasNextPage ? result.nextPage : null,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?limit=${limit}&page=${result.prevPage}&sort=${sort}&query=${query}` : null,
            nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.nextPage}&sort=${sort}&query=${query}` : null
        });
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
};

const getById = async (req, res)=>{
    try {
        const productId = req.params.pid;
        const product = await ProductModel.findById(productId)
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
};

const createProduct = async (req, res, io)=>{
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
        }
        
        const newProduct = new ProductModel({
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails || []
        });
        await newProduct.save();
        io.emit('productCreated', newProduct);
        // repuesta nuevo producto
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error al agregar nuevo producto:", error);
        res.status(500).json({ error: "Error al agregar nuevo producto" });
    }
};

const modifyProduct = async (req, res) => {
    try {
        const productId = req.params.pid;
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        const updatedProduct = await ProductModel.findByIdAndUpdate(productId, {
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails
        }, { new: true });

        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
};

const deleteProduct = async (req, res, io) => {
    try {
        const productId = req.params.pid;
        const deletedProduct = await ProductModel.findByIdAndDelete(productId);

        if (deletedProduct) {
            io.emit('productDeleted', productId); // Emite el evento a través de Socket.IO
            res.json({ message: "Producto eliminado exitosamente" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
};

const renderHome = async (req, res) => {
    try {
        const products = await ProductModel.find();

        let cartId;
        if (req.session) {
            if (req.session.cartId) {
                cartId = req.session.cartId;
            } else {
                // Crear un nuevo carrito si no existe en la sesión
                const newCart = new CartModel();
                const savedCart = await newCart.save();
                req.session.cartId = savedCart._id;
                cartId = savedCart._id;
            }
        } else {
            throw new Error('Session is not initialized.');
        }

        let cart;
        if (req.session) {
            if (req.session.cartId) {
                cart = await CartModel.findById(req.session.cartId).populate('products._id');
            } else {
                // Crear un nuevo carrito si no existe en la sesión
                cart = new CartModel();
                const savedCart = await cart.save();
                req.session.cartId = savedCart._id;
                cart = savedCart;
            }
        } else {
            throw new Error('Session is not initialized.');
        }

        res.render('home', { title: 'Home', products, cartId, cart });
    } catch (error) {
        console.error("Error al renderizar la página de inicio:", error);
        res.status(500).send("Error de carga de servidor");
    }
};

const handleSocketConnection = (io) => {
        io.on('connection', async (socket) => {
            try {
                const products = await ProductModel.find();
                socket.emit('products', products);
            } catch (error) {
                console.error("error al leer el archivo json:", error);
            }

            socket.on('deleteProduct', async (productId) => {
                try {
                    const result = await ProductModel.findByIdAndDelete(productId);
                    if (result) {
                        io.emit('productDeleted', productId);
                    }
                } catch (error) {
                    console.error("Error al borrar el producto:", error);
                }
            });

            socket.on('createProduct', async (newProduct) => {
                try {
                    const productToAdd = new ProductModel(newProduct);
                    const savedProduct = await productToAdd.save();
                    io.emit('productCreated', savedProduct);
                } catch (error) {
                    console.error("Error al crear el producto:", error);
                }
            });
            
            socket.on('disconnect', () => {
                // console.log('usuario desconectado');
            });
        });
    };


module.exports = {
    getAll, 
    getById, 
    createProduct, 
    modifyProduct,
    deleteProduct,
    handleSocketConnection,
    renderHome
};