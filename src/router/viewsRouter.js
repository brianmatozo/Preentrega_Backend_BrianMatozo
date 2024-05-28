const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

function generateProductId(products) {
    // Si no hay ningún carrito en la lista, comienza con el ID 1
    if (products.length === 0) {
        return 1;
    }

    // Encontrar el mayor ID de carrito actual
    const maxId = products.reduce((max, products) => (products.id > max ? products.id : max), 0);

    // Verificar si hay algún ID disponible de menor orden
    for (let i = 1; i <= maxId; i++) {
        const idExists = products.some(product => product.id === i);
        if (!idExists) {
            return i;
        }
    }

    // Si no se encuentra ningún ID disponible de menor orden, se genera un nuevo ID
    return maxId + 1;
}

// Endpoint for the root URL
router.get('/', (req, res) => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf-8');
        const products = JSON.parse(data);
        res.render('home', { title: 'Home', products });
    } catch (error) {
        console.error("Error reading products.json file:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Emitir la lista de productos al cliente cuando se conecta
        try {
            const data = fs.readFileSync(productsFilePath, 'utf-8');
            const products = JSON.parse(data);
            socket.emit('products', products);
        } catch (error) {
            console.error("Error reading products.json file:", error);
        }

        // Manejar la creación de un nuevo producto
        socket.on('createProduct', (newProduct) => {
            try {
                const { title, description, code, price, stock, category, thumbnails } = newProduct;

                const data = fs.readFileSync(productsFilePath, 'utf-8');
                const products = JSON.parse(data);

                // logica de nuevo id
                const newProductId = generateProductId(products);

                // valores predeterminados
                const status = true;
                const thumbnailsArray = thumbnails || []; // thumbnails es un array opcional
                
                // Crear el nuevo producto
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

                // agregar a la lista
                products.push(productToAdd);

                // Escribir la lista actualizada
                fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');

                // repuesta nuevo producto
                io.emit('productCreated', productToAdd);
            } catch (error) {
                console.error("Error handling createProduct event:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
    return router;
};
