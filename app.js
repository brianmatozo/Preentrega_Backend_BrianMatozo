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

const viewsRouter = require('./src/router/viewsRouter')(io);
app.use('/', viewsRouter);

// server
server.listen(PORT, () => {
    console.log(`server en http://localhost:${PORT}`);
});