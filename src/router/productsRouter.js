const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, '../data/products.json');
const controllers = require("../controllers/products.controllers")

module.exports = (io) => {

    // Listar todos los productos
    router.get('/', controllers.getAll)

    // Traer un producto por su id
    router.get('/:pid', controllers.getById)

    // Agregar un nuevo producto
    router.post('/', (req, res)=> controllers.createProduct(req, res, io))

    // Actualizar un producto por su id
    router.put('/:pid', controllers.modifyProduct)

    // Eliminar un producto por su id
    router.delete('/:pid', (req, res)=> controllers.deleteProduct(req, res, io))

    return router;
};

