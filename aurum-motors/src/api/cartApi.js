// src/api/cartApi.js
const BASE_URL = "http://localhost:4000";
const USE_API = import.meta.env.VITE_USE_API === "true";

export async function addToCart(item) {
  if (!USE_API) return item;

  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Error al agregar al carrito");
    return await res.json();
  } catch (e) {
    console.warn("Error agregando al carrito, fallback local:", e?.message);
    return item;
  }
}
