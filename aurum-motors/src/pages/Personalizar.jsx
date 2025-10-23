import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../components/CartContext";
import { NavLink } from "react-router-dom";

const CUSTOM_STORAGE = "aurum_customizations";
const SELECTED_ID = "aurum_selected_vehicle_id";

const PRECIOS = {
  color: {
    Negro: 0,
    Blanco: 0,
    Gris: 0,
    Azul: 350,
    Rojo: 350,
    "Negro mate": 900,
  },
  paquete: {
    Base: 0,
    Comfortline: 1200,
    Highline: 2800,
    Premium: 5200,
  },
  llantas: {
    "18”": 0,
    "19”": 700,
    "20”": 1200,
  },
  garantia: {
    "Fábrica (2 años)": 0,
    "+1 año": 600,
    "+2 años": 1000,
  },
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

  // leer/escribir personalizaciones por vehículo { [id]: { ...opciones } }
  const [customs, setCustoms] = useState({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE);
      if (raw) setCustoms(JSON.parse(raw));
    } catch (e) {
      console.error("Error leyendo personalizaciones:", e);
    }
  }, []);

  // vehículo seleccionado
  const [selectedId, setSelectedId] = useState(null);

  // cuando hay carrito, preferir el id recordado por el modal
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

  // opciones del seleccionado (con defaults)
  const current = useMemo(() => {
    return (
      customs[selectedId] ?? {
        color: "Negro",
        paquete: "Base",
        llantas: "18”",
        garantia: "Fábrica (2 años)",
        accesorios: [],
      }
    );
  }, [customs, selectedId]);

  const opcionesRef = useRef(null);

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

  const extrasTotal = useMemo(() => {
    const base =
      (PRECIOS.color[current.color] ?? 0) +
      (PRECIOS.paquete[current.paquete] ?? 0) +
      (PRECIOS.llantas[current.llantas] ?? 0) +
      (PRECIOS.garantia[current.garantia] ?? 0);
    const acc = (current.accesorios || []).reduce(
      (sum, a) => sum + (PRECIOS.accesorios[a] ?? 0),
      0
    );
    return base + acc;
  }, [current]);

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
          Tu carrito está vacío. Agregá un vehículo desde el{" "}
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

  return (
    <main className="container section" style={{ minHeight: "60vh" }}>
      <h1>Personalizar</h1>

      {/* === AUTOS DEL CARRITO === */}
      <section className="card" style={{ marginBottom: 24 }}>
        <h3>Tu carrito</h3>
        <div className="catalog-grid">
          {items.map((it) => {
            const isActive = it.id === selectedId;
            const extras = calcularExtras(customs[it.id]);
            return (
              <article
                key={it.id}
                className={`product-card${isActive ? " is-selected" : ""}`}
                onClick={() => setSelectedId(it.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-body">
                  <h3 className="product-title">{it.title}</h3>
                  <p className="product-meta">
                    Cantidad: {it.qty} · Precio: USD {it.price.toLocaleString()}
                  </p>
                  {extras ? (
                    <p className="help">Extras guardados: USD {extras.toLocaleString()}</p>
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
                    Personalizar este vehículo
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* === OPCIONES === */}
      <section ref={opcionesRef} className="card" style={{ marginBottom: 24 }}>
        <h3>Opciones para: {items.find((i) => i.id === selectedId)?.title}</h3>

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
        </form>
      </section>

      {/* === RESUMEN === */}
      <section className="card" style={{ maxWidth: 720, marginInline: "auto" }}>
        <h3>Resumen</h3>
        <div className="grid" style={{ gridTemplateColumns: "1fr auto" }}>
          <span>Total carrito</span>
          <strong>USD {total.toLocaleString()}</strong>

          <span>Extras seleccionados</span>
          <strong>USD {extrasTotal.toLocaleString()}</strong>

          <span style={{ fontWeight: 700 }}>Total estimado</span>
          <strong style={{ fontSize: 18 }}>
            USD {(total + extrasTotal).toLocaleString()}
          </strong>
        </div>

        <div className="stack" style={{ marginTop: 16 }}>
          <button className="btn is-primary" type="button" onClick={handleGuardar}>
            Guardar configuración
          </button>
          <NavLink to="/catalogo" className="btn">
            Seguir eligiendo vehículos
          </NavLink>
        </div>
      </section>
    </main>
  );
}

/* ===== helpers ===== */

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
