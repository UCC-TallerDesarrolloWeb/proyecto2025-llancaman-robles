
// ===============================
// AURUM MOTORS - scripts.js
// ===============================

// 1) Marcar vista según página
(function () {
  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var view = "inicio";

  if (file.indexOf("catalogo") > -1) {
    view = "catalogo";
    var q = (location.search || "").toLowerCase();
    if (q.indexOf("tipo=auto") > -1) view = "auto";
    if (q.indexOf("tipo=camioneta") > -1) view = "camioneta";
  }

  if (file.indexOf("personalizar") > -1) {
    view = "personalizar";
  }

  document.documentElement.setAttribute("data-view", view);
})();

// 2) Menú mobile simple
(function () {
  const header = document.querySelector(".site-header");
  const btn = document.getElementById("nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!header || !btn || !nav) return;

  const close = () => { header.classList.remove("nav-open"); btn.setAttribute("aria-expanded", "false"); };
  const open  = () => { header.classList.add("nav-open");  btn.setAttribute("aria-expanded", "true"); };

  btn.addEventListener("click", () => header.classList.contains("nav-open") ? close() : open());
  nav.addEventListener("click", (e) => { if (e.target.matches("a")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

// 3) Helpers de alert/foco
const alertar = (msg) => alert(msg);
const limpiarYFocus = (el) => { if (!el) return; el.value = ""; el.focus(); };

// 4) Slider (un solo carrusel para todo)
(function () {
  const root  = document.querySelector(".slider");
  const track = document.querySelector(".slider__track");
  const slides = track ? Array.from(track.querySelectorAll(".slider__slide")) : [];
  const dots   = Array.from(document.querySelectorAll(".slider__dot"));
  const prev   = document.getElementById("prevSlide");
  const next   = document.getElementById("nextSlide");
  if (!track || !slides.length) return;

  let i = Math.max(0, slides.findIndex(s => s.classList.contains("is-active")));
  let timer;

  const show = (k) => {
    i = (k + slides.length) % slides.length;
    slides.forEach((s, n) => {
      s.classList.toggle("is-active", n === i);
      s.setAttribute("aria-hidden", n === i ? "false" : "true");
    });
    dots.forEach((d, n) => {
      const on = n === i;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-current", on ? "true" : "false");
    });
  };

  const start = () => { stop(); timer = setInterval(() => show(i + 1), 5000); };
  const stop  = () => { if (timer) clearInterval(timer); };

  prev && prev.addEventListener("click", () => { show(i - 1); start(); });
  next && next.addEventListener("click", () => { show(i + 1); start(); });
  dots.forEach((d, k) => d.addEventListener("click", () => { show(k); start(); }));
  root && root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { show(i - 1); start(); }
    if (e.key === "ArrowRight") { show(i + 1); start(); }
  });

  show(i || 0);
  start();
})();

// 5) Calculadora (estilo clase, simple)
const validarCalculadora = () => {
  const precioEl = document.getElementById("precio");
  const anticipoEl = document.getElementById("anticipo");
  const tasaEl = document.getElementById("tasa");
  const mesesEl = document.getElementById("meses");

  const precio = Number(precioEl?.value);
  if (!precio || precio <= 0) { alertar("Ingresá un precio mayor a 0."); limpiarYFocus(precioEl); return false; }

  const anticipo = Number(anticipoEl?.value || 0);
  if (anticipo < 0) { alertar("El anticipo no puede ser negativo."); limpiarYFocus(anticipoEl); return false; }
  if (anticipo > precio) { alertar("El anticipo no puede superar el precio."); limpiarYFocus(anticipoEl); return false; }

  const tasa = Number(tasaEl?.value || 0);
  if (tasa < 0 || tasa > 200) { alertar("Ingresá una tasa entre 0% y 200%."); limpiarYFocus(tasaEl); return false; }

  const meses = Number(mesesEl?.value);
  if (![12, 24, 36, 48].includes(meses)) { alertar("Seleccioná la cantidad de meses."); mesesEl?.focus(); return false; }

  return { precio, anticipo, tasa, meses };
}

// Expongo función global como en clase
const calcularCuota = () => {
  const vals = validarCalculadora();
  const out = document.getElementById("resultado");
  if (!vals) { if (out) out.textContent = ""; return; }

  const { precio, anticipo, tasa, meses } = vals;
  const monto = Math.max(precio - anticipo, 0);
  const i = tasa / 100 / 12;
  let cuota = i > 0
    ? (monto * (i * Math.pow(1 + i, meses))) / (Math.pow(1 + i, meses) - 1)
    : monto / meses;
  if (out) out.textContent = `Cuota estimada: USD ${cuota.toFixed(2)} / mes`;
}

// Botón de calcular (si existe)
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calc-btn")?.addEventListener("click", calcularCuota);
});

// 6) Carrito (estado + UI)
const CART_KEY = "aurum_cart";
const SELECTED_KEY = "aurum_selected_vehicle";

const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const setCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr));
const cartTotal = (arr) => arr.reduce((acc, it) => acc + (Number(it.price)||0) * (Number(it.qty)||0), 0);
const updateCartCount = () => {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const units = getCart().reduce((acc, it) => acc + (Number(it.qty)||0), 0);
  el.textContent = String(units);
};
const setSelectedVehicle = (obj) => localStorage.setItem(SELECTED_KEY, JSON.stringify(obj));
const getSelectedVehicle = () => JSON.parse(localStorage.getItem(SELECTED_KEY) || "null");

const renderCartInto = (itemsId, totalId) => {
  const cont = document.getElementById(itemsId);
  const totalEl = document.getElementById(totalId);
  if (!cont || !totalEl) return;

  const cart = getCart();
  cont.innerHTML = "";
  if (!cart.length) { cont.innerHTML = '<p class="meta">Tu carrito está vacío.</p>'; totalEl.textContent = "USD 0.00"; return; }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item"; row.dataset.id = item.id;
    const tipo = item.type ? `<span class="meta">(${item.type})</span>` : "";
    row.innerHTML = `
      <div>
        <h4>${item.title} ${tipo}</h4>
        <div class="meta">Precio unidad: <span class="price">USD ${Number(item.price).toFixed(2)}</span></div>
      </div>
      <div class="qty-row">
        <button class="qty-btn" data-act="dec">−</button>
        <span class="meta" aria-live="polite">${item.qty}</span>
        <button class="qty-btn" data-act="inc">+</button>
        <button class="remove-btn" data-act="rm">Quitar</button>
      </div>`;
    cont.appendChild(row);
  });
  totalEl.textContent = `USD ${cartTotal(cart).toFixed(2)}`;
}

const renderCart = () => {
  renderCartInto("cart-items", "cart-total");
  renderCartInto("cart-panel-items", "cart-panel-total");
}

const isCartOpen = () => {
  const d = document.getElementById("cart-drawer");
  return !!(d && d.classList.contains("is-open"));
}

// Expongo funciones globales abrir/cerrar (estilo clase)
const abrirCarrito = () => {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  if (!drawer || !backdrop) return;
  drawer.hidden = false; backdrop.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add("is-open"); backdrop.classList.add("is-open"); });
  renderCart();
}
const cerrarCarrito = () => {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open"); backdrop.classList.remove("is-open");
  setTimeout(() => { drawer.hidden = true; backdrop.hidden = true; }, 200);
}

const attachCartEvents = () => {
  const openBtn = document.getElementById("open-cart");
  const closeBtn = document.getElementById("close-cart");
  const backdrop = document.getElementById("cart-backdrop");
  const items = document.getElementById("cart-items");
  const itemsPanel = document.getElementById("cart-panel-items");
  const clearBtn = document.getElementById("cart-clear") || document.getElementById("cart-clear-2");

  openBtn && openBtn.addEventListener("click", abrirCarrito);
  closeBtn && closeBtn.addEventListener("click", cerrarCarrito);
  backdrop && backdrop.addEventListener("click", cerrarCarrito);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isCartOpen()) cerrarCarrito(); });

  const onClickItems = (e) => {
    const btn = e.target.closest("button"); if (!btn) return;
    const act = btn.dataset.act;
    const row = btn.closest(".cart-item"); const id = row?.dataset.id; if (!id) return;

    const cart = getCart(); const idx = cart.findIndex(x => x.id === id); if (idx < 0) return;
    if (act === "inc") cart[idx].qty += 1;
    if (act === "dec") cart[idx].qty = Math.max(1, cart[idx].qty - 1);
    if (act === "rm") cart.splice(idx, 1);

    setCart(cart); updateCartCount(); renderCart();
  };
  items && items.addEventListener("click", onClickItems);
  itemsPanel && itemsPanel.addEventListener("click", onClickItems);

  clearBtn && clearBtn.addEventListener("click", () => { setCart([]); updateCartCount(); renderCart(); });
}

document.addEventListener("DOMContentLoaded", () => { updateCartCount(); attachCartEvents(); renderCart(); });

// 7) Catálogo (prefiltro + filtros + búsqueda + add-to-cart)
(function () {
  const grid = document.querySelector(".catalog-grid");
  if (!grid) return;

  // Prefiltro por ?tipo=auto|camioneta o #autos|#camionetas
  const params = new URLSearchParams(location.search);
  let forcedTipo = params.get("tipo");
  if (!forcedTipo) {
    const h = (location.hash || "").replace("#", "").toLowerCase();
    if (h === "autos") forcedTipo = "auto";
    if (h === "camionetas") forcedTipo = "camioneta";
  }
  const tipoFieldset = document.getElementById("filtro-tipo");
  if (forcedTipo && tipoFieldset) tipoFieldset.hidden = true;

  // Controles
  const q = document.getElementById("q");
  const btnBuscar = document.getElementById("btn-buscar");
  const btnLimpiar = document.getElementById("btn-limpiar");
  const anioMin = document.getElementById("anio-min");
  const anioMax = document.getElementById("anio-max");
  const precioMin = document.getElementById("precio-min");
  const precioMax = document.getElementById("precio-max");

  // Validación simple: max >= min
  [anioMin, anioMax, precioMin, precioMax].forEach((input) => {
    input && input.addEventListener("change", () => {
      if (anioMin?.value && anioMax?.value && Number(anioMax.value) < Number(anioMin.value)) {
        alert("El año máximo no puede ser menor que el mínimo."); anioMax.value = anioMin.value;
      }
      if (precioMin?.value && precioMax?.value && Number(precioMax.value) < Number(precioMin.value)) {
        alert("El precio máximo no puede ser menor que el mínimo."); precioMax.value = precioMin.value;
      }
    });
  });

  const getChecks = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);

  const pasa = (card) => {
    const texto = (q?.value || "").toLowerCase();
    const tipos = forcedTipo ? [forcedTipo] : getChecks("tipo");
    const marcas = getChecks("marca");
    const anio = Number(card.dataset.anio || 0);
    const precio = Number(card.dataset.precio || 0);
    const title = card.querySelector(".product-title")?.textContent.toLowerCase() || "";
    const meta  = card.querySelector(".product-meta")?.textContent.toLowerCase() || "";
    const buscaOk  = !texto || title.includes(texto) || meta.includes(texto);
    const tipoOk   = !tipos.length || tipos.includes(card.dataset.tipo);
    const marcaOk  = !marcas.length || marcas.includes(card.dataset.marca);
    const anioOk   = (!anioMin?.value || anio >= Number(anioMin.value)) && (!anioMax?.value || anio <= Number(anioMax.value));
    const precioOk = (!precioMin?.value || precio >= Number(precioMin.value)) && (!precioMax?.value || precio <= Number(precioMax.value));
    return buscaOk && tipoOk && marcaOk && anioOk && precioOk;
  };

  function aplicar() {
    const cards = Array.from(grid.querySelectorAll(".product-card"));
    let visibles = 0;
    cards.forEach((c) => {
      const ok = pasa(c);
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

  ["change", "keyup"].forEach((evt) => grid.closest("main").addEventListener(evt, (e) => {
    if (e.target.matches("input,select")) aplicar();
  }));
  btnBuscar && btnBuscar.addEventListener("click", aplicar);
  btnLimpiar && btnLimpiar.addEventListener("click", limpiar);

  // Agregar al carrito (delegado)
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-cart");
    if (!btn) return;
    const id = btn.dataset.id;
    const card = document.getElementById(id);
    const title = card.querySelector(".product-title")?.textContent || id;
    const price = Number(card.dataset.precio || 0);

    const cart = getCart();
    const idx = cart.findIndex(x => x.id === id);
    if (idx >= 0) cart[idx].qty += 1;
    else cart.push({ id, title, price, qty: 1 });

    setCart(cart); updateCartCount(); if (isCartOpen()) renderCart();
    btn.textContent = "Agregado ✓"; setTimeout(() => btn.textContent = "Agregar al carrito", 900);
  });

  aplicar();
})();

// 8) Modal de vehículo (Ver más / Elegir)
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

  let current = null;

  const abrir = () => { modal.hidden = false; backdrop.hidden = false; requestAnimationFrame(() => { modal.classList.add("is-open"); backdrop.classList.add("is-open"); }); };
  const cerrar = () => { modal.classList.remove("is-open"); backdrop.classList.remove("is-open"); setTimeout(() => { modal.hidden = true; backdrop.hidden = true; }, 200); };

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-more"); if (!btn) return;
    const id = btn.dataset.id;
    const card = document.getElementById(id); if (!card) return;

    const title = card.querySelector(".product-title")?.textContent || id;
    const meta = card.querySelector(".product-meta")?.textContent || "";
    const price = Number(card.dataset.precio || 0);
    const img = card.querySelector("img")?.getAttribute("src") || "";

    current = { id, title, price, qty: 1, type: "vehículo" };
    if (imgEl) { imgEl.src = img; imgEl.alt = title; }
    if (titleEl) titleEl.textContent = title;
    if (metaEl) metaEl.textContent = meta;
    if (priceEl) priceEl.textContent = `USD ${price.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

    abrir();
  });

  closeBtn.addEventListener("click", cerrar);
  backdrop.addEventListener("click", cerrar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) cerrar(); });

  chooseBtn.addEventListener("click", () => {
    if (!current) return;
    setCart([current]);
    setSelectedVehicle(current);
    updateCartCount();
    window.location.href = "personalizar.html";
  });
})();

// 9) Buscador de accesorios (personalizar)
(function () {
  const input = document.getElementById("buscar-acc");
  if (!input) return;
  const grid = document.getElementById("accesorios-grid") || document.querySelector(".personalize-main") || document.querySelector("main");
  if (!grid) return;

  let cards = Array.from(grid.querySelectorAll('.product-card[data-kind="accessory"]'));
  if (!cards.length) cards = Array.from(grid.querySelectorAll(".product-card"));

  const norm = (s) => (s||"").toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  const textoCard = (card) => {
    const dn = card.dataset.name || card.getAttribute("aria-label") || "";
    const t = card.querySelector(".product-title,h3,h4")?.textContent || card.getAttribute("data-title") || "";
    const m = card.querySelector(".product-meta,.meta")?.textContent || "";
    return `${dn} ${t} ${m}`;
  };

  const filtrar = () => {
    const q = norm(input.value);
    cards.forEach((card) => {
      const ok = !q || norm(textoCard(card)).includes(q);
      ok ? card.removeAttribute("hidden") : card.setAttribute("hidden", "");
    });
  };

  input.addEventListener("input", filtrar);
  input.addEventListener("keydown", (e) => { if (e.key === "Escape") { input.value = ""; filtrar(); } });
  filtrar();
})();

// 10) Personalizar: agregar accesorios + finalizar
(function () {
  const gridAcc = document.getElementById("accesorios-grid");
  if (!gridAcc) return;

  // Mostrar vehículo elegido
  const sel = getSelectedVehicle();
  const vehLbl = document.getElementById("vehiculo-elegido");
  if (vehLbl && sel) vehLbl.textContent = `Vehículo elegido: ${sel.title} — USD ${Number(sel.price).toFixed(0)}`;

  gridAcc.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-accessory"); if (!btn) return;
    const card = btn.closest(".product-card"); const id = card?.dataset.id;
    const price = Number(card?.dataset.precio || 0);
    const title = card?.querySelector(".product-title")?.textContent || id;

    const cart = getCart();
    const idx = cart.findIndex(x => x.id === id);
    if (idx >= 0) cart[idx].qty += 1;
    else cart.push({ id, title, price, qty: 1, type: "accesorio" });

    setCart(cart); updateCartCount(); renderCart();
    btn.textContent = "Agregado ✓"; setTimeout(() => btn.textContent = "Agregar", 800);
  });

  document.getElementById("finalizar")?.addEventListener("click", () => {
    const total = cartTotal(getCart()).toFixed(2);
    alert(`¡Gracias! Total estimado: USD ${total}\n(Checkout en construcción)`);
  });
})();
