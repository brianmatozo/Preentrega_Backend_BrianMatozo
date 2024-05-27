const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, '../data/products.json');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

// WebSocket connection handling
io.on('connection', (socket) => {
    // console.log('A user connected');
    // Emit products data to the client upon connection
    try {
        const data = fs.readFileSync(productsFilePath, 'utf-8');
        const products = JSON.parse(data);
        io.emit('products', products);
    } catch (error) {
        console.error("Error reading products.json file:", error);
    }
});