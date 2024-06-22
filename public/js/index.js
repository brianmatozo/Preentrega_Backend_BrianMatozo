document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();

    // crear productos
    const createProductForm = document.getElementById('create-product-form');
    createProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
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
        socket.emit('createProduct', newProduct);
    });

    function renderProduct(product) {
        const productList = document.querySelector('.productContainer');
        const productCard = document.createElement('div');
        productCard.classList.add('card', 'm-2', 'product-card');
        productCard.style.width = '18rem';
        productCard.setAttribute('data-id', product.id);
    
        const productImg = product.thumbnails[0] ? product.thumbnails[0] : 'default-image.jpg';
    
        productCard.innerHTML = `
            <img src="${productImg}" class="card-img-top" alt="${product.title}">
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">${product.description}</p>
                <p class="product-id">${product._id}</p>
                <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                <p class="card-text"><strong>Category:</strong> ${product.category}</p>
                <a href="/api/products/{{this.id}}" class="btn btn-primary">Ver detalles</a>
                <form action="/api/carts/{{../cartId}}/product/{{this.id}}" method="POST">
                    <button type="submit" class="btn btn-success">Agregar al carrito</button>
                </form> 
            </div>
        `;
        productList.appendChild(productCard);
    }
    
    socket.on('productCreated', (product) => {
        renderProduct(product);
    });

    const deleteProductForm = document.getElementById('delete-product-form');
    deleteProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(deleteProductForm);
        const productId = formData.get('productId').trim();  // Convertir a cadena
        socket.emit('deleteProduct', productId);
    });

    function removeProduct(productId) {
        // Remover de la lista de productos en home.handlebars
        const productListHome = document.querySelector('.productContainer');
        const productCardHome = productListHome.querySelector(`.product-card[data-id="${productId}"]`);
        if (productCardHome) {
            productCardHome.innerHTML = '';
            productListHome.removeChild(productCardHome);
        }

        // Remover de la lista de productos en carts.handlebars
        const productListCart = document.querySelector('.cartContainer');
        const productCardCart = productListCart.querySelector(`.product-card[data-id="${productId}"]`);
        if (productCardCart) {
            productCardCart.innerHTML = '';
            productListCart.removeChild(productCardCart);
        }
    }

    socket.on('productDeleted', (productId) => {
            removeProduct(productId);
    });

});
