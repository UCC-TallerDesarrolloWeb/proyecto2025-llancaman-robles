import { useEffect, useState } from "react";
import { useCart } from "../components/CartContext";

const Camionetas = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const { addItem } = useCart();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    const data = [
      {
        id: "amarok-v6",
        marca: "Volkswagen",
        modelo: "Amarok V6",
        tipo: "Camioneta",
        anio: 2025,
        precio: 65000,
        imagen: "/public/vehiculos/AMAROK V61.webp",
        meta: "4x4 · 2025 · Automática",
      },
      {
        id: "ford-f150-raptor",
        marca: "Ford",
        modelo: "F150 Raptor",
        tipo: "Camioneta",
        anio: 2025,
        precio: 135000,
        imagen: "public/vehiculos/F150 RAPTOR.jpeg",
        meta: "4x4 · 2025 · Automática",
      },
      {
        id: "bmw-x6",
        marca: "BMW",
        modelo: "X6",
        tipo: "Camioneta",
        anio: 2025,
        precio: 140000,
        imagen: "public/vehiculos/BMW X61.jpg",
        meta: "SUV · 2025 · Automática",
      },
      {
        id: "hilux-gr",
        marca: "Toyota",
        modelo: "Hilux GR",
        tipo: "Camioneta",
        anio: 2025,
        precio: 75000,
        imagen: "public/vehiculos/HILUX GR1.jpg",
        meta: "4x4 · 2025 · Automática",
      },
    ];
    setVehiculos(data);
  }, []);

  const handleComprar = (v) =>
    alert(`Has iniciado el proceso de compra de ${v.marca} ${v.modelo}`);

  return (
    <main className="container section">
      <h1>Camionetas</h1>

      <section className="catalog-grid" aria-live="polite">
        {vehiculos.map((v) => (
          <article
            key={v.id}
            className="product-card"
            data-tipo="camioneta"
            data-marca={v.marca.toLowerCase()}
            data-anio={v.anio}
            data-precio={v.precio}
            id={v.id}
          >
            <figure className="product-media">
              <img src={v.imagen} alt={`${v.marca} ${v.modelo}`} />
            </figure>

            <div className="product-body">
              <h3 className="product-title">{v.marca} {v.modelo}</h3>
              <p className="product-meta">{v.meta}</p>
              <strong className="product-price">USD {v.precio.toLocaleString()}</strong>

              {isLoggedIn ? (
                <div className="stack two">
                  <button
                    className="btn"
                    type="button"
                    onClick={() =>
                      addItem({
                        id: v.id,
                        title: `${v.marca} ${v.modelo}`,
                        price: v.precio,
                        qty: 1,
                      })
                    }
                  >
                    Agregar al carrito
                  </button>
                  <button
                    className="btn view-more"
                    type="button"
                    onClick={() => handleComprar(v)}
                  >
                    Comprar / Elegir vehículo
                  </button>
                </div>
              ) : (
                <p className="help">Inicia sesión para comprar</p>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Camionetas;
