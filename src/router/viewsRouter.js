const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, '../data/products.json');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

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

// Socket.io setup
io.on('connection', (socket) => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf-8');

        // Parsear
        const products = JSON.parse(data);

        // Render
        res.render('home', { 
            products: products,
        });
    } catch (error) {
        console.error("Error reading products.json file:", error);
        res.status(500).json({ error: "Error reading products" });
    }
});