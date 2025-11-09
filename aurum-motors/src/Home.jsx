// Home.jsx
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/vehiculos/AUDI RS61.avif",
    title: "Audi RS6",
    desc: "Performance y diseño para amantes de la velocidad.",
    alt: "AUDI RS6 negro",
  },
  {
    src: "/vehiculos/F150 RAPTOR.jpeg",
    title: "Ford F150 Raptor",
    desc: "Espacio, confort y tecnología sin compromisos.",
    alt: "Ford F-150 Raptor negra",
  },
  {
    src: "/vehiculos/MB CLASE C AMG2.jpeg",
    title: "Mercedes Benz Clase C AMG",
    desc: "Elegancia y sobriedad para tu día a día.",
    alt: "Mercedes Benz Clase C AMG gris",
  },
];

const Home = () => {
  const [idx, setIdx] = useState(0);
  const [resultado, setResultado] = useState("");

  const go = (i) => setIdx((i + SLIDES.length) % SLIDES.length);
  const next = () => setIdx((prev) => (prev + 1) % SLIDES.length);
  const prev = () =>
    setIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const calcularCuota = () => {
    const precio = Number(document.getElementById("precio")?.value);
    const anticipo = Number(document.getElementById("anticipo")?.value);
    const tasa = Number(document.getElementById("tasa")?.value); // TNA %
    const meses = Number(document.getElementById("meses")?.value);

    // Validaciones básicas: números válidos y no-negativos
    if (!Number.isFinite(precio) || precio <= 0) {
      setResultado("Ingresá un precio válido y mayor a 0.");
      return;
    }
    if (!Number.isFinite(anticipo) || anticipo < 0) {
      setResultado("Ingresá un anticipo válido (0 o mayor).");
      return;
    }
    if (!Number.isFinite(tasa) || tasa < 0) {
      setResultado("Ingresá una tasa válida (0 o mayor).");
      return;
    }
    if (!Number.isFinite(meses) || meses <= 0) {
      setResultado("Seleccioná una cantidad de meses válida.");
      return;
    }

    // Asegurar que el anticipo no supere al precio
    const anticipoSan = Math.min(anticipo, precio);
    const financiado = Math.max(0, precio - anticipoSan);

    const i = tasa / 100 / 12;
    let cuota = 0;

    if (financiado === 0) {
      cuota = 0;
    } else if (i === 0) {
      cuota = financiado / meses;
    } else {
      cuota = (financiado * i) / (1 - Math.pow(1 + i, -meses));
    }

    setResultado(
      `Cuota estimada: USD ${cuota.toFixed(
        2
      )} · Financiado: USD ${financiado.toFixed(2)}`
    );
  };

  return (
    <main>
      <div className="container section">
        <section className="slider" aria-label="Galería de modelos destacados">
          <div className="slider__track">
            {SLIDES.map((s, i) => (
              <figure
                key={s.title}
                className={`slider__slide${i === idx ? " is-active" : ""}`}
                aria-hidden={i === idx ? "false" : "true"}
              >
                <img src={s.src} alt={s.alt} />
                <figcaption className="slider__caption">
                  <h2>{s.title}</h2>
                  <p>{s.desc}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="slider__controls">
            <button
              className="ctrl"
              type="button"
              aria-label="Anterior"
              onClick={prev}
            >
              &#10094;
            </button>
            <button
              className="ctrl"
              type="button"
              aria-label="Siguiente"
              onClick={next}
            >
              &#10095;
            </button>
          </div>

          <div
            className="slider__dots"
            role="group"
            aria-label="Paginación del carrusel"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`slider__dot${i === idx ? " is-active" : ""}`}
                type="button"
                aria-label={`Ir a la imagen ${i + 1}`}
                aria-current={i === idx ? "true" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="container section">
        <section className="card" id="quienes-somos">
          <h3>¿Quiénes somos?</h3>
          <p className="lead">
            En <strong>Aurum</strong> nos especializamos en la venta de autos de
            alta gama, combinando exclusividad, diseño y potencia. Creemos que
            cada vehículo es más que un medio de transporte: es una experiencia
            de lujo. Ofrecemos atención personalizada y un servicio confiable
            para acompañar a nuestros clientes en cada paso.
          </p>
        </section>
      </div>

      <div className="container section">
        <section className="card" aria-labelledby="calc-title">
          <h3 id="calc-title">Calculadora de financiación</h3>
          <div className="form-grid">
            <div className="form-control">
              <label htmlFor="precio">Precio del vehículo (USD)</label>
              <input
                id="precio"
                name="precio"
                type="number"
                placeholder="Ej: 45000"
                inputMode="numeric"
                min="0"
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "+"
                  )
                    e.preventDefault();
                }}
              />
            </div>
            <div className="form-control">
              <label htmlFor="anticipo">Anticipo (USD)</label>
              <input
                id="anticipo"
                name="anticipo"
                type="number"
                placeholder="Ej: 10000"
                inputMode="numeric"
                min="0"
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "+"
                  )
                    e.preventDefault();
                }}
              />
            </div>
            <div className="form-control">
              <label htmlFor="tasa">Tasa nominal anual (%)</label>
              <input
                id="tasa"
                name="tasa"
                type="number"
                placeholder="Ej: 48"
                inputMode="decimal"
                min="0"
                step="0.01"
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "+"
                  )
                    e.preventDefault();
                }}
              />
            </div>
            <div className="form-control">
              <label htmlFor="meses">Meses</label>
              <select id="meses" name="meses" defaultValue="12">
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>

          <p id="resultado" aria-live="polite">
            {resultado}
          </p>
          <button
            id="calc-btn"
            className="btn"
            type="button"
            onClick={calcularCuota}
          >
            Calcular cuota
          </button>
        </section>
      </div>
    </main>
  );
};

export default Home;
