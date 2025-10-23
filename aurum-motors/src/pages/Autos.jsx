import { useEffect, useState } from "react";
import { useCart } from "../components/CartContext";

const Autos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const { addItem } = useCart();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    const data = [
      {
        id: "audi-q7",
        marca: "Audi",
        modelo: "Q7",
        tipo: "Auto",
        anio: 2025,
        precio: 120000,
        imagen: "public/vehiculos/AUDI Q71.avif",
        meta: "SUV · 2025 · Automático",
      },
      {
        id: "audi-rs6",
        marca: "Audi",
        modelo: "RS6",
        tipo: "Auto",
        anio: 2025,
        precio: 185000,
        imagen: "public/vehiculos/AUDI RS61.avif",
        meta: "Sedán · 2025 · Automático",
      },
      {
        id: "audi-s5-coupe",
        marca: "Audi",
        modelo: "S5 Coupe",
        tipo: "Auto",
        anio: 2025,
        precio: 95000,
        imagen: "public/vehiculos/AUDI S5 COUPE.webp",
        meta: "Sedán · 2025 · Automático",
      },
      {
        id: "bmw-m4",
        marca: "BMW",
        modelo: "M4",
        tipo: "Auto",
        anio: 2025,
        precio: 170000,
        imagen: "public/vehiculos/BMW M4.jpg",
        meta: "Sedán · 2025 · Automático",
      },
      {
        id: "mb-a45",
        marca: "Mercedes-Benz",
        modelo: "A45",
        tipo: "Auto",
        anio: 2025,
        precio: 80000,
        imagen: "public/vehiculos/MB A45.jpg",
        meta: "Sedán · 2025 · Automático",
      },
      {
        id: "mb-camg",
        marca: "Mercedes-Benz",
        modelo: "Clase C AMG",
        tipo: "Auto",
        anio: 2025,
        precio: 95000,
        imagen: "public/vehiculos/MB CLASE C AMG2.jpeg",
        meta: "Sedán · 2025 · Automático",
      },
    ];
    setVehiculos(data);
  }, []);

  const handleComprar = (v) =>
    alert(`Has iniciado el proceso de compra de ${v.marca} ${v.modelo}`);

  return (
    <main className="container section">
      <h1>Autos</h1>

      <section className="catalog-grid" aria-live="polite">
        {vehiculos.map((v) => (
          <article
            key={v.id}
            className="product-card"
            data-tipo="auto"
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

export default Autos;
