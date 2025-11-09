// CartDrawer.jsx
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "@components/CartContext";

const CUSTOM_STORAGE = "aurum_customizations";

function leerCustoms() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const CartDrawer = () => {
  const { open, setOpen, items, inc, dec, removeItem, clear, total } =
    useCart();
  const customs = leerCustoms();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const closeDrawer = () => setOpen(false);

  const extrasSum = items.reduce((acc, it) => {
    const cfg = customs[it.id];
    const e = Number(cfg?._extras || 0);
    return acc + e * (it.qty || 1);
  }, 0);

  const grandTotal = total + extrasSum;

  // cerrar con escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <div
        className={`cart-backdrop${open ? " is-open" : ""}`}
        onClick={closeDrawer}
      />
      <aside
        className={`cart-drawer${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
      >
        <header className="cart-header">
          <h2>Vehículos seleccionados</h2>
          <button
            className="cart-close"
            onClick={closeDrawer}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        {!isLoggedIn ? (
          <div className="cart-empty">
            <p className="muted">
              Iniciá sesión para agregar/ver vehículos seleccionados.
            </p>
            <NavLink
              to="/login"
              className="btn is-primary"
              onClick={closeDrawer}
            >
              Iniciar sesión
            </NavLink>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.length === 0 ? (
                <p className="muted">No has seleccionado ningún vehículo.</p>
              ) : (
                items.map((it) => {
                  const cfg = customs[it.id];
                  return (
                    <div key={it.id} className="cart-item">
                      <div className="cart-item__info">
                        <strong>{it.title}</strong>
                        <div className="muted">
                          USD {it.price.toLocaleString()}
                        </div>

                        {cfg && (
                          <div className="muted">
                            <div>Color: {cfg.color}</div>
                            <div>Paquete: {cfg.paquete}</div>
                            <div>Llantas: {cfg.llantas}</div>
                            <div>Garantía: {cfg.garantia}</div>
                            {cfg.accesorios?.length ? (
                              <div>
                                Accesorios:
                                <ul>
                                  {cfg.accesorios.map((a) => (
                                    <li key={a}>{a}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div>Accesorios: —</div>
                            )}
                            {typeof cfg._extras === "number" && (
                              <div>
                                <strong>
                                  Extras: USD {cfg._extras.toLocaleString()}
                                </strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="cart-item__qty">
                        <button
                          onClick={() => dec(it.id)}
                          aria-label="Disminuir"
                        >
                          −
                        </button>
                        <span>{it.qty}</span>
                        <button
                          onClick={() => inc(it.id)}
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-item__remove"
                        onClick={() => removeItem(it.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-summary">
                <div className="cart-total-row">
                  <span>Total vehículos</span>
                  <strong>USD {total.toLocaleString()}</strong>
                </div>
                <div className="cart-total-row">
                  <span>Extras seleccionados</span>
                  <strong>USD {extrasSum.toLocaleString()}</strong>
                </div>
                <div className="cart-total-row">
                  <strong>TOTAL A PAGAR</strong>
                  <strong>USD {grandTotal.toLocaleString()}</strong>
                </div>
                <div className="cart-actions">
                  <button
                    className="btn"
                    onClick={clear}
                    disabled={!items.length}
                  >
                    Limpiar selección
                  </button>
                  <button
                    className="btn is-primary"
                    disabled={!items.length}
                    onClick={() => {
                      setOpen(false);
                      window.setTimeout(
                        () => alert("Solicitud enviada. ¡Gracias!"),
                        0
                      );
                    }}
                  >
                    Enviar solicitud
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
