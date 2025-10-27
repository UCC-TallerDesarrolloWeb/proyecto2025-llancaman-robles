import { useCart } from "./CartContext";

const CartDrawer = () => {
  const { open, setOpen, items, inc, dec, removeItem, clear, total } = useCart();

  return (
    <>
      <div
        className={`cart-backdrop${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`cart-drawer${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Carrito">
        {/* Header */}
        <header className="cart-header">
          <h2>Vehículos seleccionados</h2>
          <button className="cart-close" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
        </header>

        {/* Items */}
        <div className="cart-items">
          {items.length === 0 ? (
            <p className="muted">No has seleccionado ningún vehículo.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="cart-item">
                <div className="cart-item__info">
                  <strong>{it.title}</strong>
                  <div className="muted">USD {it.price.toLocaleString()}</div>
                </div>

                <div className="cart-item__qty">
                  <button onClick={() => dec(it.id)} aria-label="Disminuir">−</button>
                  <span>{it.qty}</span>
                  <button onClick={() => inc(it.id)} aria-label="Aumentar">+</button>
                </div>

                <button className="cart-item__remove" onClick={() => removeItem(it.id)}>
                  Quitar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <div className="cart-total-row">
            <span>Total</span>
            <strong>USD {total.toLocaleString()}</strong>
          </div>
          <div className="cart-actions">
            <button className="btn" onClick={clear} disabled={!items.length}>Limpiar selección</button>
            <button className="btn is-primary" disabled={!items.length}>Enviar solicitud</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
