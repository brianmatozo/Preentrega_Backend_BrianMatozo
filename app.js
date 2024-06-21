const http = require('http')
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const exphbs = require('express-handlebars'); 
const path = require('path');
const socketIo = require('socket.io');
const productsRouter = require('./src/router/productsRouter');
const cartsRouter = require('./src/router/cartsRouter');
const productsController = require("./src/controllers/products.controllers");
const viewsRouter = require("./src/router/viewsRouter");
const { default: mongoose } = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 8080
const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL)
.then(() => {
    console.log(`Conectado a la BBDD`);
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
});

app.post('/test-create-product', async (req, res) => {
    const { ProductModel } = require('./src/daos/mongodb/models/product.model');

    try {
        const newProduct = new ProductModel({
            title: "pan",
            description: "megustaelpan",
            code: "123",
            price: 2222,
            status: true,
            stock: 321,
            category: "pan",
            thumbnails: []
        });

        await newProduct.save();

        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error al crear el producto:", error);
        res.status(500).json({ error: "Error al crear el producto" });
    }
});

// handlebars setup
app.engine('handlebars', exphbs({ 
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

//public setup
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

productsController.handleSocketConnection(io);

// server
server.listen(PORT, () => {
    console.log(`server en http://localhost:${PORT}`);
});