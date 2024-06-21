const http = require('http')
const express = require("express")
const router = express.Router();
const fs = require('fs')
const socketIo = require('socket.io')
const io = require('socket.io')
const path = require('path')
const productsFilePath = path.join(__dirname, "../data/products.json")

function generateProductId(products) {
    if (products.length === 0) {
        return 1;
    }
    const maxId = products.reduce((max, product) => (product.id > max ? product.id : max), 0);
    for (let i = 1; i <= maxId; i++) {
        const idExists = products.some(product => product.id === i);
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

const getAll = async (req, res) =>{
    try {
        const products = getAllProducts();
        res.json(products);
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
}

const getById = async (req, res)=>{
    try {
        const productId = req.params.pid;
        const products = getAllProducts();
        const product = products.find(p => p.id === parseInt(productId));
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
}

const createProduct = async (req, res)=>{
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
        }
        const products = getAllProducts();
        const newProductId = generateProductId(products);
        const status = true;
        const thumbnailsArray = thumbnails || []; // thumbnails es un array opcional
        
        const newProduct = {
            id: newProductId,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails: thumbnailsArray
        };

        products.push(newProduct);
        saveProducts(products)
        io.emit('productCreated', newProduct);
        // repuesta nuevo producto
        res.status(201).json(newProduct);
    } catch (error) {
        // error 500 cliente
        console.error("Error al agregar nuevo producto:", error);
        res.status(500).json({ error: "Error al agregar nuevo producto" });
    }
}

const modifyProduct = async (req, res)=>{
    try {
        const productId = parseInt(req.params.pid);
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        let products = getAllProducts();
        const index = products.findIndex(product => product.id === productId);

        if (index !== -1) {
            // actualizar producto
            products[index] = {
                ...products[index],
                title,
                description,
                code,
                price,
                stock,
                category,
                thumbnails
            };

            saveProducts(products)
            res.json(products[index]);
        } else {
            // error no existe
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        // error 500 server
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
}

const deleteProduct = async (req, res)=>{
    try {
        const productId = parseInt(req.params.pid);
        let products = getAllProducts();
        const index = products.findIndex(product => product.id === productId);
        if (index !== -1) {
            // eliminar
            products.splice(index, 1);
            saveProducts(products);
            io.emit('productDeleted', productId);
            res.json({ message: "Producto eliminado exitosamente" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
}

const renderHome = async (req, res)=>{
    try{
        const products = getAllProducts();
        res.render('home', { title: 'Home', products });
    }catch (error) {
        console.error("error al leer el archivo json:", error);
        res.status(500).send("error de carga de servidor");
    }
}

const handleSocketConnection = (io) => {
        io.on('connection', (socket) => {
            try {
                const products = getAllProducts();
                socket.emit('products', products);
            } catch (error) {
                console.error("error al leer el archivo json:", error);
            }

            // Manejar la eliminación de un producto
            socket.on('deleteProduct', (productId) => {
                try {
                    let products = getAllProducts();

                    // Filtrar el producto a eliminar
                    products = products.filter(product => product.id !== productId);

                    // Escribir la lista actualizada
                    saveProducts(products)

                    // Respuesta producto eliminado
                    io.emit('productDeleted', productId);
                } catch (error) {
                    console.error("error borrando productos:", error);
                }
            });

            // Manejar la creación de un nuevo producto
            socket.on('createProduct', (newProduct) => {
                try {
                    const { title, description, code, price, stock, category, thumbnails } = newProduct;
                    const products = getAllProducts();
                    const newProductId = generateProductId(products);
                    const status = true;
                    const thumbnailsArray = thumbnails || [];
                    const productToAdd = {
                        id: newProductId,
                        title,
                        description,
                        code,
                        price,
                        status,
                        stock,
                        category,
                        thumbnails: thumbnailsArray
                    };
                    products.push(productToAdd);
                    saveProducts(products);
                    io.emit('productCreated', productToAdd);
                } catch (error) {
                    console.error("error al manejar el evento createProduct:", error);
                }
            });

            socket.on('disconnect', () => {
                // console.log('usuario desconectado');
            });
        });
    }


module.exports = {
    getAll, 
    getById, 
    createProduct, 
    modifyProduct,
    deleteProduct,
    handleSocketConnection,
    renderHome
}