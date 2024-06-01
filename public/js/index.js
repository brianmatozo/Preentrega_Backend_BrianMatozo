document.addEventListener('DOMContentLoaded', (event) => {
    // console.log('DOM cargado');
    const socket = io();

    // Recibir la lista inicial de productos
    socket.on('products', (products) => {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        products.forEach(product => {
            const listItem = document.createElement('li');
            listItem.textContent = product.title;
            productList.appendChild(listItem);
        });
    });

    // Actualizar la lista cuando se crea un nuevo producto
    // socket.on('productCreated', (newProduct) => {
    //     const productList = document.getElementById('product-list');
    //     const listItem = document.createElement('li');
    //     listItem.textContent = newProduct.title;
    //     productList.appendChild(listItem);
    // });

    // crear productos
    const createProductForm = document.getElementById('create-product-form');
    // console.log('event listener ready');
    createProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // console.log('form enviado');
        const formData = new FormData(createProductForm);
        const newProduct = {
            title: formData.get('title'),
            description: formData.get('description'),
            code: formData.get('code'),
            price: formData.get('price'),
            stock: formData.get('stock'),
            category: formData.get('category'),
            thumbnails: formData.getAll('thumbnails')
        };
        // console.log("creando nuevo producto:", newProduct);
        socket.emit('createProduct', newProduct);
    });
});
