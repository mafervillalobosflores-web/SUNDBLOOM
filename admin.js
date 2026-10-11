// ========================================
// SUNDBLOOM - PANEL DE ADMINISTRACIÓN
// ========================================

// Lista inicial de productos
const initialProducts = [
    {
        id: "p1",
        name: "Top básico oliva",
        price: 59,
        image: "assets/cf103c1fc2b8f13ca2f96da2dfe3c553.jpg",
        category: "tops"
    },
    {
        id: "p2",
        name: "Top azul casual",
        price: 65,
        image: "assets/c1db035ed6a141e5fd7bbd9fb2aef8a6.jpg",
        category: "tops"
    },
    {
        id: "p3",
        name: "Top negro esencial",
        price: 55,
        image: "assets/c96cbeff02d07b1c3304fefb6e7cea19.jpg",
        category: "tops"
    },
    {
        id: "p4",
        name: "Top neutro daily",
        price: 59,
        image: "assets/a8caa758682a93c72fa725900074e65a.jpg",
        category: "casual"
    },
    {
        id: "p5",
        name: "Top blanco soft",
        price: 62,
        image: "assets/8d42d2c4189fc62a13d2dd86f3066710.jpg",
        category: "tops"
    },
    {
        id: "p6",
        name: "Look casual verde",
        price: 89,
        image: "assets/e0973ef5761f53dfdc5ca2fb81977162.jpg",
        category: "casual"
    },
    {
        id: "p7",
        name: "Top negro + denim",
        price: 69,
        image: "assets/61bc00e743f616ac698f5fc6d25fb8e2.jpg",
        category: "street"
    },
    {
        id: "p8",
        name: "Look urbano daily",
        price: 99,
        image: "assets/2814edb62a6218d32bed28962fe520d8.jpg",
        category: "street"
    }
];


// ========================================
// LEER PRODUCTOS GUARDADOS
// ========================================

function readProducts() {
    try {
        const savedProducts = localStorage.getItem("sundbloom_products");

        if (savedProducts) {
            return JSON.parse(savedProducts);
        }

        return initialProducts;

    } catch (error) {
        return initialProducts;
    }
}

// Productos que se muestran en el administrador
let products = readProducts();


// ========================================
// FUNCIÓN PARA PROTEGER EL TEXTO HTML
// ========================================

const esc = (text) => {
    return String(text).replace(/[&<>"']/g, character => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
};


// ========================================
// GUARDAR PRODUCTOS
// ========================================

function save() {
    localStorage.setItem(
        "sundbloom_products",
        JSON.stringify(products)
    );

    render();
}


// ========================================
// MOSTRAR PRODUCTOS EN EL ADMINISTRADOR
// ========================================

function render() {
    const root = document.getElementById("admin-products");

    root.innerHTML = "";

    // Mensaje cuando no hay productos
    if (products.length === 0) {
        root.innerHTML = "<p>No hay prendas publicadas.</p>";
        return;
    }

    // Recorrer la lista de productos
    products.forEach(product => {
        const item = document.createElement("div");

        item.className = "admin-item";

        // Crear la tarjeta del producto
        item.innerHTML = `
            <img
                src="${product.image}"
                alt="${esc(product.name)}"
            >

            <strong>${esc(product.name)}</strong>

            <p>S/ ${Number(product.price).toFixed(2)}</p>

            <button data-id="${product.id}">
                ELIMINAR
            </button>
        `;

        // Función para eliminar un producto
        item.querySelector("button").onclick = () => {
            if (confirm("¿Eliminar esta prenda?")) {

                products = products.filter(
                    productItem => productItem.id !== product.id
                );

                save();
            }
        };

        // Agregar la tarjeta a la página
        root.appendChild(item);
    });
}


// ========================================
// AGREGAR NUEVOS PRODUCTOS
// ========================================

document.getElementById("product-form").addEventListener("submit", event => {

    // Evitar que se recargue la página
    event.preventDefault();

    // Obtener los datos del formulario
    const name = document.getElementById("product-name").value.trim();

    const price = Number(
        document.getElementById("product-price").value
    );

    const file = document.getElementById("product-image").files[0];

    // Validar los datos ingresados
    if (!file || !name || price <= 0) {
        return;
    }

    // Leer la imagen seleccionada
    const reader = new FileReader();

    reader.onload = () => {

        // Crear el nuevo producto
        products.unshift({
            id: "p" + Date.now(),
            name: name,
            price: price,
            image: reader.result
        });

        // Guardar y actualizar el catálogo
        try {
            save();

            event.target.reset();

            alert("Prenda publicada en este navegador.");

        } catch (error) {
            alert(
                "La foto puede ser demasiado pesada. " +
                "Prueba con una imagen más pequeña."
            );
        }
    };

    reader.readAsDataURL(file);
});


// ========================================
// CARGAR LOS PRODUCTOS AL ABRIR LA PÁGINA
// ========================================

render();