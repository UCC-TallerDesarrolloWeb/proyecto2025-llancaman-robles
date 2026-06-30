// Layout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { useCart } from "@components/CartContext";
import CartDrawer from "@components/CartDrawer";
import logo from "@/assets/logo.png";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [navOpen, setNavOpen] = useState(false);
  const { toggle, count } = useCart();

  const toggleNav = () => setNavOpen((v) => !v);
  const closeNav = () => setNavOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        navOpen &&
        !e.target.closest(".main-nav") &&
        !e.target.closest(".nav-toggle")
      ) {
        setNavOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [navOpen]);

  return (
    <>
      {/* ======= HEADER ======= */}
      <header className={`site-header ${navOpen ? "nav-open" : ""}`}>
        <div className="container header-inner">
          <div className="brand">
            <NavLink
              to="/"
              className="brand__logo-link"
              aria-label="Ir a inicio"
              onClick={closeNav}
            >
              <img src={logo} alt="Logo de Aurum" className="brand__logo" />
            </NavLink>
            <h1 className="brand__title">Aurum Motors</h1>
          </div>

          <button
            className="nav-toggle"
            aria-expanded={navOpen ? "true" : "false"}
            aria-label={navOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={toggleNav}
          >
            ☰
          </button>

          <nav className="main-nav" aria-label="Navegación principal">
            <NavLink to="/" end onClick={closeNav}>
              Inicio
            </NavLink>
            <NavLink to="/catalogo" onClick={closeNav}>
              Catálogo
            </NavLink>
            <NavLink to="/personalizar" onClick={closeNav}>
              Personalizar
            </NavLink>

            {/* Botón Carrito (clases originales) */}
            <button
              className="cart-button"
              type="button"
              aria-label="Abrir carrito"
              onClick={toggle}
            >
              <span className="cart-icon" aria-hidden="true">
                🛒
              </span>
              {isLoggedIn && count > 0 && (
                <span className="cart-count" aria-live="polite">
                  {count}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <button className="btn is-primary" onClick={handleLogout}>
                Cerrar sesión
              </button>
            ) : (
              <NavLink
                to="/login"
                className="btn is-primary"
                onClick={closeNav}
              >
                Iniciar sesión
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      {/* ======= CONTENIDO ======= */}
      <div className="site-main">
        <Outlet />
      </div>

      {/* ======= FOOTER GLOBAL ======= */}
      <footer className="site-footer">
        <div className="container grid">
          <div>
            <strong>Aurum</strong>
            <br />
            <small>Alta gama · Argentina</small>
          </div>
          <div className="footer-right">
            <small>
              <NavLink to="/" onClick={closeNav}>
                Inicio
              </NavLink>{" "}
              ·{" "}
              <NavLink to="/catalogo" onClick={closeNav}>
                Catálogo
              </NavLink>
            </small>
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
