const express = require('express');
const bodyParser = require('body-parser');
const productsRouter = require('./router/productsRouter');
const cartsRouter = require('./router/cartsRouter');

const app = express();
const PORT = 8080;

// Middleware para el manejo de datos del formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Montar los routers en las rutas especificadas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
