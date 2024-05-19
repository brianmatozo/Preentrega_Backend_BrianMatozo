const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { engine } = require('express-handlebars'); 
const path = require('path');
const productsRouter = require('./src/router/productsRouter');
const cartsRouter = require('./src/router/cartsRouter');
const productsFilePath = path.join(__dirname, './src/data/products.json');
const handlebarsLayouts = require('handlebars-layouts');
handlebarsLayouts.register(engine.handlebars);


const app = express();
const PORT = 8080;

// Set up Handlebars
app.engine('handlebars', engine({ 
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para el manejo de datos del formulario
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
            imagePath: 'images/basket.png'
        });
    } catch (error) {
        console.error("Error reading products.json file:", error);
        res.status(500).json({ error: "Error reading products" });
    }
});

// server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
