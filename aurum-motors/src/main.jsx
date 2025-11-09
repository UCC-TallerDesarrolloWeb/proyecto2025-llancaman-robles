import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "@components/Layout.jsx";
import Home from "@/Home.jsx";
import Catalogo from "@pages/Catalogo.jsx";
import Personalizar from "@pages/Personalizar.jsx";
import Login from "@/Login.jsx";
import { CartProvider } from "@components/CartContext.jsx";

import "@styles/global.scss";
import "@styles/index.scss";
import "@styles/store.scss";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="personalizar" element={<Personalizar />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
