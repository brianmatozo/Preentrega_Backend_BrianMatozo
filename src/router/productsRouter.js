const express = require('express');
const router = express.Router();
const fs = require('fs');

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

// Listar todos los productos
router.get('/', (req, res) => {
    try {
        // Leer el contenido productos.json
        const data = fs.readFileSync('./data/products.json', 'utf-8');

        // parsear
        const products = JSON.parse(data);
        
        // respuesta de lista
        res.json(products);
    } catch (error) {
        // error:
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

// Traer un producto por su id
router.get('/:pid', (req, res) => {
    try {
        // Obtener el id del producto (:pid)
        const productId = req.params.pid;

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);

        // Buscar el producto por su id
        const product = products.find(p => p.id === parseInt(productId));

        // si o no?
        if (product) {
            // respuesta de producto
            res.json(product);
        } else {
            // => error
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        // error cliente
        console.error("Error al leer productos:", error);
        res.status(500).json({ error: "Error al leer productos" });
    }
});

// Agregar un nuevo producto
router.post('/', (req, res) => {
    try {
        // datos obligatorios
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        // super chequeo de datos
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
        }

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        const products = JSON.parse(data);

        // logica de nuevo id
        const newProductId = generateProductId(products);

        // valores predeterminados
        const status = true;
        const thumbnailsArray = thumbnails || []; // thumbnails es un array opcional
        
        // Crear el nuevo producto
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

        // agregar a la lista
        products.push(newProduct);

        // Escribir la lista actualizada
        fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

        // repuesta nuevo producto
        res.status(201).json(newProduct);
    } catch (error) {
        // error 500 cliente
        console.error("Error al agregar nuevo producto:", error);
        res.status(500).json({ error: "Error al agregar nuevo producto" });
    }
});

// Actualizar un producto por su id
router.put('/:pid', (req, res) => {
    try {
        const productId = parseInt(req.params.pid);

        // extraer los datos
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        let products = JSON.parse(data);

        // matchear los indices con el :PID
        const index = products.findIndex(product => product.id === productId);

        // existe?
        if (index !== -1) {
            // actualizar producto
            products[index] = {
                ...products[index],
                title,
                description,
                code,
                price,
                stock,
                category,
                thumbnails
            };

            //escribir
            fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

            //repuesta
            res.json(products[index]);
        } else {
            // error no existe
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        // error 500 server
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// Eliminar un producto por su id
router.delete('/:pid', (req, res) => {
    try {
        const productId = parseInt(req.params.pid);

        const data = fs.readFileSync('./data/products.json', 'utf-8');
        let products = JSON.parse(data);

        const index = products.findIndex(product => product.id === productId);

        if (index !== -1) {
            // eliminar
            products.splice(index, 1);

            fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf-8');

            res.json({ message: "Producto eliminado exitosamente" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

module.exports = router;
