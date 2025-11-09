// CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { addToCart } from "@api/cartApi.js";

const CartContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }
  return ctx;
};

const STORAGE_KEY = "aurum_cart";

export function CartProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (err) {
      console.error("Error leyendo carrito desde localStorage:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Error guardando carrito en localStorage:", err);
    }
  }, [items]);

  const count = useMemo(
    () => items.reduce((acc, it) => acc + (it.qty ?? 1), 0),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce((acc, it) => acc + Number(it.price ?? 0) * (it.qty ?? 1), 0),
    [items]
  );

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const updateQty = useCallback((id, delta) =>
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.max(1, (p.qty ?? 1) + delta) } : p
      )
    )
  , []);

  const addItem = useCallback(async (product) => {
    const qty = product.qty ?? 1;
    const normalized = {
      id: product.id,
      title: product.title ?? product.nombre ?? "",
      price: Number(product.price ?? product.unitPrice ?? 0),
      img: product.img ?? product.imagen ?? product.image ?? "",
      qty,
    };

    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === normalized.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: (next[i].qty ?? 1) + qty };
        return next;
      }
      return [...prev, normalized];
    });

    try {
      await addToCart({
        vehiculo: { id: normalized.id },
        nombre: normalized.title,
        precio: normalized.price,
        imagen: normalized.img,
      });
    } catch (e) {
      console.error("Error al agregar al carrito (API):", e);
    }
  }, []);

  const removeItem = useCallback((id) =>
    setItems((prev) => prev.filter((p) => p.id !== id))
  , []);

  const inc = useCallback((id) => updateQty(id, 1), [updateQty]);

  const dec = useCallback((id) => updateQty(id, -1), [updateQty]);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      items,
      addItem,
      removeItem,
      inc,
      dec,
      clear,
      count,
      total,
    }),
    [open, items, count, total, toggle, addItem, removeItem, inc, dec, clear, setOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
