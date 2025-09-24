// ==== Carrusel simple (index) ====
let current = 0;
const slides = document.querySelectorAll(".slider__slide");
const dots = document.querySelectorAll(".slider__dot");
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");
let timer;

function showSlide(idx) {
  if (!slides.length) return;
  current = (idx + slides.length) % slides.length;
  slides.forEach((s, i) => {
    s.setAttribute("aria-hidden", i !== current ? "true" : "false");
    s.classList.toggle("is-active", i === current);
  });
  dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
}
function next() {
  showSlide(current + 1);
}
function prev() {
  showSlide(current - 1);
}
function startAuto() {
  stopAuto();
  timer = setInterval(next, 5000);
}
function stopAuto() {
  if (timer) clearInterval(timer);
}

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



// ==== Calculadora de financiación (index) ====
function calcularCuota() {
  const precio = parseFloat(document.getElementById("precio")?.value) || 0;
  const anticipo = parseFloat(document.getElementById("anticipo")?.value) || 0;
  const tasa = parseFloat(document.getElementById("tasa")?.value) || 0;
  const meses = parseInt(document.getElementById("meses")?.value) || 0;
  const monto = Math.max(precio - anticipo, 0);
  const i = tasa / 100 / 12;
  let cuota = 0;
  if (i > 0 && meses > 0) {
    cuota =
      (monto * (i * Math.pow(1 + i, meses))) / (Math.pow(1 + i, meses) - 1);
  } else if (meses > 0) {
    cuota = monto / meses;
  }
  const out = document.getElementById("resultado");
  if (out) {
    out.textContent = isFinite(cuota)
      ? `Cuota estimada: USD ${cuota.toFixed(2)} / mes`
      : `Revisá los valores ingresados`;
  }
}

// === Catálogo: filtros + búsqueda + add-to-cart ===
(function () {
  const grid = document.querySelector(".catalog-grid");
  if (!grid) return;

  const q = document.getElementById("q");
  const btnBuscar = document.getElementById("btn-buscar");
  const btnAplicar = document.getElementById("btn-aplicar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  const anioMin = document.getElementById("anio-min");
  const anioMax = document.getElementById("anio-max");
  const precioMin = document.getElementById("precio-min");
  const precioMax = document.getElementById("precio-max");

  function getChecks(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(
      (i) => i.value
    );
  }

  function pasaFiltros(card) {
    const texto = (q?.value || "").toLowerCase();
    const tipos = getChecks("tipo");
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
  }

  function aplicar() {
    const cards = [...grid.querySelectorAll(".product-card")];
    let visibles = 0;
    cards.forEach((c) => {
      const ok = pasaFiltros(c);
      c.style.display = ok ? "" : "none";
      if (ok) visibles++;
    });
    grid.setAttribute("data-visibles", String(visibles));
  }

  function limpiar() {
    document.getElementById("form-filtros")?.reset();
    if (q) q.value = "";
    aplicar();
  }

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

// === Estado de carrito compartido ===
const CART_KEY = "aurum_cart";
const SELECTED_KEY = "aurum_selected_vehicle";
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const setCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr));
const setSelectedVehicle = (obj) =>
  localStorage.setItem(SELECTED_KEY, JSON.stringify(obj));
const getSelectedVehicle = () =>
  JSON.parse(localStorage.getItem(SELECTED_KEY) || "null");

function cartTotal(arr) {
  return arr.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
}
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = getCart();
  const units = cart.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
  el.textContent = String(units);
}

// Render genérico a cualquier contenedor de items/total
function renderCartInto(itemsId, totalId) {
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
}

function renderCart() {
  // Drawer
  renderCartInto("cart-items", "cart-total");
  // Panel fijo (personalización)
  renderCartInto("cart-panel-items", "cart-panel-total");
}

function isCartOpen() {
  const drawer = document.getElementById("cart-drawer");
  return drawer && drawer.classList.contains("is-open");
}
function openCart() {
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
}
function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open");
  backdrop.classList.remove("is-open");
  setTimeout(() => {
    drawer.hidden = true;
    backdrop.hidden = true;
  }, 200);
}

function attachCartEvents() {
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

  function onClickItems(e) {
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
  }

  items && items.addEventListener("click", onClickItems);
  itemsPanel && itemsPanel.addEventListener("click", onClickItems);

  clearBtn &&
    clearBtn.addEventListener("click", () => {
      setCart([]);
      updateCartCount();
      renderCart();
    });
}

// Inicialización común
window.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  attachCartEvents();
  renderCart();
});

// === Filtros + búsqueda en catálogo (tu base) ===
(function () {
  const grid = document.querySelector(".catalog-grid");
  if (!grid) return;

  const q = document.getElementById("q");
  const btnBuscar = document.getElementById("btn-buscar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  const anioMin = document.getElementById("anio-min");
  const anioMax = document.getElementById("anio-max");
  const precioMin = document.getElementById("precio-min");
  const precioMax = document.getElementById("precio-max");

  function getChecks(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(
      (i) => i.value
    );
  }

  function pasaFiltros(card) {
    const texto = (q?.value || "").toLowerCase();
    const tipos = getChecks("tipo");
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
  }

  function aplicar() {
    const cards = [...grid.querySelectorAll(".product-card")];
    let visibles = 0;
    cards.forEach((c) => {
      const ok = pasaFiltros(c);
      c.style.display = ok ? "" : "none";
      if (ok) visibles++;
    });
    grid.setAttribute("data-visibles", String(visibles));
  }

  function limpiar() {
    document.getElementById("form-filtros")?.reset();
    if (q) q.value = "";
    aplicar();
  }

  ["change", "keyup"].forEach((evt) =>
    grid.closest("main").addEventListener(evt, (e) => {
      if (e.target.matches("input,select")) aplicar();
    })
  );
  btnBuscar && btnBuscar.addEventListener("click", aplicar);
  btnLimpiar && btnLimpiar.addEventListener("click", limpiar);

  aplicar();
})();

// === Modal "Ver más / Elegir auto" en catálogo ===
(function () {
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

  let currentId = null;
  let currentVehicle = null;

  function openModal() {
    modal.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
  }
  function closeModal() {
    modal.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    setTimeout(() => {
      modal.hidden = true;
      backdrop.hidden = true;
    }, 200);
  }

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

// === Personalización: agregar accesorios al carrito ===
(function () {
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

(function () {
    const track = document.querySelector('.slider__track');
    const slides = Array.from(track.querySelectorAll('.slider__slide'));
    const prev = document.getElementById('prevSlide');
    const next = document.getElementById('nextSlide');
    const dots = Array.from(document.querySelectorAll('.slider__dot'));

    let index = slides.findIndex(s => s.classList.contains('is-active'));
    const go = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === index);
        s.setAttribute('aria-hidden', k === index ? 'false' : 'true');
      });
      dots.forEach((d, k) => d.classList.toggle('is-active', k === index));
    };

    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));

    // Accesibilidad con teclado: ← → para navegar
    document.querySelector('.slider').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(index - 1); }
      if (e.key === 'ArrowRight') { go(index + 1); }
    });
  })();