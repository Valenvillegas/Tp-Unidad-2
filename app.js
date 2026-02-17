/* Si el producto no está agregado al carrito → renderizar botón "Agregar al carrito".
Si el producto sí está en el carrito → renderizar botón "Quitar del carrito" y el contador de cantidad con botones + y .
No permitir agregar más que el stock del producto (usa la propiedad stock que viene en los recursos de dummyjson).
No permitir decrementar por debajo de 0. Si se presiona cuando quantity es 1, el item debe eliminarse del carrito.
Si se quita el producto completamente, actualizar el botón del producto en el catálogo a "Agregar al carrito". */
let carrito = []
let productos = []
let cargandoProductos = false
let errorServidor = false
const productContainer = document.getElementById('products-container')
const cartContainer = document.getElementById('cart-container')
const btnVaciarCarrito = document.querySelector('.empty-cart-button')


async function consultaAlServidor() {
    try {
        setLoading(true)
        //Hace consultas HTTP
        //Response_http es un objeto con datos de la Response
        let response_http = await fetch(
            //URL a consultar
            'https://dummyjson.com/products',
            //Objeto de consulta
            {
                method: "GET", //Obtener la lista de posteos
            }
        )
        //Leemos y extraemos el JSON de la respuesta del servidor
        let response = await response_http.json()
        setTimeout(() => {
            setLoading(false)
            console.log(response)
            setProductos(response)
        }
            , 1000)
    } catch (error) {
        setErrorServidor()
    }
}



// renders

function setErrorServidor(error) {
    errorServidor = error
    renderError()
}


function renderError() {
    productContainer.innerHTML = `
        <div class="spinner-container">
            <h3 class="loading-text" style="color: var(--danger-color);">Error en el servidor</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Por favor intente más tarde</p>
        </div>
    `
}
function setLoading(new_loading_state) {
    cargandoProductos = new_loading_state
    renderLoadingProduct()
}

function renderLoadingProduct() {
    if (cargandoProductos) {
        productContainer.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
                <p class="loading-text">Cargando productos...</p>
            </div>
        `
    } else {
        productContainer.innerHTML = ''
    }
}

function setProductos(nuevosProductos) {
    productos = nuevosProductos
    renderProducts()
}
function renderProducts() {
    let plantilla_productos = ''
    for (let producto of productos.products) {
        const isInCart = carrito.find(product => product.id === producto.id) === undefined
        plantilla_productos += `
        <div class="product-card">
            <div class="information-product">
                <img src="${producto.thumbnail}" alt="${producto.title}" class="product-image"/>
                <h3 class="product-title">${producto.title}</h3>
                <p class="product-description" id="desc-${producto.id}">${producto.description}</p>
                <button class="btn-read-more" data-id="${producto.id}">Ver más</button>
                <p class="product-price">$${producto.price}</p>
            </div>
            <div class="button-container">
                ${isInCart
                ?
                ` <button class="add-to-cart-button" data-id="${producto.id}">Agregar al carrito</button>`
                : `
                    <button class="btn-eliminar" data-product_id="${producto.id}">Eliminar Producto</button>
                `
            }
                
            </div>
        </div>
        `
    }

    productContainer.innerHTML = plantilla_productos

    // Event listeners para "Ver más"
    const btnReadMore = document.querySelectorAll('.btn-read-more')
    btnReadMore.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id
            const desc = document.getElementById(`desc-${id}`)
            desc.classList.toggle('expanded')
            if (desc.classList.contains('expanded')) {
                e.target.textContent = 'Ver menos'
            } else {
                e.target.textContent = 'Ver más'
            }
        })
    })

    const btnAgregarAlCarrito = document.getElementsByClassName('add-to-cart-button')
    for (const btn of btnAgregarAlCarrito) {

        btn.addEventListener("click", () => {
            const idProducto = parseInt(btn.dataset.id)

            const producto = productos.products.find(p => p.id === idProducto)

            setCarrito({
                id: producto.id,
                title: producto.title,
                price: producto.price,
                quantity: 1
            })
        })
    }

    const btnEliminarDelCarrito = document.getElementsByClassName('btn-eliminar')
    for (const btn of btnEliminarDelCarrito) {

        btn.addEventListener("click", () => {
            const idProducto = parseInt(btn.dataset.product_id)

            const producto = productos.products.find(p => p.id === idProducto)

            setCarrito({
                id: producto.id,
                title: producto.title,
                price: producto.price,
                quantity: 0
            })
        })
    }
}


function setCarrito(nuevoCarrito) {
    const productoEnCarrito = carrito.find(product => product.id === nuevoCarrito.id)
    const productoEnStock = productos.products.find(product => product.id === nuevoCarrito.id)
    if (productoEnCarrito) {
        if (nuevoCarrito.quantity === 0) {
            carrito = carrito.filter(product => product.id !== nuevoCarrito.id)
        } else if (productoEnStock.stock < nuevoCarrito.quantity) {
            alert(`El producto ${productoEnCarrito.title} tiene un stock de ${productoEnStock.stock} unidades. No se puede agregar mas de ${productoEnStock.stock} unidades.`)
        } else {
            productoEnCarrito.quantity = nuevoCarrito.quantity
        }

    } else {
        if (nuevoCarrito.quantity > 0) {
            carrito.push(nuevoCarrito)
        }
    }
    renderCarrito(carrito)
    renderProducts()
}


function renderCarrito() {
    let plantilla_html = ''
    for (const product of carrito) {
        plantilla_html = plantilla_html + `
            <div class="cart-item">
                <h3>${product.title}</h3>
                <p>Precio unitario:${product.price}</p>
                <p>Precio:${product.price * product.quantity}</p>
                <div class='contenedor-modificadores-carrito'>
                    <button class="btn-decrementar button-modificador-carrito" data-id="${product.id}">-</button>
                    <p class="contador-productos">${product.quantity}</p>
                    <button class="btn-incrementar button-modificador-carrito" data-product_id="${product.id}">+</button>
                </div>
                <div class="center">
                <button class="btn-eliminar center" data-product_id="${product.id}">Eliminar</button>
                </div>
            </div>
        `
    }
    if (carrito.length === 0) {
        plantilla_html = '<p class="center">El carrito está vacío</p>'
    } else {
        plantilla_html += `
        <p class="cart-total">Total: $${renderTotal()}</p>
        <button class="confirmar-carrito">Confirmar compra</button>
        <button class="empty-cart-button">Vaciar carrito</button>
        `

    }

    cartContainer.innerHTML = plantilla_html

    const btnVaciarCarrito = document.querySelector('.empty-cart-button')

    if (btnVaciarCarrito) {
        btnVaciarCarrito.addEventListener("click", () => {
            carrito = []
            setCarrito({
                id: 0,
                title: '',
                price: 0,
                quantity: 0
            })
        })
    }


    const btnConfirmar = document.querySelector('.confirmar-carrito')
    const modalConfirmacion = document.getElementById('modal-confirmacion')
    const modalTotal = document.getElementById('modal-total')
    const btnCerrarModal = document.getElementById('close-modal-btn')

    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            modalTotal.textContent = '$' + renderTotal()
            modalConfirmacion.classList.remove('hidden')
        })
    }

    if (btnCerrarModal) {
        // Remover listener anterior para evitar duplicados si se renderiza múltiples veces
        const newBtn = btnCerrarModal.cloneNode(true);
        btnCerrarModal.parentNode.replaceChild(newBtn, btnCerrarModal);

        newBtn.addEventListener("click", () => {
            modalConfirmacion.classList.add('hidden')
            carrito = []
            setCarrito({
                id: 0,
                title: '',
                price: 0,
                quantity: 0
            })
        })
    }
    const btnIncrementar = document.getElementsByClassName('btn-incrementar')
    for (const btn of btnIncrementar) {
        btn.addEventListener("click", () => {
            const idProducto = parseInt(btn.dataset.product_id)
            const producto = carrito.find(p => p.id === idProducto)
            setCarrito({
                id: producto.id,
                title: producto.title,
                price: producto.price,
                quantity: producto.quantity + 1
            })
        }
        )
    }
    const btnDecrementar = document.getElementsByClassName('btn-decrementar')
    for (const btn of btnDecrementar) {
        const idProducto = parseInt(btn.dataset.id)
        const producto = carrito.find(p => p.id === idProducto)
        btn.addEventListener("click", () => {
            setCarrito({
                id: producto.id,
                title: producto.title,
                price: producto.price,
                quantity: producto.quantity - 1
            })
        })
    }

}

function renderTotal() {
    let total = 0
    for (const product of carrito) {
        total += product.price * product.quantity
    }
    return total
}

consultaAlServidor()
renderCarrito()