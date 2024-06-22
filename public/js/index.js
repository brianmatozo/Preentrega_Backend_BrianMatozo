function renderProduct(product, cartId) {
    const productList = document.querySelector('.productContainer');
    const productCard = document.createElement('div');
    productCard.classList.add('card', 'm-2', 'product-card');
    productCard.style.width = '18rem';
    productCard.setAttribute('data-id', product._id);

    const productImg = product.thumbnails[0] ? product.thumbnails[0] : 'default-image.jpg';

    productCard.innerHTML = `
        <img src="${productImg}" class="card-img-top" alt="${product.title}">
        <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">${product.description}</p>
            <p class="product-id">${product._id}</p>
            <p class="card-text"><strong>Price:</strong> $${product.price}</p>
            <p class="card-text"><strong>Category:</strong> ${product.category}</p>
            <div class="btn-group">
                <a href="/api/products/${product._id}" class="btn btn-primary rounded-end-2 me-2">Ver detalles</a>
                <form id="add-to-cart-form-${this._id}" action="/api/carts/${cartId}/product/${product._id}" method="POST">
                    <button type="submit" class="btn btn-success rounded-end-2">Agregar al carrito</button>
                </form>
            </div>
        </div>
    `;
    productList.appendChild(productCard);
}

document.addEventListener('DOMContentLoaded', () => {
    const addToCartForms = document.querySelectorAll('[id^="add-to-cart-form-"]');

    addToCartForms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita que el formulario se envíe automáticamente

            const formData = new FormData(form);
            const url = form.getAttribute('action');
            const options = {
                method: 'POST', // Cambia a DELETE si es necesario
                body: formData
            };

            try {
                const response = await fetch(url, options);

                if (!response.ok) {
                    throw new Error('Error al agregar al carrito');
                }
                window.location.reload();
            } catch (error) {
                console.error('Error al agregar al carrito:', error);
                // Manejar el error y mostrar un mensaje al usuario si es necesario
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
    const cartId = document.getElementById('cartId').value;

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



    socket.on('productCreated', (product) => {
        renderProduct(product, cartId);
    });

    // eliminar productos
    const deleteProductForm = document.getElementById('delete-product-form');
    deleteProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(deleteProductForm);
        const productId = formData.get('productId').trim();
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
