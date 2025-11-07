// cartApi.js
const BASE_URL = "http://localhost:4000/cart";

async function request(path = "", options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : await safeJson(res);
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function getCart() {
  return await request("", { method: "GET" });
}

export async function addToCart(vehiculos) {
  const newItem = {
    vehiculoId: vehiculos?.vehiculo?.id ?? null,
    nombre: vehiculos?.nombre ?? "",
    unitPrice: Number(vehiculos?.precio ?? 0),
    qty: 1,
    imagen: vehiculos?.imagen ?? "",
  };

  return await request("", {
    method: "POST",
    body: JSON.stringify(newItem),
  });
}

export async function updateCartItem(id, patch) {
  return await request(`/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch || {}),
  });
}

export async function deleteCartItem(id) {
  await request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  return true;
}

export async function findCartItemByVehiculoId(vehiculoId) {
  const list = await request(`?vehiculoId=${encodeURIComponent(vehiculoId)}`, {
    method: "GET",
  });
  return Array.isArray(list) && list.length ? list[0] : null;
}

export async function clearCart() {
  const current = await getCart();
  if (!Array.isArray(current) || current.length === 0) return;
  await Promise.all(current.map((it) => deleteCartItem(it.id)));
}
