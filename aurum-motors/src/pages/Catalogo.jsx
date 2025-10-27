import { useEffect, useState } from "react";
import ModalVehiculo from "../components/ModalVehiculo";

const Catalogo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo: [],
    marca: [],
    anioMin: "",
    anioMax: "",
    precioMin: "",
    precioMax: "",
    buscar: "",
  });
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // traer los datos desde data/db.

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await fetch("src/data/db.json");
        const data = await response.json();
        setVehiculos(data.vehiculos);
      } catch (error) {
        console.error("Error al cargar los vehículos:", error);
      }
    };

    fetchVehiculos();
  }, []);

  // Filtrado
  const filtrarVehiculos = () =>
    vehiculos.filter((v) => {
      const tipoOK =
        !filtros.tipo.length || filtros.tipo.includes(v.tipo.toLowerCase());
      const marcaOK =
        !filtros.marca.length || filtros.marca.includes(v.marca.toLowerCase());
      const anioOK =
        (!filtros.anioMin || v.anio >= Number(filtros.anioMin)) &&
        (!filtros.anioMax || v.anio <= Number(filtros.anioMax));
      const precioOK =
        (!filtros.precioMin || v.precio >= Number(filtros.precioMin)) &&
        (!filtros.precioMax || v.precio <= Number(filtros.precioMax));
      const buscarOK =
        !filtros.buscar ||
        `${v.marca} ${v.modelo}`
          .toLowerCase()
          .includes(filtros.buscar.toLowerCase());
      return tipoOK && marcaOK && anioOK && precioOK && buscarOK;
    });

  // Handlers filtros
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFiltros((prev) => {
        const lista = new Set(prev[name]);
        checked ? lista.add(value) : lista.delete(value);
        return { ...prev, [name]: [...lista] };
      });
    } else {
      setFiltros((prev) => ({ ...prev, [name]: value }));
    }
  };

  const limpiarFiltros = () =>
    setFiltros({
      tipo: [],
      marca: [],
      anioMin: "",
      anioMax: "",
      precioMin: "",
      precioMax: "",
      buscar: "",
    });

  const resultados = filtrarVehiculos();

  return (
    <main className="container section catalog-layout">
      {/* Barra de búsqueda */}
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

      {/* Filtros */}
      <aside className="filters" aria-label="Filtros de catálogo">
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

      {/* Grilla de productos */}
      <section className="catalog-grid" aria-live="polite">
        {resultados.length ? (
          resultados.map((v) => (
            <article
              key={v.id}
              className="product-card"
              data-tipo={v.tipo.toLowerCase()}
              data-marca={v.marca.toLowerCase()}
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
      </section>

      {/* Modal de detalle */}
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
