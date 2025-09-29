// ==== Carrusel simple (index) ====
/**
 * Índice del slide activo del carrusel simple.
 * @type {number}
 */
let current = 0;

/** @type {NodeListOf<HTMLElement>} */
const slides = document.querySelectorAll(".slider__slide");
/** @type {NodeListOf<HTMLButtonElement>} */
const dots = document.querySelectorAll(".slider__dot");
/** @type {HTMLButtonElement|null} */
const prevBtn = document.getElementById("prevSlide");
/** @type {HTMLButtonElement|null} */
const nextBtn = document.getElementById("nextSlide");

/**
 * Id del setInterval que avanza el carrusel automáticamente.
 * @type {number|undefined}
 */
let timer;

/**
 * Muestra un slide por índice y actualiza estado ARIA y “dots”.
 * @function showSlide
 * @param {number} idx - Índice (puede ser negativo o mayor; se normaliza en módulo).
 */
const showSlide = (idx) => {
  if (!slides.length) return;
  current = (idx + slides.length) % slides.length;
  slides.forEach((s, i) => {
    s.setAttribute("aria-hidden", i !== current ? "true" : "false");
    s.classList.toggle("is-active", i === current);
  });
  dots.forEach((d, i) => {
    const active = i === current;
    d.classList.toggle("is-active", active);
    d.setAttribute("aria-current", active ? "true" : "false");
  });
};

/**
 * Avanza al siguiente slide.
 * @function next
 */
const next = () => {
  showSlide(current + 1);
};

/**
 * Retrocede al slide anterior.
 * @function prev
 */
const prev = () => {
  showSlide(current - 1);
};

/**
 * Inicia el auto-avance del carrusel.
 * @function startAuto
 */
const startAuto = () => {
  stopAuto();
  timer = setInterval(next, 5000);
};

/**
 * Detiene el auto-avance del carrusel.
 * @function stopAuto
 */
const stopAuto = () => {
  if (timer) clearInterval(timer);
};

window.addEventListener("DOMContentLoaded", () => {
  showSlide(0);
  startAuto();
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      next();
      startAuto();
    });
  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      prev();
      startAuto();
    });
  dots.forEach((d, i) =>
    d.addEventListener("click", () => {
      showSlide(i);
      startAuto();
    })
  );
});

// ---------------------------
// Helpers y Calculadora
// ---------------------------

/**
 * Muestra un mensaje en un alert del navegador.
 * @function alertar
 * @param {string} msg - Mensaje a mostrar.
 */
const alertar = (msg) => {
  alert(msg);
};

/**
 * Limpia el valor de un input y le da el foco.
 * @function limpiarYFocus
 * @param {HTMLInputElement|HTMLSelectElement} input - Campo a limpiar y enfocar.
 */
const limpiarYFocus = (input) => {
  input.value = "";
  input.focus();
};

/**
 * Valida los campos de la calculadora de financiación.
 * @function validarCalculadora
 * @returns {false | {precio:number, anticipo:number, tasa:number, meses:number}}
 *  Objeto con valores válidos o `false` si hay algún error (y ya se alertó).
 */
const validarCalculadora = () => {
  const precioEl = document.getElementById("precio");
  const anticipoEl = document.getElementById("anticipo");
  const tasaEl = document.getElementById("tasa");
  const mesesEl = document.getElementById("meses");

  const precio = Number(precioEl.value);
  if (!precio || precio <= 0) {
    alertar("Ingresá un precio válido mayor a 0.");
    limpiarYFocus(precioEl);
    return false;
  }

  const anticipo = Number(anticipoEl.value || 0);
  if (anticipo < 0) {
    alertar("El anticipo no puede ser negativo.");
    limpiarYFocus(anticipoEl);
    return false;
  }
  if (anticipo > precio) {
    alertar("El anticipo no puede superar el precio del vehículo.");
    limpiarYFocus(anticipoEl);
    return false;
  }

  const tasa = Number(tasaEl.value || 0);
  if (tasa < 0 || tasa > 200) {
    alertar("Ingresá una tasa entre 0% y 200%.");
    limpiarYFocus(tasaEl);
    return false;
  }

  const meses = Number(mesesEl.value);
  if (![12, 24, 36, 48].includes(meses)) {
    alertar("Seleccioná la cantidad de meses.");
    mesesEl.focus();
    return false;
  }

  return { precio, anticipo, tasa, meses };
};

/**
 * Calcula y muestra la cuota mensual estimada según los valores ingresados.
 * Usa el sistema francés cuando la tasa es > 0; si es 0, reparte en partes iguales.
 * @function calcularCuota
 */
const calcularCuota = () => {
  const vals = validarCalculadora();
  const out = document.getElementById("resultado");

  if (!vals) {
    if (out) out.textContent = "";
    return;
  }

  const { precio, anticipo, tasa, meses } = vals;
  const monto = Math.max(precio - anticipo, 0);
  const i = tasa / 100 / 12;

  let cuota = 0;
  if (i > 0) {
    cuota =
      (monto * (i * Math.pow(1 + i, meses))) / (Math.pow(1 + i, meses) - 1);
  } else {
    cuota = monto / meses;
  }

  if (out) out.textContent = `Cuota estimada: USD ${cuota.toFixed(2)} / mes`;
};

// -------------------------------------------
// Catálogo: filtros + búsqueda + add-to-cart
// -------------------------------------------

/**
 * Módulo de catálogo (filtros, búsqueda, y “agregar al carrito”).
 * Se auto-ejecuta al cargar si existe `.catalog-grid`.
 * @module Catalogo
 */
(() => {
  /** @type {HTMLElement|null} */
  const grid = document.querySelector(".catalog-grid");
  if (!grid) return;

  // ----- Prefiltro por URL -----
  const params = new URLSearchParams(location.search);
  /** @type {"auto"|"camioneta"|null} */
  let forcedTipo = params.get("tipo"); // 'auto' | 'camioneta' | null

  // (Fallback: si alguna vez llegan con #autos o #camionetas)
  if (!forcedTipo) {
    const h = (location.hash || "").replace("#", "").toLowerCase();
    if (h === "autos") forcedTipo = "auto";
    if (h === "camionetas") forcedTipo = "camioneta";
  }

  // Ocultar fieldset "Tipo" si hay prefiltro
  const tipoInputs = document.querySelectorAll('input[name="tipo"]');
  const tipoFieldset = tipoInputs[0]?.closest("fieldset");
  if (forcedTipo && tipoFieldset) {
    tipoFieldset.hidden = true; // lo saca de la UI
    tipoInputs.forEach((i) => (i.checked = false)); // evitamos estados mezclados
  }

  // Controles de UI
  /** @type {HTMLInputElement|null} */ const q = document.getElementById("q");
  const btnBuscar = document.getElementById("btn-buscar");
  const btnAplicar = document.getElementById("btn-aplicar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  const anioMin = document.getElementById("anio-min");
  const anioMax = document.getElementById("anio-max");
  const precioMin = document.getElementById("precio-min");
  const precioMax = document.getElementById("precio-max");

  /**
   * Devuelve valores chequeados de un grupo de checkboxes por name.
   * @param {string} name
   * @returns {string[]}
   */
  const getChecks = (name) =>
    [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(
      (i) => i.value
    );

  /**
   * Evalúa si una card pasa los filtros actuales.
   * @param {HTMLElement} card
   * @returns {boolean}
   */
  const pasaFiltros = (card) => {
    const texto = (q?.value || "").toLowerCase();

    // Si hay prefiltro -> ignoro checkboxes "Tipo" y fuerzo ese valor
    const tipos = forcedTipo ? [forcedTipo] : getChecks("tipo");
    const marcas = getChecks("marca");

    const anio = Number(card.dataset.anio || 0);
    const precio = Number(card.dataset.precio || 0);
    const title =
      card.querySelector(".product-title")?.textContent.toLowerCase() || "";
    const meta =
      card.querySelector(".product-meta")?.textContent.toLowerCase() || "";

    const buscaOk = !texto || title.includes(texto) || meta.includes(texto);
    const tipoOk = !tipos.length || tipos.includes(card.dataset.tipo);
    const marcaOk = !marcas.length || marcas.includes(card.dataset.marca);
    const anioOk =
      (!anioMin?.value || anio >= Number(anioMin.value)) &&
      (!anioMax?.value || anio <= Number(anioMax.value));
    const precioOk =
      (!precioMin?.value || precio >= Number(precioMin.value)) &&
      (!precioMax?.value || precio <= Number(precioMax.value));

    return buscaOk && tipoOk && marcaOk && anioOk && precioOk;
  };

  /**
   * Aplica todos los filtros y actualiza visibilidad de cards.
   * @function aplicar
   */
  const aplicar = () => {
    const cards = [...grid.querySelectorAll(".product-card")];
    let visibles = 0;
    cards.forEach((c) => {
      const ok = pasaFiltros(c);
      c.style.display = ok ? "" : "none";
      if (ok) visibles++;
    });
    grid.setAttribute("data-visibles", String(visibles));
  };

  /**
   * Reinicia el formulario de filtros y re-aplica.
   * @function limpiar
   */
  const limpiar = () => {
    document.getElementById("form-filtros")?.reset();
    if (q) q.value = "";
    aplicar();
  };

  ["change", "keyup"].forEach((evt) =>
    grid.closest("main").addEventListener(evt, (e) => {
      if (e.target.matches("input,select")) aplicar();
    })
  );
  btnBuscar && btnBuscar.addEventListener("click", aplicar);
  btnAplicar && btnAplicar.addEventListener("click", aplicar);
  btnLimpiar && btnLimpiar.addEventListener("click", limpiar);

  aplicar();

  // === Add to cart ===
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-cart");
    if (!btn) return;
    const id = btn.dataset.id;
    const card = document.getElementById(id);
    const title = card.querySelector(".product-title")?.textContent || id;
    const price = Number(card.dataset.precio || 0);
    const cart = getCart();
    // si ya existe, suma qty; si no, push
    const idx = cart.findIndex((x) => x.id === id);
    if (idx >= 0) {
      cart[idx].qty += 1;
    } else {
      cart.push({ id, title, price, qty: 1 });
    }
    setCart(cart);
    updateCartCount();
    if (isCartOpen()) renderCart();
    btn.textContent = "Agregado ✓";
    setTimeout(() => (btn.textContent = "Agregar al carrito"), 1000);
  });
})();

// ---------------------------
// Carrito compartido (estado + render)
// ---------------------------

/**
 * @typedef {Object} CartItem
 * @property {string} id - Identificador de producto.
 * @property {string} title - Título/Descripción.
 * @property {number} price - Precio unitario en USD.
 * @property {number} qty - Cantidad.
 * @property {"vehículo"|"accesorio"|string} [type] - Tipo (opcional).
 */

/** Clave de almacenamiento del carrito. */
const CART_KEY = "aurum_cart";
/** Clave del vehículo elegido. */
const SELECTED_KEY = "aurum_selected_vehicle";

/**
 * Obtiene el carrito desde localStorage.
 * @function getCart
 * @returns {CartItem[]}
 */
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");

/**
 * Guarda el carrito en localStorage.
 * @function setCart
 * @param {CartItem[]} arr - Items a persistir.
 */
const setCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr));

/**
 * Persistir vehículo seleccionado.
 * @function setSelectedVehicle
 * @param {CartItem} obj - Vehículo elegido (qty=1).
 */
const setSelectedVehicle = (obj) =>
  localStorage.setItem(SELECTED_KEY, JSON.stringify(obj));

/**
 * Obtiene el vehículo seleccionado.
 * @function getSelectedVehicle
 * @returns {CartItem|null}
 */
const getSelectedVehicle = () =>
  JSON.parse(localStorage.getItem(SELECTED_KEY) || "null");

/**
 * Calcula el total en USD del carrito.
 * @function cartTotal
 * @param {CartItem[]} arr - Items del carrito.
 * @returns {number} Total acumulado.
 */
const cartTotal = (arr) => {
  return arr.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
};

/**
 * Actualiza el badge de cantidad de unidades del carrito.
 * @function updateCartCount
 */
const updateCartCount = () => {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = getCart();
  const units = cart.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
  el.textContent = String(units);
};

/**
 * Renderiza items y total del carrito en contenedores específicos.
 * @function renderCartInto
 * @param {string} itemsId - Id del contenedor de items.
 * @param {string} totalId - Id del elemento donde se muestra el total.
 */
const renderCartInto = (itemsId, totalId) => {
  const cont = document.getElementById(itemsId);
  const totalEl = document.getElementById(totalId);
  if (!cont || !totalEl) return;

  const cart = getCart();
  cont.innerHTML = "";

  if (cart.length === 0) {
    cont.innerHTML = '<p class="meta">Tu carrito está vacío.</p>';
    totalEl.textContent = "USD 0.00";
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.dataset.id = item.id;
    const tipo = item.type ? `<span class="meta">(${item.type})</span>` : "";
    row.innerHTML = `
      <div>
        <h4>${item.title} ${tipo}</h4>
        <div class="meta">Precio unidad: <span class="price">USD ${Number(
          item.price
        ).toFixed(2)}</span></div>
      </div>
      <div class="qty-row">
        <button class="qty-btn" data-act="dec" aria-label="Disminuir cantidad">−</button>
        <span class="meta" aria-live="polite">${item.qty}</span>
        <button class="qty-btn" data-act="inc" aria-label="Aumentar cantidad">+</button>
        <button class="remove-btn" data-act="rm" aria-label="Quitar del carrito">Quitar</button>
      </div>
    `;
    cont.appendChild(row);
  });

  totalEl.textContent = `USD ${cartTotal(cart).toFixed(2)}`;
};

/**
 * Renderiza el carrito tanto en el drawer como en el panel lateral (si existen).
 * @function renderCart
 */
const renderCart = () => {
  renderCartInto("cart-items", "cart-total"); // Drawer
  renderCartInto("cart-panel-items", "cart-panel-total"); // Panel fijo
};

/**
 * Indica si el drawer del carrito está abierto.
 * @function isCartOpen
 * @returns {boolean}
 */
const isCartOpen = () => {
  const drawer = document.getElementById("cart-drawer");
  return drawer && drawer.classList.contains("is-open");
};

/**
 * Abre el drawer del carrito, mostrando backdrop y renderizando items.
 * @function openCart
 */
const openCart = () => {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  if (!drawer || !backdrop) return;
  drawer.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
  });
  renderCart();
};

/**
 * Cierra el drawer del carrito y oculta el backdrop.
 * @function closeCart
 */
const closeCart = () => {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open");
  backdrop.classList.remove("is-open");
  setTimeout(() => {
    drawer.hidden = true;
    backdrop.hidden = true;
  }, 200);
};

/**
 * Ata los eventos principales del carrito (abrir/cerrar, modificar cantidades, vaciar).
 * @function attachCartEvents
 */
const attachCartEvents = () => {
  const openBtn = document.getElementById("open-cart");
  const closeBtn = document.getElementById("close-cart");
  const backdrop = document.getElementById("cart-backdrop");
  const items = document.getElementById("cart-items");
  const itemsPanel = document.getElementById("cart-panel-items");
  const clearBtn =
    document.getElementById("cart-clear") ||
    document.getElementById("cart-clear-2");

  openBtn && openBtn.addEventListener("click", openCart);
  closeBtn && closeBtn.addEventListener("click", closeCart);
  backdrop && backdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isCartOpen()) closeCart();
  });

  /**
   * Delegado de clicks en los contenedores de items del carrito.
   * Incrementa, decrementa o remueve ítems.
   * @param {MouseEvent} e
   */
  const onClickItems = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.act;
    const row = btn.closest(".cart-item");
    const id = row?.dataset.id;
    if (!id) return;

    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === id);
    if (idx < 0) return;

    if (act === "inc") {
      cart[idx].qty += 1;
    }
    if (act === "dec") {
      cart[idx].qty = Math.max(1, cart[idx].qty - 1);
    }
    if (act === "rm") {
      cart.splice(idx, 1);
    }

    setCart(cart);
    updateCartCount();
    renderCart();
  };

  items && items.addEventListener("click", onClickItems);
  itemsPanel && itemsPanel.addEventListener("click", onClickItems);

  clearBtn &&
    clearBtn.addEventListener("click", () => {
      setCart([]);
      updateCartCount();
      renderCart();
    });
};

// Inicialización común
window.addEventListener("DOMContentLoaded", () => {
  const calcBtn = document.getElementById("calc-btn");
  if (calcBtn) calcBtn.addEventListener("click", calcularCuota);
  updateCartCount();
  attachCartEvents();
  renderCart();
});

// ---------------------------
// Catálogo: búsqueda + filtros + prefiltro por URL (módulo reducido)
// ---------------------------

/**
 * Módulo reducido de catálogo (marca activo en el nav y aplica filtros).
 * @module CatalogoURL
 */
(() => {
  const grid = document.querySelector(".catalog-grid");
  if (!grid) return;

  // --- Prefiltro por URL: auto | camioneta ---
  const params = new URLSearchParams(location.search);
  /** @type {"auto"|"camioneta"|null} */
  let forcedTipo = params.get("tipo");

  // fallback por hash antiguo
  if (!forcedTipo) {
    const h = (location.hash || "").replace("#", "").toLowerCase();
    if (h === "autos") forcedTipo = "auto";
    if (h === "camionetas") forcedTipo = "camioneta";
  }

  // Ocultar "Tipo" en la UI si hay prefiltro (refuerzo al CSS del <head>)
  const tipoFieldset = document.getElementById("filtro-tipo");
  if (forcedTipo && tipoFieldset) tipoFieldset.hidden = true;

  // Marcar activo en el nav
  const nav = document.querySelector(".main-nav");
  if (nav) {
    nav.querySelectorAll("a").forEach((a) => a.classList.remove("is-primary"));
    if (forcedTipo) {
      nav
        .querySelector(`a[href*="tipo=${forcedTipo}"]`)
        ?.classList.add("is-primary");
    } else {
      nav
        .querySelector(`a[href$="catalogo.html"]`)
        ?.classList.add("is-primary");
    }
  }

  // --- Controles UI ---
  const q = document.getElementById("q");
  const btnBuscar = document.getElementById("btn-buscar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  const anioMin = document.getElementById("anio-min");
  const anioMax = document.getElementById("anio-max");
  const precioMin = document.getElementById("precio-min");
  const precioMax = document.getElementById("precio-max");

  const getChecks = (name) =>
    [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(
      (i) => i.value
    );

  const pasaFiltros = (card) => {
    const texto = (q?.value || "").toLowerCase();
    const tipos = forcedTipo ? [forcedTipo] : getChecks("tipo");
    const marcas = getChecks("marca");
    const anio = Number(card.dataset.anio || 0);
    const precio = Number(card.dataset.precio || 0);
    const title =
      card.querySelector(".product-title")?.textContent.toLowerCase() || "";
    const meta =
      card.querySelector(".product-meta")?.textContent.toLowerCase() || "";
    const buscaOk = !texto || title.includes(texto) || meta.includes(texto);
    const tipoOk = !tipos.length || tipos.includes(card.dataset.tipo);
    const marcaOk = !marcas.length || marcas.includes(card.dataset.marca);
    const anioOk =
      (!anioMin?.value || anio >= Number(anioMin.value)) &&
      (!anioMax?.value || anio <= Number(anioMax.value));
    const precioOk =
      (!precioMin?.value || precio >= Number(precioMin.value)) &&
      (!precioMax?.value || precio <= Number(precioMax.value));
    return buscaOk && tipoOk && marcaOk && anioOk && precioOk;
  };

  const aplicar = () => {
    const cards = [...grid.querySelectorAll(".product-card")];
    let visibles = 0;
    cards.forEach((c) => {
      const ok = pasaFiltros(c);
      c.style.display = ok ? "" : "none";
      if (ok) visibles++;
    });
    grid.setAttribute("data-visibles", String(visibles));
  };

  const limpiar = () => {
    document.getElementById("form-filtros")?.reset();
    if (q) q.value = "";
    // mantener forcedTipo activo al limpiar
    aplicar();
  };

  ["change", "keyup"].forEach((evt) =>
    grid.closest("main").addEventListener(evt, (e) => {
      if (e.target.matches("input,select")) aplicar();
    })
  );
  btnBuscar && btnBuscar.addEventListener("click", aplicar);
  btnLimpiar && btnLimpiar.addEventListener("click", limpiar);

  // Primera pasada ya con el prefiltro aplicado
  aplicar();
})();

// ---------------------------
// Modal “Ver más / Elegir auto”
// ---------------------------

/**
 * Módulo del modal de vehículo (abre/cierra y pasa datos de la card).
 * @module ModalVehiculo
 */
(() => {
  const grid = document.querySelector(".catalog-grid");
  const modal = document.getElementById("vehicle-modal");
  const backdrop = document.getElementById("vehicle-backdrop");
  const closeBtn = document.getElementById("veh-close");
  const chooseBtn = document.getElementById("veh-choose");

  if (!grid || !modal || !backdrop || !closeBtn || !chooseBtn) return;

  const imgEl = document.getElementById("veh-img");
  const titleEl = document.getElementById("veh-title");
  const metaEl = document.getElementById("veh-meta");
  const priceEl = document.getElementById("veh-price");

  /** @type {string|null} */ let currentId = null;
  /** @type {CartItem|null} */ let currentVehicle = null;

  /**
   * Abre el modal de vehículo.
   * @function openModal
   */
  const openModal = () => {
    modal.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
  };

  /**
   * Cierra el modal de vehículo.
   * @function closeModal
   */
  const closeModal = () => {
    modal.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    setTimeout(() => {
      modal.hidden = true;
      backdrop.hidden = true;
    }, 200);
  };

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-more");
    if (!btn) return;
    const id = btn.dataset.id;
    const card = document.getElementById(id);
    if (!card) return;

    const title = card.querySelector(".product-title")?.textContent || id;
    const meta = card.querySelector(".product-meta")?.textContent || "";
    const price = Number(card.dataset.precio || 0);
    const img = card.querySelector("img")?.getAttribute("src") || "";

    currentId = id;
    currentVehicle = { id, title, price, qty: 1, type: "vehículo" };

    imgEl.src = img;
    imgEl.alt = title;
    titleEl.textContent = title;
    metaEl.textContent = meta;
    priceEl.textContent = `USD ${price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
    })}`;

    openModal();
  });

  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  chooseBtn.addEventListener("click", () => {
    if (!currentVehicle) return;
    // Este flujo reemplaza el carrito con SOLO el vehículo elegido
    setCart([currentVehicle]);
    setSelectedVehicle(currentVehicle);
    updateCartCount();
    // Redirige a personalización
    window.location.href = "personalizar.html";
  });
})();

// ---------------------------
// Personalizar: buscador de accesorios
// ---------------------------

/**
 * Módulo de búsqueda en accesorios (muestra/oculta cards con [hidden]).
 * @module BuscadorAccesorios
 */
(() => {
  const input = document.getElementById("buscar-acc");
  if (!input) return;

  // 2) Grid y cards (con varios fallbacks)
  const grid =
    document.getElementById("accesorios-grid") ||
    document.querySelector(".personalize-main") ||
    document.querySelector(".personalize-layout") ||
    document.querySelector("main");

  if (!grid) return;

  // Preferimos accesorios marcados; sino todas las .product-card dentro del grid
  let cards = [
    ...grid.querySelectorAll('.product-card[data-kind="accessory"]'),
  ];
  if (!cards.length) cards = [...grid.querySelectorAll(".product-card")];

  /**
   * Normaliza texto: quita tildes, trim y pasa a minúsculas.
   * @param {string} s
   * @returns {string}
   */
  const norm = (s) =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  /**
   * Extrae texto representativo de una card (dataset + título + meta).
   * @param {HTMLElement} card
   * @returns {string}
   */
  const textoCard = (card) => {
    const dn = card.dataset.name || card.getAttribute("aria-label") || "";
    const t =
      card.querySelector(".product-title,h3,h4")?.textContent ||
      card.getAttribute("data-title") ||
      "";
    const m = card.querySelector(".product-meta,.meta")?.textContent || "";
    return `${dn} ${t} ${m}`;
  };

  /**
   * Filtra cards según el texto ingresado en el buscador.
   * @function filtrar
   */
  const filtrar = () => {
    const q = norm(input.value);
    cards.forEach((card) => {
      const match = !q || norm(textoCard(card)).includes(q);
      if (match) card.removeAttribute("hidden");
      else card.setAttribute("hidden", "");
    });
  };

  // 4) Eventos
  input.addEventListener("input", filtrar);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      filtrar();
    }
  });

  // 5) Primera pasada
  filtrar();
})();

// ---------------------------
// Personalización: agregar accesorios al carrito
// ---------------------------

/**
 * Módulo que permite agregar/quitar accesorios dentro de “Personalizar”.
 * @module AccesoriosCarrito
 */
(() => {
  const gridAcc = document.getElementById("accesorios-grid");
  if (!gridAcc) return;

  // Mostrar vehículo elegido
  const sel = getSelectedVehicle();
  const vehLbl = document.getElementById("vehiculo-elegido");
  if (vehLbl && sel) {
    vehLbl.textContent = `Vehículo elegido: ${sel.title} — USD ${Number(
      sel.price
    ).toFixed(0)}`;
  }

  gridAcc.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-accessory");
    if (!btn) return;

    const card = btn.closest(".product-card");
    const id = card.dataset.id;
    const price = Number(card.dataset.precio || 0);
    const title = card.querySelector(".product-title")?.textContent || id;

    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === id);
    if (idx >= 0) {
      cart[idx].qty += 1;
    } else {
      cart.push({ id, title, price, qty: 1, type: "accesorio" });
    }

    setCart(cart);
    updateCartCount();
    renderCart();
    btn.textContent = "Agregado ✓";
    setTimeout(() => (btn.textContent = "Agregar"), 900);
  });

  // Botón finalizar (demo)
  const fin = document.getElementById("finalizar");
  fin &&
    fin.addEventListener("click", () => {
      const total = cartTotal(getCart()).toFixed(2);
      alert(
        `¡Gracias! Total estimado: USD ${total}\n(Flujo de checkout en construcción)`
      );
    });
})();

// ---------------------------
// Carrusel accesible (dots con aria-current, teclas ← →)
// ---------------------------

/**
 * Módulo de carrusel accesible: gestiona “dots” y navegación por teclado.
 * @module CarruselAccesible
 */
(() => {
  const track = document.querySelector(".slider__track");
  const slides = Array.from(track.querySelectorAll(".slider__slide"));
  const prev = document.getElementById("prevSlide");
  const next = document.getElementById("nextSlide");
  const dots = Array.from(document.querySelectorAll(".slider__dot"));

  /** Índice actual del carrusel accesible. */
  let index = slides.findIndex((s) => s.classList.contains("is-active"));

  /**
   * Cambia al slide indicado y sincroniza estados visuales/ARIA.
   * @param {number} i - Índice destino (se normaliza en módulo).
   */
  const go = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle("is-active", k === index);
      s.setAttribute("aria-hidden", k === index ? "false" : "true");
    });
    dots.forEach((d, k) => {
      const active = k === index;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-current", active ? "true" : "false");
    });
  };

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));
  dots.forEach((d, k) => d.addEventListener("click", () => go(k)));

  // Accesibilidad con teclado: ← → para navegar
  document.querySelector(".slider").addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      go(index - 1);
    }
    if (e.key === "ArrowRight") {
      go(index + 1);
    }
  });
})();
