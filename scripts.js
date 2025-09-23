// --- Carrusel simple (index) ---
let current = 0;
const slides = document.querySelectorAll('.slider__slide');
const dots = document.querySelectorAll('.slider__dot');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');
let timer;

function showSlide(idx) {
  if (!slides.length) return;
  current = (idx + slides.length) % slides.length;
  slides.forEach((s, i) => {
    s.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
    s.classList.toggle('is-active', i === current);
  });
  dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
}
function next() { showSlide(current + 1); }
function prev() { showSlide(current - 1); }
function startAuto() { stopAuto(); timer = setInterval(next, 5000); }
function stopAuto() { if (timer) clearInterval(timer); }

window.addEventListener('DOMContentLoaded', () => {
  showSlide(0);
  startAuto();
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { showSlide(i); startAuto(); }));
});

// --- Calculadora de financiación (index) ---
function calcularCuota() {
  const precio = parseFloat(document.getElementById('precio')?.value) || 0;
  const anticipo = parseFloat(document.getElementById('anticipo')?.value) || 0;
  const tasa = parseFloat(document.getElementById('tasa')?.value) || 0;
  const meses = parseInt(document.getElementById('meses')?.value) || 0;
  const monto = Math.max(precio - anticipo, 0);
  const i = tasa/100/12;
  let cuota = 0;
  if (i > 0 && meses > 0) {
    cuota = monto * (i * Math.pow(1+i, meses)) / (Math.pow(1+i, meses) - 1);
  } else if (meses > 0) {
    cuota = monto / meses;
  }
  const out = document.getElementById('resultado');
  if (out) {
    out.textContent = isFinite(cuota) ? `Cuota estimada: USD ${cuota.toFixed(2)} / mes`
                                      : `Revisá los valores ingresados`;
  }
}

// === Catálogo: filtros + búsqueda + add-to-cart ===
(function(){
  const grid = document.querySelector('.catalog-grid');
  if(!grid) return;

  const q = document.getElementById('q');
  const btnBuscar = document.getElementById('btn-buscar');
  const btnAplicar = document.getElementById('btn-aplicar');
  const btnLimpiar = document.getElementById('btn-limpiar');

  const anioMin = document.getElementById('anio-min');
  const anioMax = document.getElementById('anio-max');
  const precioMin = document.getElementById('precio-min');
  const precioMax = document.getElementById('precio-max');

  function getChecks(name){
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i=>i.value);
  }

  function pasaFiltros(card){
    const texto = (q?.value||'').toLowerCase();
    const tipos = getChecks('tipo');
    const marcas = getChecks('marca');
    const anio = Number(card.dataset.anio||0);
    const precio = Number(card.dataset.precio||0);
    const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
    const meta = card.querySelector('.product-meta')?.textContent.toLowerCase() || '';

    const buscaOk = !texto || title.includes(texto) || meta.includes(texto);
    const tipoOk = !tipos.length || tipos.includes(card.dataset.tipo);
    const marcaOk = !marcas.length || marcas.includes(card.dataset.marca);
    const anioOk = (!anioMin?.value || anio >= Number(anioMin.value)) &&
                   (!anioMax?.value || anio <= Number(anioMax.value));
    const precioOk = (!precioMin?.value || precio >= Number(precioMin.value)) &&
                     (!precioMax?.value || precio <= Number(precioMax.value));

    return buscaOk && tipoOk && marcaOk && anioOk && precioOk;
  }

  function aplicar(){
    const cards = [...grid.querySelectorAll('.product-card')];
    let visibles = 0;
    cards.forEach(c=>{
      const ok = pasaFiltros(c);
      c.style.display = ok ? '' : 'none';
      if(ok) visibles++;
    });
    grid.setAttribute('data-visibles', String(visibles));
  }

  function limpiar(){
    document.getElementById('form-filtros')?.reset();
    if (q) q.value='';
    aplicar();
  }

  ['change','keyup'].forEach(evt=> grid.closest('main').addEventListener(evt, e=>{
    if(e.target.matches('input,select')) aplicar();
  }));
  btnBuscar && btnBuscar.addEventListener('click', aplicar);
  btnAplicar && btnAplicar.addEventListener('click', aplicar);
  btnLimpiar && btnLimpiar.addEventListener('click', limpiar);

  aplicar();

  // === Add to cart ===
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('.add-cart');
    if(!btn) return;
    const id = btn.dataset.id;
    const card = document.getElementById(id);
    const title = card.querySelector('.product-title')?.textContent || id;
    const price = Number(card.dataset.precio || 0);
    const cart = getCart();
    // si ya existe, suma qty; si no, push
    const idx = cart.findIndex(x=>x.id===id);
    if(idx>=0){ cart[idx].qty += 1; } else { cart.push({id, title, price, qty:1}); }
    setCart(cart);
    updateCartCount();
    if (isCartOpen()) renderCart();
    btn.textContent = 'Agregado ✓';
    setTimeout(()=> btn.textContent = 'Agregar al carrito', 1000);
  });
})();

// === Carrito: estado y UI compartidos ===
const CART_KEY = 'aurum_cart';
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY)||'[]');
const setCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr));

function cartTotal(arr){
  return arr.reduce((acc, it)=> acc + (Number(it.price)||0) * (Number(it.qty)||0), 0);
}

function updateCartCount(){
  const el = document.getElementById('cart-count');
  if(!el) return;
  const cart = getCart();
  const units = cart.reduce((acc, it)=> acc + (Number(it.qty)||0), 0);
  el.textContent = String(units);
}

function renderCart(){
  const cont = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if(!cont || !totalEl) return;

  const cart = getCart();
  cont.innerHTML = '';

  if(cart.length === 0){
    cont.innerHTML = '<p class="meta">Tu carrito está vacío.</p>';
    totalEl.textContent = 'USD 0.00';
    return;
  }

  cart.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.dataset.id = item.id;
    row.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <div class="meta">Precio unidad: <span class="price">USD ${Number(item.price).toFixed(2)}</span></div>
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

function isCartOpen(){
  const drawer = document.getElementById('cart-drawer');
  return drawer && drawer.classList.contains('is-open');
}
function openCart(){
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if(!drawer || !backdrop) return;
  drawer.hidden = false; backdrop.hidden = false;
  requestAnimationFrame(()=>{
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
  });
  renderCart();
}
function closeCart(){
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if(!drawer || !backdrop) return;
  drawer.classList.remove('is-open');
  backdrop.classList.remove('is-open');
  // tras la animación, ocultamos para accesibilidad
  setTimeout(()=>{ drawer.hidden = true; backdrop.hidden = true; }, 200);
}

function attachCartEvents(){
  const openBtn = document.getElementById('open-cart');
  const closeBtn = document.getElementById('close-cart');
  const backdrop = document.getElementById('cart-backdrop');
  const items = document.getElementById('cart-items');
  const clearBtn = document.getElementById('cart-clear');

  openBtn && openBtn.addEventListener('click', openCart);
  closeBtn && closeBtn.addEventListener('click', closeCart);
  backdrop && backdrop.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && isCartOpen()) closeCart(); });

  items && items.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const act = btn.dataset.act;
    const row = btn.closest('.cart-item');
    const id = row?.dataset.id;
    if(!id) return;

    const cart = getCart();
    const idx = cart.findIndex(x=>x.id===id);
    if(idx<0) return;

    if(act==='inc'){ cart[idx].qty += 1; }
    if(act==='dec'){ cart[idx].qty = Math.max(1, cart[idx].qty - 1); }
    if(act==='rm'){ cart.splice(idx,1); }

    setCart(cart);
    updateCartCount();
    renderCart();
  });

  clearBtn && clearBtn.addEventListener('click', ()=>{
    setCart([]);
    updateCartCount();
    renderCart();
  });
}

// Inicializa contador y eventos del carrito en TODAS las páginas
window.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  attachCartEvents();
});
