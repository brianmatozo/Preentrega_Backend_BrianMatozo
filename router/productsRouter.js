const express = require('express');
const router = express.Router();
const fs = require('fs');


// Function to generate a unique product ID
// let lastProductId = 0;
// let availableProductIds = [];

// function generateProductId() {
//     if (availableProductIds.length > 0) {
//         // Reuse the smallest available product ID
//         return availableProductIds.shift();
//     } else {
//         // Generate a new product ID
//         lastProductId++;
//         return lastProductId;
//     }
// }


// Listar todos los productos
router.get('/', (req, res) => {
    try {
        // Leer el contenido del archivo productos.json
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        
        // Log the content of the file for debugging
        // console.log("Contenido de products.json:", data);

        // Convertir el contenido a un objeto JSON
        const products = JSON.parse(data);
        
        // Enviar la lista de productos como respuesta
        res.json(products);
    } catch (error) {
        // En caso de error, enviar un mensaje de error al cliente
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

// Traer un producto por su id
router.get('/:pid', (req, res) => {
    try {
        // Obtener el id del producto de los parámetros de la solicitud
        const productId = req.params.pid;

        // Leer el contenido del archivo productos.json
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);

        // Buscar el producto por su id
        const product = products.find(p => p.id === parseInt(productId));

        // Verificar si se encontró el producto
        if (product) {
            // Devolver el producto encontrado
            res.json(product);
        } else {
            // Si el producto no se encuentra, responder con un código de estado 404
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        // En caso de error, enviar un mensaje de error al cliente
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

// Agregar un nuevo producto
productsRouter.post('/', (req, res) => {
    try {
        // Obtener los datos del nuevo producto del cuerpo de la solicitud
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        // Validar que todos los campos obligatorios estén presentes
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
        }

        // Leer el contenido del archivo productos.json para obtener la lista actual de productos
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);
        
        // Asignar un ID único al nuevo producto
        const lastProductId = products.length > 0 ? products[products.length - 1].id : 0;
        const newProductId = lastProductId + 1;

        // Asignar valores predeterminados a los campos opcionales que no se proporcionaron en la solicitud
        const status = true; // Status es true por defecto
        const thumbnailsArray = thumbnails || []; // thumbnails es un array opcional
        
        // Crear el nuevo producto con los datos proporcionados
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

        // Agregar el nuevo producto a la lista de productos
        products.push(newProduct);

        // Escribir la lista actualizada de productos de vuelta al archivo productos.json
        fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

        // Responder con el nuevo producto agregado
        res.status(201).json(newProduct);
    } catch (error) {
        // En caso de error, enviar un mensaje de error al cliente
        console.error("Error al agregar nuevo producto:", error);
        res.status(500).json({ error: "Error al agregar nuevo producto" });
    }
});

// Actualizar un producto por su id
router.put('/:pid', (req, res) => {
    try {
        // Extract the product ID from the request parameters
        const productId = parseInt(req.params.pid);

        // Extract the updated product data from the request body
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        // Read the existing products data from the JSON file
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        let products = JSON.parse(data);

        // Find the index of the product with the given ID in the products array
        const index = products.findIndex(product => product.id === productId);

        // Check if the product exists
        if (index !== -1) {
            // Update the product fields with the provided data
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

            // Write the updated products array back to the JSON file
            fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

            // Respond with the updated product
            res.json(products[index]);
        } else {
            // If the product does not exist, respond with a 404 status
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        // If an error occurs, respond with a 500 status
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// Eliminar un producto por su id
router.delete('/:pid', (req, res) => {
    try {
        // Extract the product ID from the request parameters
        const productId = parseInt(req.params.pid);

        // const productIdToDelete = parseInt(req.params.pid);
        
        // Add the deleted product ID to the list of available IDs
        // availableProductIds.push(productIdToDelete);

        // Read the existing products data from the JSON file
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        let products = JSON.parse(data);

        // Find the index of the product with the given ID in the products array
        const index = products.findIndex(product => product.id === productId);

        // Check if the product exists
        if (index !== -1) {
            // Remove the product from the array of products
            products.splice(index, 1);

            // Write the updated products array back to the JSON file
            fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

            // Respond with a success message
            res.json({ message: "Producto eliminado exitosamente" });
        } else {
            // If the product does not exist, respond with a 404 status
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        // If an error occurs, respond with a 500 status
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

module.exports = router;
