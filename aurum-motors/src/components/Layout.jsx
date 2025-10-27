import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "./CartContext";
import CartDrawer from "./CartDrawer";

const Layout = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [navOpen, setNavOpen] = useState(false);
  const { toggle, count } = useCart();

  const toggleNav = () => setNavOpen(!navOpen);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <>
      {/* ======= HEADER ======= */}
      <header className={`site-header ${navOpen ? "nav-open" : ""}`}>
        <div className="container header-inner">
          <div className="brand">
            <NavLink to="/" className="brand__logo-link" aria-label="Ir a inicio">
              <img src="/logo.png" alt="Logo de Aurum" className="brand__logo" />
            </NavLink>
            <h1 className="brand__title">Aurum Motors</h1>
          </div>

          <button
            id="nav-toggle"
            className="nav-toggle"
            aria-expanded={navOpen ? "true" : "false"}
            aria-label="Abrir menú"
            onClick={toggleNav}
          >
            ☰
          </button>

          <nav className="main-nav" aria-label="Navegación principal">
            <NavLink to="/" end>Inicio</NavLink>
            <NavLink to="/catalogo">Catálogo</NavLink>
            <NavLink to="/personalizar">Personalizar</NavLink>

            {/* Botón Carrito (clases originales) */}
            <button
              className="cart-button"
              type="button"
              aria-label="Abrir carrito"
              onClick={toggle}
            >
              <span className="cart-icon" aria-hidden="true">🛒</span>
              <span className="cart-count" aria-live="polite">{count}</span>
            </button>

            {isLoggedIn ? (
              <button className="btn is-primary" onClick={handleLogout}>Cerrar sesión</button>
            ) : (
              <NavLink to="/login" className="btn is-primary">Iniciar sesión</NavLink>
            )}
          </nav>
        </div>
      </header>

      {/* ======= CONTENIDO ======= */}
      <Outlet />

      {/* ======= FOOTER GLOBAL ======= */}
      <footer className="site-footer">
        <div className="container grid">
          <div>
            <strong>Aurum</strong><br />
            <small>Alta gama · Argentina</small>
          </div>
          <div className="footer-right">
            <small><NavLink to="/">Inicio</NavLink> · <NavLink to="/catalogo">Catálogo</NavLink></small>
            <br />
            <small>&copy; 2025 Aurum. Todos los derechos reservados.</small>
          </div>
        </div>
      </footer>

      {/* ======= DRAWER DEL CARRITO ======= */}
      <CartDrawer />
    </>
  );
};

export default Layout;
