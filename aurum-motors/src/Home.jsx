const Home = () => {
  return (
    <main>
      {/* Slider */}
      <div className="container section">
        <section className="slider" aria-label="Galería de modelos destacados">
          <div className="slider__track">
            <figure className="slider__slide is-active">
              <img src="public/vehiculos/AUDI RS61.avif" alt="AUDI RS6 negro" />
              <figcaption className="slider__caption">
                <h2>Audi RS6</h2>
                <p>Performance y diseño para amantes de la velocidad.</p>
              </figcaption>
            </figure>

            <figure className="slider__slide" aria-hidden="true">
              <img src="public/vehiculos/F150 RAPTOR.jpeg" alt="Ford F-150 Raptor negra" />
              <figcaption className="slider__caption">
                <h2>Ford F150 Raptor</h2>
                <p>Espacio, confort y tecnología sin compromisos.</p>
              </figcaption>
            </figure>

            <figure className="slider__slide" aria-hidden="true">
              <img src="public/vehiculos/MB CLASE C AMG2.jpeg" alt="Mercedes Benz Clase C AMG gris" />
              <figcaption className="slider__caption">
                <h2>Mercedes Benz Clase C AMG</h2>
                <p>Elegancia y sobriedad para tu día a día.</p>
              </figcaption>
            </figure>
          </div>

          <div className="slider__controls">
            <button id="prevSlide" className="ctrl" type="button" aria-label="Anterior">&#10094;</button>
            <button id="nextSlide" className="ctrl" type="button" aria-label="Siguiente">&#10095;</button>
          </div>

          <div className="slider__dots" role="group" aria-label="Paginación del carrusel">
            <button className="slider__dot is-active" type="button" aria-label="Ir a la imagen 1" aria-current="true"></button>
            <button className="slider__dot" type="button" aria-label="Ir a la imagen 2"></button>
            <button className="slider__dot" type="button" aria-label="Ir a la imagen 3"></button>
          </div>
        </section>
      </div>

      {/* Quiénes somos */}
      <div className="container section">
        <section className="card" id="quienes-somos">
          <h3>¿Quiénes somos?</h3>
          <p className="lead">
            En <strong>Aurum</strong> nos especializamos en la venta de autos de alta gama,
            combinando exclusividad, diseño y potencia. Creemos que cada vehículo es más que
            un medio de transporte: es una experiencia de lujo. Ofrecemos atención personalizada
            y un servicio confiable para acompañar a nuestros clientes en cada paso.
          </p>
        </section>
      </div>

      {/* Calculadora */}
      <div className="container section">
        <section className="card" aria-labelledby="calc-title">
          <h3 id="calc-title">Calculadora de financiación</h3>
          <div className="form-grid">
            <div className="form-control">
              <label htmlFor="precio">Precio del vehículo (USD)</label>
              <input id="precio" name="precio" type="number" placeholder="Ej: 45000" inputMode="numeric" />
            </div>
            <div className="form-control">
              <label htmlFor="anticipo">Anticipo (USD)</label>
              <input id="anticipo" name="anticipo" type="number" placeholder="Ej: 10000" inputMode="numeric" />
            </div>
            <div className="form-control">
              <label htmlFor="tasa">Tasa nominal anual (%)</label>
              <input id="tasa" name="tasa" type="number" placeholder="Ej: 48" inputMode="decimal" />
            </div>
            <div className="form-control">
              <label htmlFor="meses">Meses</label>
              <select id="meses" name="meses">
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>

          <p id="resultado" aria-live="polite"></p>
          <button id="calc-btn" className="btn" type="button" onClick={() => window.calcularCuota?.()}>
            Calcular cuota
          </button>
        </section>
      </div>
    </main>
  );
};

export default Home;
