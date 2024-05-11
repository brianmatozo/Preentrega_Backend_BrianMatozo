const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware para el manejo de datos del formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas para productos
const productsRouter = express.Router();

// Listar todos los productos
productsRouter.get('/', (req, res) => {
    try {
        // Leer el contenido del archivo productos.json
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        
        // Log the content of the file for debugging
        // console.log("Contenido de products.json:", data);

        // Convertir el contenido a un objeto JSON
        const products = JSON.parse(data);
        
        // Enviar la lista de productos como respuesta
        res.json(products);
    } catch (error) {
        // En caso de error, enviar un mensaje de error al cliente
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

// Traer un producto por su id
productsRouter.get('/:pid', (req, res) => {
    try {
        // Obtener el id del producto de los parámetros de la solicitud
        const productId = req.params.pid;

        // Leer el contenido del archivo productos.json
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);

        // Buscar el producto por su id
        const product = products.find(p => p.id === parseInt(productId));

        // Verificar si se encontró el producto
        if (product) {
            // Devolver el producto encontrado
            res.json(product);
        } else {
            // Si el producto no se encuentra, responder con un código de estado 404
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        // En caso de error, enviar un mensaje de error al cliente
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

// Agregar un nuevo producto
productsRouter.post('/', (req, res) => {
    try {
        // Obtener los datos del nuevo producto del cuerpo de la solicitud
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        // Validar que todos los campos obligatorios estén presentes
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
        }

        // Leer el contenido del archivo productos.json para obtener la lista actual de productos
        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);
        
        // Asignar un ID único al nuevo producto
        const lastProductId = products.length > 0 ? products[products.length - 1].id : 0;
        const newProductId = lastProductId + 1;

        // Asignar valores predeterminados a los campos opcionales que no se proporcionaron en la solicitud
        const status = true; // Status es true por defecto
        const thumbnailsArray = thumbnails || []; // thumbnails es un array opcional
        
        // Crear el nuevo producto con los datos proporcionados
        const newProduct = {
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

        // Agregar el nuevo producto a la lista de productos
        products.push(newProduct);

        // Escribir la lista actualizada de productos de vuelta al archivo productos.json
        fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

        // Responder con el nuevo producto agregado
        res.status(201).json(newProduct);
    } catch (error) {
        // En caso de error, enviar un mensaje de error al cliente
        console.error("Error al agregar nuevo producto:", error);
        res.status(500).json({ error: "Error al agregar nuevo producto" });
    }
});


// Actualizar un producto por su id
productsRouter.put('/:pid', (req, res) => {
    // Implementar la lógica para actualizar un producto por su id
});

// Eliminar un producto por su id
productsRouter.delete('/:pid', (req, res) => {
    // Implementar la lógica para eliminar un producto por su id
});

// Rutas para carritos
const cartsRouter = express.Router();

// Crear un nuevo carrito
cartsRouter.post('/', (req, res) => {
    // Implementar la lógica para crear un nuevo carrito
});

// Listar productos de un carrito por su id
cartsRouter.get('/:cid', (req, res) => {
    // Implementar la lógica para listar productos de un carrito por su id
});

// Agregar un producto a un carrito por su id
cartsRouter.post('/:cid/product/:pid', (req, res) => {
    // Implementar la lógica para agregar un producto a un carrito por su id
});

// Montar los routers en las rutas especificadas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
