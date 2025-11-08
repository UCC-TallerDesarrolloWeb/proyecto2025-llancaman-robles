// src/api/cartApi.js
import dataLocal from "@data/db.json";

const BASE_URL = "http://localhost:4000";
const USE_API = import.meta.env.VITE_USE_API === "true";

export async function getCart() {
  if (!USE_API) {
    return dataLocal.cart || [];
  }
  try {
    const res = await fetch(`${BASE_URL}/cart`);
    if (!res.ok) throw new Error("Error al obtener el carrito");
    return await res.json();
  } catch (e) {
    console.warn("API no disponible, usando datos locales:", e?.message);
    return dataLocal.cart || [];
  }
}

export async function addToCart(item) {
  if (!USE_API) {
    return item;
  }
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Error al agregar al carrito");
    return await res.json();
  } catch (e) {
    console.warn("Error agregando al carrito:", e?.message);
    return item;
  }
}

export async function clearCart() {
  if (!USE_API) {
    console.log("Modo local: limpiando carrito");
    return true;
  }
  try {
    const cart = await getCart();
    await Promise.all(
      cart.map((item) =>
        fetch(`${BASE_URL}/cart/${item.id}`, { method: "DELETE" })
      )
    );
    return true;
  } catch (e) {
    console.error("Error al limpiar el carrito:", e);
    return false;
  }
}
