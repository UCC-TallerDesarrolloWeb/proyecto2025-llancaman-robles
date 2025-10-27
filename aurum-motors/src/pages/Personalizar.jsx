import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../components/CartContext";
import { NavLink } from "react-router-dom";

const CUSTOM_STORAGE = "aurum_customizations";
const SELECTED_ID = "aurum_selected_vehicle_id";

const PRECIOS = {
  color: { Negro: 0, Blanco: 0, Gris: 0, Azul: 350, Rojo: 350, "Negro mate": 900 },
  paquete: { Base: 0, Comfortline: 1200, Highline: 2800, Premium: 5200 },
  llantas: { "18”": 0, "19”": 700, "20”": 1200 },
  garantia: { "Fábrica (2 años)": 0, "+1 año": 600, "+2 años": 1000 },
  accesorios: {
    "Tech Pack (HUD + cámara 360)": 1800,
    "Techo panorámico": 1400,
    "Audio Hi-Fi": 950,
    "Ganchos remolque": 380,
    "Cobertor caja (pick-up)": 420,
  },
};

export default function Personalizar() {
  const { items, total } = useCart();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // ====== estado de customizaciones por vehículo { [id]: { ... } } ======
  const [customs, setCustoms] = useState({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE);
      if (raw) setCustoms(JSON.parse(raw));
    } catch (e) {
      console.error("Error leyendo personalizaciones:", e);
    }
  }, []);

  // ====== id seleccionado ======
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (!items.length) return;
    try {
      const remembered = localStorage.getItem(SELECTED_ID);
      if (remembered && items.some((i) => i.id === remembered)) {
        setSelectedId(remembered);
        localStorage.removeItem(SELECTED_ID);
      } else {
        setSelectedId((prev) => prev ?? items[0].id);
      }
    } catch {
      setSelectedId((prev) => prev ?? items[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // ====== datos de vehículos (para imagen/meta si están en el server) ======
  const [vehiculosMap, setVehiculosMap] = useState({});
  useEffect(() => {
    // Si tenés JSON Server levantado, esto completa imagen/meta por id
    const load = async () => {
      try {
        const res = await fetch("http://localhost:4000/vehiculos");
        if (!res.ok) return;
        const data = await res.json();
        const map = {};
        data.forEach((v) => (map[v.id] = v));
        setVehiculosMap(map);
      } catch {
        // silencioso: si no hay server, seguimos sin imagen
      }
    };
    load();
  }, []);

  // ====== opciones actuales del seleccionado (con defaults) ======
  const current = useMemo(
    () =>
      customs[selectedId] ?? {
        color: "Negro",
        paquete: "Base",
        llantas: "18”",
        garantia: "Fábrica (2 años)",
        accesorios: [],
      },
    [customs, selectedId]
  );

  const setCurrent = (patch) => {
    if (!selectedId) return;
    setCustoms((prev) => {
      const next = { ...prev, [selectedId]: { ...current, ...patch } };
      try {
        localStorage.setItem(CUSTOM_STORAGE, JSON.stringify(next));
      } catch (e) {
        console.error("Error guardando personalizaciones:", e);
      }
      return next;
    });
  };

  const opcionesRef = useRef(null);

  const extrasTotal = useMemo(() => calcularExtras(current), [current]);

  if (!isLoggedIn) {
    return (
      <main className="container section" style={{ minHeight: "60vh" }}>
        <h1>Personalizar</h1>
        <p className="large">Debes iniciar sesión para personalizar un vehículo.</p>
        <NavLink to="/login" className="btn is-primary">Iniciar sesión</NavLink>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="container section" style={{ minHeight: "60vh" }}>
        <h1>Personalizar</h1>
        <p className="large">
          No has seleccionado ningun vehículo. Agregá uno desde el{""}
          <NavLink to="/catalogo" className="btn" style={{ marginLeft: 8 }}>
            Catálogo
          </NavLink>
        </p>
      </main>
    );
  }

  const handleToggleAccesorio = (nombre, checked) => {
    const set = new Set(current.accesorios || []);
    checked ? set.add(nombre) : set.delete(nombre);
    setCurrent({ accesorios: [...set] });
  };

  const handleGuardar = () => {
    alert("¡Configuración guardada para este vehículo!");
  };

  // ====== UI ======
  const seleccionado = items.find((i) => i.id === selectedId);
  const detalleSel = seleccionado ? vehiculosMap[seleccionado.id] : null;

  return (
    <main className="container section personalize-layout" style={{ minHeight: "60vh" }}>
      {/* IZQUIERDA: lista de autos + opciones */}
      <div>
        {/* Lista de autos del carrito */}
        <section className="card">
          <h3>Vehículo elegido</h3>
          <div className="catalog-grid">
            {items.map((it) => {
              const isActive = it.id === selectedId;
              const extras = calcularExtras(customs[it.id]);
              const v = vehiculosMap[it.id];
              return (
                <article
                  key={it.id}
                  className={`product-card${isActive ? " is-selected" : ""}`}
                  onClick={() => setSelectedId(it.id)}
                  style={{ cursor: "pointer" }}
                  title="Seleccionar para personalizar"
                >
                  <figure className="product-media">
                    {v?.imagen ? <img src={v.imagen} alt={it.title} /> : <div style={{height:"100%",background:"#0b0c10"}} />}
                  </figure>
                  <div className="product-body">
                    <h3 className="product-title">{it.title}</h3>
                    <p className="product-meta">
                      Cant.: {it.qty} · USD {it.price.toLocaleString()}
                    </p>
                    {extras ? (
                      <p className="help">Extras: USD {extras.toLocaleString()}</p>
                    ) : (
                      <p className="muted">Sin personalización</p>
                    )}
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setSelectedId(it.id);
                        opcionesRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Personalizar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Opciones del seleccionado */}
        <section ref={opcionesRef} className="card" style={{ marginTop: 16 }}>
          <h3>Opciones para: {seleccionado?.title}</h3>

          <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
            <div className="form-control">
              <label htmlFor="color">Color</label>
              <select
                id="color"
                value={current.color}
                onChange={(e) => setCurrent({ color: e.target.value })}
              >
                {Object.keys(PRECIOS.color).map((c) => (
                  <option key={c} value={c}>
                    {c} {precioTag(PRECIOS.color[c])}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="paquete">Paquete</label>
              <select
                id="paquete"
                value={current.paquete}
                onChange={(e) => setCurrent({ paquete: e.target.value })}
              >
                {Object.keys(PRECIOS.paquete).map((p) => (
                  <option key={p} value={p}>
                    {p} {precioTag(PRECIOS.paquete[p])}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="llantas">Llantas</label>
              <select
                id="llantas"
                value={current.llantas}
                onChange={(e) => setCurrent({ llantas: e.target.value })}
              >
                {Object.keys(PRECIOS.llantas).map((l) => (
                  <option key={l} value={l}>
                    {l} {precioTag(PRECIOS.llantas[l])}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="garantia">Garantía</label>
              <select
                id="garantia"
                value={current.garantia}
                onChange={(e) => setCurrent({ garantia: e.target.value })}
              >
                {Object.keys(PRECIOS.garantia).map((g) => (
                  <option key={g} value={g}>
                    {g} {precioTag(PRECIOS.garantia[g])}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="form-control" style={{ gridColumn: "1 / -1" }}>
              <legend>Accesorios</legend>
              <div className="stack two">
                {Object.keys(PRECIOS.accesorios).map((a) => (
                  <label key={a}>
                    <input
                      type="checkbox"
                      checked={current.accesorios?.includes(a) || false}
                      onChange={(e) => handleToggleAccesorio(a, e.target.checked)}
                    />{" "}
                    {a} {precioTag(PRECIOS.accesorios[a])}
                  </label>
                ))}
              </div>
            </fieldset>

            <div style={{ gridColumn: "1 / -1" }}>
              <button className="btn is-primary" type="button" onClick={handleGuardar}>
                Guardar configuración
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* DERECHA: panel resumen pegajoso */}
      <aside className="card cart-panel">
        <h3>Resumen</h3>

        {/* Vehículo seleccionado */}
        <div className="cart-item" style={{ marginTop: 8 }}>
          <div className="cart-item__info">
            <strong>{seleccionado?.title ?? "—"}</strong>
            <div className="muted">
              {detalleSel?.meta ? detalleSel.meta : "—"}
            </div>
          </div>
          <div className="cart-item__qty">
            <span>USD {seleccionado ? seleccionado.price.toLocaleString() : 0}</span>
          </div>
        </div>

        {/* Opciones elegidas */}
        <div className="cart-items" style={{ marginTop: 8 }}>
          <div className="muted">Color: {current.color}</div>
          <div className="muted">Paquete: {current.paquete}</div>
          <div className="muted">Llantas: {current.llantas}</div>
          <div className="muted">Garantía: {current.garantia}</div>
          {current.accesorios?.length ? (
            <div className="muted">
              Accesorios:
              <ul style={{ margin: "6px 0 0 16px" }}>
                {current.accesorios.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="muted">Accesorios: —</div>
          )}
        </div>

        {/* Totales */}
        <div className="cart-summary">
          <div className="cart-total-row">
            <span>Total vehículo</span>
            <strong>USD {total.toLocaleString()}</strong>
          </div>
          <div className="cart-total-row">
            <span>Extras seleccionados</span>
            <strong>USD {extrasTotal.toLocaleString()}</strong>
          </div>
          <div className="cart-total-row">
            <span style={{ fontWeight: 700 }}>TOTAL A PAGAR</span>
            <strong style={{ fontSize: 18 }}>
              USD {(total + extrasTotal).toLocaleString()}
            </strong>
          </div>
          <NavLink to="/catalogo" className="btn">
            PROCEDER AL PAGO
          </NavLink>
        </div>
      </aside>
    </main>
  );
}

/* ====== helpers ====== */
function precioTag(n) {
  if (!n) return "";
  return `( +USD ${n.toLocaleString()} )`;
}

function calcularExtras(cfg) {
  if (!cfg) return 0;
  const base =
    (PRECIOS.color[cfg.color] ?? 0) +
    (PRECIOS.paquete[cfg.paquete] ?? 0) +
    (PRECIOS.llantas[cfg.llantas] ?? 0) +
    (PRECIOS.garantia[cfg.garantia] ?? 0);
  const acc = (cfg.accesorios || []).reduce(
    (sum, a) => sum + (PRECIOS.accesorios[a] ?? 0),
    0
  );
  return base + acc;
}
