const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const exphbs = require('express-handlebars'); 
const path = require('path');
const socketIo = require('socket.io');
const { Server } = require('socket.io');
const productsRouter = require('./src/router/productsRouter');
const cartsRouter = require('./src/router/cartsRouter');
const productsController = require("./src/controllers/products.controllers");
const viewsRouter = require("./src/router/viewsRouter");
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080
const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL)
.then(() => {
    console.log(`Conectado a la BBDD`);
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
});

// handlebars setup
const hbs = exphbs.create({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    runtimeOptions:{
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuración de sesiones
app.use(session({
    secret: 'your-secret-key', // Cambia esto por una clave secreta única
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Pon esto en true si usas HTTPS
}));

//public setup
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next)=>{
    req.io = io;
    next();
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routers
app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

productsController.handleSocketConnection(io);

// server
server.listen(PORT, () => {
    console.log(`server en http://localhost:${PORT}`);
});