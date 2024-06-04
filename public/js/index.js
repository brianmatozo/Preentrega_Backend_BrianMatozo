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
        const productList = document.querySelector('.container.d-flex');
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
                <p class="product-id">${product.id}</p>
                <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                <p class="card-text"><strong>Category:</strong> ${product.category}</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
        `;
        productList.appendChild(productCard);
    }

    socket.on('productCreated', (product) => {
        renderProduct(product);
    });


    


    // eliminar productos
    const deleteProductForm = document.getElementById('delete-product-form');
    deleteProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(deleteProductForm);
        const productId = parseInt(formData.get('productId'), 10);
        socket.emit('deleteProduct', productId);
    });

    function removeProduct(productId) {
        const productList = document.querySelector('.container.d-flex');
        const productCard = productList.querySelector(`.product-card[data-id="${productId}"]`);
        if (productCard) {
            productCard.innerHTML = '';
            productList.removeChild(productCard);
        }
    }

    socket.on('productDeleted', (productId) => {
            removeProduct(productId);
    });

});
