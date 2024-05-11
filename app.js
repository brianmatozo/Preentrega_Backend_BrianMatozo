const express = require('express');
const bodyParser = require('body-parser');
const productsRouter = require('./router/productsRouter');
const cartsRouter = require('./router/cartsRouter');

const app = express();
const PORT = 8080;

// Middleware para el manejo de datos del formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
