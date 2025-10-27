const BASE_URL = "http://localhost:4000/cart";

export async function getCart() {
  const res = await fetch(BASE_URL, { method: "GET" });
  if (!res.ok) throw new Error("Error al obtener el carrito.");
  return await res.json();
}

export async function addToCart(vehiculos) {
  const newItem = {
    vehiculoId: vehiculos.vehiculo.id,
    nombre: vehiculos.nombre,
    unitPrice: vehiculos.precio,
    qty: 1,
    imagen: vehiculos.imagen,
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newItem),
  });

  if (!res.ok) throw new Error("Error al agregar al carrito.");
  return await res.json();
}

export async function updateCartItem(id, patch) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Error al actualizar item del carrito.");
  return await res.json();
}

export async function deleteCartItem(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar item del carrito.");
}

export async function findCartItemByVehiculoId(vehiculoId) {
  const res = await fetch(
    `${BASE_URL}?vehiculoId=${encodeURIComponent(vehiculoId)}`
  );
  if (!res.ok) throw new Error("Error al buscar item por vehiculoId.");
  const list = await res.json();
  return Array.isArray(list) && list.length ? list[0] : null;
}

export async function clearCart() {
  const current = await getCart();
  await Promise.all((current || []).map((it) => deleteCartItem(it.id)));
}
