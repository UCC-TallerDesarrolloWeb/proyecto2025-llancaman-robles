import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "aurum_cart";

export function CartProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (err) {
      console.error("Error leyendo carrito desde localStorage:", err);
    }
  }, []);

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Error guardando carrito en localStorage:", err);
    }
  }, [items]);

  const count = useMemo(() => items.reduce((acc, it) => acc + it.qty, 0), [items]);
  const total = useMemo(() => items.reduce((acc, it) => acc + it.price * it.qty, 0), [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const clone = [...prev];
        const qty = product.qty ?? 1;
        clone[i] = { ...clone[i], qty: clone[i].qty + qty };
        return clone;
      }
      return [...prev, { ...product, qty: product.qty ?? 1 }];
    });
    setOpen(true);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const inc = (id) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
  const dec = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p)));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((v) => !v),
      items,
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
