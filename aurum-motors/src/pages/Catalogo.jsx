// Catalogo.jsx
import { useEffect, useMemo, useState } from "react";
import ModalVehiculo from "@components/ModalVehiculo";

const FILTROS_INICIALES = {
  tipo: [],
  marca: [],
  anioMin: "",
  anioMax: "",
  precioMin: "",
  precioMax: "",
  buscar: "",
};

const Catalogo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    const ac = new AbortController();
    const fetchVehiculos = async () => {
      try {
        const res = await fetch("src/data/db.json", { signal: ac.signal });
        const data = await res.json();
        const list = Array.isArray(data?.vehiculos) ? data.vehiculos : [];
        const normalizados = list.map((v) => ({
          ...v,
          _lcTipo: (v.tipo || "").toLowerCase(),
          _lcMarca: (v.marca || "").toLowerCase(),
          _lcNombre: `${v.marca || ""} ${v.modelo || ""}`.toLowerCase(),
        }));
        setVehiculos(normalizados);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error al cargar los vehículos:", err);
        }
      }
    };
    fetchVehiculos();
    return () => ac.abort();
  }, []);

  const handleCheckbox = (name, value, checked) => {
    setFiltros((prev) => {
      const set = new Set(prev[name]);
      checked ? set.add(value) : set.delete(value);
      return { ...prev, [name]: [...set] };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      handleCheckbox(name, value, checked);
    } else {
      setFiltros((prev) => ({ ...prev, [name]: value }));
    }
  };

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  const resultados = useMemo(() => {
    const { tipo, marca, anioMin, anioMax, precioMin, precioMax, buscar } =
      filtros;

    const hasTipos = tipo.length > 0;
    const hasMarcas = marca.length > 0;
    const hasBuscar = Boolean(buscar?.trim());
    const q = (buscar || "").toLowerCase();

    const minY = anioMin ? Number(anioMin) : null;
    const maxY = anioMax ? Number(anioMax) : null;
    const minP = precioMin ? Number(precioMin) : null;
    const maxP = precioMax ? Number(precioMax) : null;

    return vehiculos.filter((v) => {
      const tipoOK = !hasTipos || tipo.includes(v._lcTipo);
      const marcaOK = !hasMarcas || marca.includes(v._lcMarca);
      const anioOK =
        (minY === null || v.anio >= minY) && (maxY === null || v.anio <= maxY);
      const precioOK =
        (minP === null || v.precio >= minP) &&
        (maxP === null || v.precio <= maxP);
      const buscarOK = !hasBuscar || v._lcNombre.includes(q);
      return tipoOK && marcaOK && anioOK && precioOK && buscarOK;
    });
  }, [vehiculos, filtros]);

  return (
    <main className="container section">
      <section className="catalog-toolbar" aria-label="Barra de búsqueda">
        <input
          id="buscar"
          name="buscar"
          type="search"
          placeholder="Buscar por marca o modelo..."
          value={filtros.buscar}
          onChange={handleChange}
        />
        <button className="btn" type="button">
          Buscar
        </button>
        <small className="help">Ej.: "BMW", "Hilux", "A6"</small>
      </section>

      <div className="catalog-layout">
        <aside className="catalog-filters" aria-label="Filtros de catálogo">
          <form>
            <fieldset className="card">
              <legend>Tipo</legend>
              <div className="stack">
                <label>
                  <input
                    type="checkbox"
                    name="tipo"
                    value="auto"
                    checked={filtros.tipo.includes("auto")}
                    onChange={handleChange}
                  />{" "}
                  Auto
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="tipo"
                    value="camioneta"
                    checked={filtros.tipo.includes("camioneta")}
                    onChange={handleChange}
                  />{" "}
                  Camioneta
                </label>
              </div>
            </fieldset>

            <fieldset className="card">
              <legend>Marca</legend>
              <div className="stack">
                {[
                  "audi",
                  "bmw",
                  "mercedes-benz",
                  "toyota",
                  "volkswagen",
                  "ford",
                ].map((m) => (
                  <label key={m}>
                    <input
                      type="checkbox"
                      name="marca"
                      value={m}
                      checked={filtros.marca.includes(m)}
                      onChange={handleChange}
                    />{" "}
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="card">
              <legend>Año</legend>
              <div className="stack two">
                <div className="form-control">
                  <label htmlFor="anioMin">Mín</label>
                  <input
                    id="anioMin"
                    name="anioMin"
                    type="number"
                    placeholder="2018"
                    value={filtros.anioMin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="anioMax">Máx</label>
                  <input
                    id="anioMax"
                    name="anioMax"
                    type="number"
                    placeholder="2025"
                    value={filtros.anioMax}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="card">
              <legend>Precio (USD)</legend>
              <div className="stack two">
                <div className="form-control">
                  <label htmlFor="precioMin">Mín</label>
                  <input
                    id="precioMin"
                    name="precioMin"
                    type="number"
                    placeholder="50000"
                    value={filtros.precioMin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="precioMax">Máx</label>
                  <input
                    id="precioMax"
                    name="precioMax"
                    type="number"
                    placeholder="200000"
                    value={filtros.precioMax}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            <div className="stack">
              <button className="btn" type="button" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          </form>
        </aside>

        <section className="catalog-list" aria-live="polite">
          <div className="catalog-grid">
            {resultados.length ? (
              resultados.map((v) => (
                <article
                  key={v.id}
                  className="product-card"
                  data-tipo={v._lcTipo}
                  data-marca={v._lcMarca}
                  data-anio={v.anio}
                  data-precio={v.precio}
                  id={v.id}
                >
                  <figure className="product-media">
                    <img src={v.imagen} alt={`${v.marca} ${v.modelo}`} />
                  </figure>

                  <div className="product-body">
                    <h3 className="product-title">
                      {v.marca} {v.modelo}
                    </h3>
                    <p className="product-meta">{v.meta}</p>
                    <strong className="product-price">
                      USD {v.precio.toLocaleString()}
                    </strong>

                    {isLoggedIn ? (
                      <div className="stack two">
                        <button
                          className="btn view-more"
                          type="button"
                          onClick={() => setVehiculoSeleccionado(v)}
                        >
                          Ver más / Elegir auto
                        </button>
                      </div>
                    ) : (
                      <p className="help">Inicia sesión para comprar</p>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p>No se encontraron vehículos con esos filtros.</p>
            )}
          </div>
        </section>
      </div>

      {vehiculoSeleccionado && (
        <ModalVehiculo
          vehiculo={vehiculoSeleccionado}
          onClose={() => setVehiculoSeleccionado(null)}
        />
      )}
    </main>
  );
};

export default Catalogo;
