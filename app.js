const WA_NUMBER = "51947162223";

// ==========================================
// 1. PRODUCTOS POR DEFECTO
// ==========================================

const defaultProducts = [
    {
        id: "p1",
        name: "Top básico oliva",
        price: 59,
        image: "assets/cf103c1fc2b8f13ca2f96da2dfe3c553.jpg",
        category: "tops",
        tag: "BESTSELLER"
    },
    {
        id: "p2",
        name: "Top azul casual",
        price: 65,
        image: "assets/c1db035ed6a141e5fd7bbd9fb2aef8a6.jpg",
        category: "tops",
        tag: "NEW IN"
    },
    {
        id: "p3",
        name: "Top negro esencial",
        price: 55,
        image: "assets/c96cbeff02d07b1c3304fefb6e7cea19.jpg",
        category: "tops",
        tag: "ESSENTIAL"
    },
    {
        id: "p4",
        name: "Top neutro daily",
        price: 59,
        image: "assets/a8caa758682a93c72fa725900074e65a.jpg",
        category: "casual",
        tag: "NEW IN"
    },
    {
        id: "p5",
        name: "Top blanco soft",
        price: 62,
        image: "assets/8d42d2c4189fc62a13d2dd86f3066710.jpg",
        category: "tops",
        tag: "FAVORITO"
    },
    {
        id: "p6",
        name: "Look casual verde",
        price: 89,
        image: "assets/e0973ef5761f53dfdc5ca2fb81977162.jpg",
        category: "casual",
        tag: "CASUAL"
    },
    {
        id: "p7",
        name: "Top negro + denim",
        price: 69,
        image: "assets/61bc00e743f616ac698f5fc6d25fb8e2.jpg",
        category: "street",
        tag: "STREET"
    },
    {
        id: "p8",
        name: "Look urbano daily",
        price: 99,
        image: "assets/2814edb62a6218d32bed28962fe520d8.jpg",
        category: "street",
        tag: "LOOK"
    }
];


// ==========================================
// 2. ESTADO DE LA TIENDA
// ==========================================

function getProducts() { return defaultProducts; }

let products = getProducts();
async function loadProductsFromSupabase() {
    try {
        const { data, error } = await supabaseClient.from("products").select("*").order("created_at", { ascending: true });
        if (error) throw error;
        if (Array.isArray(data) && data.length) {
            products = data.map(product => ({ ...product, tag: product.tag || "SUNDBLOOM" }));
            renderProducts();
        }
    } catch (error) {
        console.error("No se pudieron cargar los productos de Supabase:", error.message);
    }
}

let cart = [];
let activeFilter = "all";
let searchTerm = "";


// ==========================================
// 3. FUNCIONES AUXILIARES
// ==========================================

const money = (amount) => {
    return "S/ " + Number(amount).toFixed(2);
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// ==========================================
// 4. MOSTRAR PRODUCTOS
// ==========================================

function renderProducts() {
    const grid = document.getElementById("product-grid");

    if (!grid) return;

    const shown = products.filter((product) => {
        const matchesCategory =
            activeFilter === "all" ||
            product.category === activeFilter;

        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const count = document.getElementById("product-count");

    if (count) {
        count.textContent =
            shown.length +
            (shown.length === 1 ? " PRENDA" : " PRENDAS");
    }

    grid.innerHTML = "";

    if (shown.length === 0) {
        grid.innerHTML = `
            <p class="empty-products">
                No encontramos prendas con esa búsqueda.
                Intenta con otro nombre.
            </p>
        `;

        return;
    }

    shown.forEach((product) => {
        const card = document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">

                <img
                    src="${escapeHtml(product.image)}"
                    alt="${escapeHtml(product.name)}"
                    loading="lazy"
                >

                <span class="product-badge">
                    ${escapeHtml(product.tag || "SUNDBLOOM")}
                </span>

                <button
                    class="heart"
                    type="button"
                    aria-label="Marcar favorito"
                    aria-pressed="false"
                >
                    ♡
                </button>

            </div>

            <div class="product-info">

                <p class="product-name">
                    ${escapeHtml(product.name)}
                </p>

                <div class="product-meta">

                    <p class="product-price">
                        ${money(product.price)}
                    </p>

                    <span class="product-tag">
                        SUNDBLOOM
                    </span>

                </div>

                <button
                    class="add-btn"
                    type="button"
                >
                    AÑADIR AL CARRITO +
                </button>

            </div>
        `;

        // Añadir al carrito
        card.querySelector(".add-btn").addEventListener(
            "click",
            () => addToCart(product.id)
        );

        // Marcar o quitar favorito
        card.querySelector(".heart").addEventListener(
            "click",
            (event) => {
                const button = event.currentTarget;

                button.classList.toggle("liked");

                const liked = button.classList.contains("liked");

                button.setAttribute("aria-pressed", liked);
                button.textContent = liked ? "♥" : "♡";
            }
        );

        // Ocultar imágenes que no se encuentren
        const image = card.querySelector("img");

        image.addEventListener("error", () => {
            image.style.visibility = "hidden";
        });

        grid.appendChild(card);
    });
}


// ==========================================
// 5. CARRITO DE COMPRAS
// ==========================================

function addToCart(id) {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const existingItem = cart.find((item) => item.id === id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({
            ...product,
            qty: 1
        });
    }

    updateCart();
    showCart();
}

function updateCart() {
    const count = cart.reduce(
        (total, item) => total + item.qty,
        0
    );

    const cartCount = document.getElementById("cart-count");
    const cartTitleCount = document.getElementById("cart-title-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    if (cartCount) {
        cartCount.textContent = count;
    }

    if (cartTitleCount) {
        cartTitleCount.textContent = `(${count})`;
    }

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <p class="empty">
                    Tu carrito está esperando algo bonito.
                </p>
            `;
        } else {
            cartItems.innerHTML = cart.map((product) => `
                <div class="cart-row">

                    <img
                        src="${escapeHtml(product.image)}"
                        alt="${escapeHtml(product.name)}"
                    >

                    <div>
                        <strong>
                            ${escapeHtml(product.name)}
                        </strong>

                        <p>
                            ${money(product.price)}
                            · Cantidad: ${product.qty}
                        </p>
                    </div>

                    <button
                        type="button"
                        data-remove-id="${escapeHtml(product.id)}"
                    >
                        Quitar
                    </button>

                </div>
            `).join("");

            // Eventos para quitar productos
            cartItems.querySelectorAll("[data-remove-id]").forEach(
                (button) => {
                    button.addEventListener("click", () => {
                        removeItem(button.dataset.removeId);
                    });
                }
            );
        }
    }

    const total = cart.reduce(
        (sum, product) => sum + product.price * product.qty,
        0
    );

    if (cartTotal) {
        cartTotal.innerHTML = `
            <span>Total estimado</span>
            <span>${money(total)}</span>
        `;
    }
}

function removeItem(id) {
    cart = cart.filter((product) => product.id !== id);

    updateCart();
}


// ==========================================
// 6. ABRIR Y CERRAR CARRITO
// ==========================================

function showCart() {
    const panel = document.getElementById("cart-panel");
    const backdrop = document.getElementById("cart-backdrop");

    if (!panel || !backdrop) return;

    panel.hidden = false;

    requestAnimationFrame(() => {
        panel.classList.add("open");
    });

    backdrop.classList.add("visible");
    document.body.style.overflow = "hidden";

    updateCart();
}

function hideCart() {
    const panel = document.getElementById("cart-panel");
    const backdrop = document.getElementById("cart-backdrop");

    if (!panel || !backdrop) return;

    panel.classList.remove("open");
    backdrop.classList.remove("visible");

    document.body.style.overflow = "";

    setTimeout(() => {
        if (!panel.classList.contains("open")) {
            panel.hidden = true;
        }
    }, 300);
}


// ==========================================
// 7. FINALIZAR COMPRA POR WHATSAPP
// ==========================================

function checkout() {
    if (cart.length === 0) {
        alert("Agrega al menos una prenda antes de comprar.");
        return;
    }

    const lines = cart.map((product) => {
        const subtotal = product.price * product.qty;

        return `• ${product.name} x${product.qty} — ${money(subtotal)}`;
    }).join("\n");

    const total = cart.reduce(
        (sum, product) => sum + product.price * product.qty,
        0
    );

    const message = `
Hola SUNDBLOOM , 
Quiero consultar por este pedido:

${lines}

Total referencial: ${money(total)}

¿Me confirman disponibilidad y entrega en Chiclayo?
    `.trim();

    const url =
        "https://wa.me/" +
        WA_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.open(url, "_blank", "noopener");
}


// ==========================================
// 8. BÚSQUEDA DE PRODUCTOS
// ==========================================

function toggleSearch() {
    const box = document.getElementById("search-box");
    const input = document.getElementById("product-search");

    if (!box || !input) return;

    box.classList.toggle("visible");

    if (box.classList.contains("visible")) {
        input.focus();
    } else {
        input.value = "";
        searchTerm = "";

        renderProducts();
    }
}


// ==========================================
// 9. CONTACTO DIRECTO POR WHATSAPP
// ==========================================

function contactWhatsApp() {
    const url = "https://wa.me/" + WA_NUMBER;

    window.open(url, "_blank", "noopener");
}


// ==========================================
// 10. INICIALIZAR LA TIENDA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Cargar productos y carrito
    renderProducts();
    updateCart();
    loadProductsFromSupabase();

    // Filtros de categorías
    document.querySelectorAll(".filter-chip").forEach((button) => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".filter-chip").forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            activeFilter = button.dataset.filter;

            renderProducts();
        });

    });

    // Buscador
    const searchInput = document.getElementById("product-search");

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            searchTerm = event.target.value.trim();

            renderProducts();
        });
    }

    // Cerrar carrito al pulsar Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideCart();
        }
    });

    // Cerrar carrito al pulsar el fondo
    const backdrop = document.getElementById("cart-backdrop");

    if (backdrop) {
        backdrop.addEventListener("click", hideCart);
    }

});