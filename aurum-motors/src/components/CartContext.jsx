// CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addToCart } from "../api/cartApi.js";

const CartContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "aurum_cart";

export function CartProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
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

  const count = useMemo(() => items.reduce((acc, it) => acc + it.qty, 0), [items]);
  const total = useMemo(() => items.reduce((acc, it) => acc + it.price * it.qty, 0), [items]);

  // agregar item
  const addItem = async (product) => {
    const qty = product.qty ?? 1;

    try {
      await addToCart({
        vehiculo: { id: product.id },
        nombre: product.title ?? product.nombre ?? "",
        precio: product.price ?? product.unitPrice ?? 0,
        imagen: product.imagen ?? product.image ?? "",
      });
    } catch (e) {
      console.error("Error al agregar al carrito (API):", e);
      return;
    }

    // Estado local
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const inc = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));

  const dec = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p)));

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      open,
      items,
      setOpen,
      toggle: () => setOpen((v) => !v),
      addItem,
      removeItem,
      inc,
      dec,
      clear,
      count,
      total,
    }),
    [open, items, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
