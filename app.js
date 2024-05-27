const http = require('http')
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const exphbs = require('express-handlebars'); 
const path = require('path');
const productsRouter = require('./src/router/productsRouter');
const cartsRouter = require('./src/router/cartsRouter');
const productsFilePath = path.join(__dirname, './src/data/products.json');
const app = express();
const PORT = 8080;
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

// Set up Handlebars
app.engine('handlebars', exphbs({ 
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Routes
app.get('/', (req, res) => {
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

// Socket.io setup
io.on('connection', (socket) => {
    console.log('Usuario conectado');
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

    // Custom event handlers can be added here
    socket.on('message', (msg) => {
        console.log('mensaje: ', msg);
        io.emit('message', msg); // Broadcast to all clients
    });
});

// server
server.listen(PORT, () => {
    console.log(`server en http://localhost:${PORT}`);
});