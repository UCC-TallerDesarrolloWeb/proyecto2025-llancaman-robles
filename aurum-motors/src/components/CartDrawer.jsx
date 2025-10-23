import { useCart } from "./CartContext";

const CartDrawer = () => {
  const { open, setOpen, items, inc, dec, removeItem, clear, total } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`cart-drawer${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-describedby="cart-summary"
      >
        <header className="cart-header">
          <h2 id="cart-title">Tu carrito</h2>
          <button
            className="cart-close"
            type="button"
            aria-label="Cerrar carrito"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </header>

        <div className="cart-items" aria-live="polite">
          {items.length === 0 ? (
            <p className="muted" style={{ padding: "12px 16px" }}>
              Todavía no agregaste productos.
            </p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="cart-item">
                <div className="cart-item__info">
                  <strong>{it.title}</strong>
                  <small className="muted">USD {it.price.toLocaleString()}</small>
                </div>
                <div className="cart-item__qty">
                  <button onClick={() => dec(it.id)} aria-label="Quitar uno">−</button>
                  <span aria-live="polite">{it.qty}</span>
                  <button onClick={() => inc(it.id)} aria-label="Agregar uno">+</button>
                </div>
                <button
                  className="cart-item__remove"
                  onClick={() => removeItem(it.id)}
                  aria-label="Eliminar del carrito"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>

        <div id="cart-summary" className="cart-summary">
          <div className="cart-total-row">
            <span>Total</span>
            <strong>USD {total.toLocaleString()}</strong>
          </div>
          <div className="cart-actions">
            <button className="btn" type="button" onClick={clear} disabled={!items.length}>
              Vaciar
            </button>
            <button className="btn" type="button" disabled={!items.length}>
              Finalizar compra
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
