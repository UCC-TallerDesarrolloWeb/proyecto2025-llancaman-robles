import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/index.css";

import { CartProvider } from "./components/CartContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";

import Catalogo from "./pages/Catalogo.jsx";
import Autos from "./pages/Autos.jsx";
import Camionetas from "./pages/Camionetas.jsx";
import Personalizar from "./pages/Personalizar.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="autos" element={<Autos />} />
            <Route path="camionetas" element={<Camionetas />} />
            <Route path="personalizar" element={<Personalizar />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>
);
