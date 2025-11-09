# 🚗 Aurum - Concesionaria de Autos de Alta Gama

## 👥 Autores
- Llancaman, Santiago
- Robles, Franco

---

## 📑 Índice
1. [Descripción del proyecto](#-descripción-del-proyecto)
2. [Tecnologías utilizadas](#-tecnologías-utilizadas)
3. [Contenido de la página](#-contenido-de-la-página)
4. [Tabla de modelos disponibles](#-tabla-de-modelos-disponibles)
5. [GitHub Pages](#-github-pages)
6. [Segunda entrega](#-segunda-entrega)

---

## 📌 Descripción del proyecto
**Aurum** es un proyecto académico de diseño y desarrollo web enfocado en la **venta de automóviles de alta gama**.  
El objetivo es ofrecer a los usuarios una **experiencia premium**, destacando lujo, exclusividad y elegancia a través de un diseño moderno y responsivo.

Características principales:
- Catálogo de autos de lujo.
- Filtros avanzados por marca, año y precio.
- Diseño elegante con colores oscuros y dorados.
- Experiencia de usuario optimizada para **desktop y móvil**.
- Carrito de selección funcional con persistencia en **localStorage**.

---

## 🛠️ Tecnologías utilizadas
- **HTML5** → estructura del sitio.  
- **SASS (.scss)** → estilos anidados dentro de la carpeta `styles`, usando **alias de importación**.  
- **JavaScript (ES6+) / React** → componentes, rutas y estados globales (con `CartContext`).  
- **Vite** → entorno de desarrollo rápido.  
- **Figma** → prototipado de interfaces.  
- **GitHub Pages** → despliegue del sitio web.  
- **JSON Server (mock)** → simulación de API REST para el carrito.  

---

## 📄 Contenido de la página
- **Home:** Presentación de la marca, imagenes dinamicas de algunos auto disponibles en Aurum y reseñas de usuarios.
- **Catálogo:** Listado de autos con imágenes, fichas técnicas y filtros avanzados por **marca**, **año** y **precio**.  
- **Personalizar:** Página para seleccionar extras y confirmar la solicitud.  
- **Carrito:** Resumen de selección con botones de acción dinámicos.  
- **Login:** Autenticación básica de administrador para acceder al catálogo.  
- **Contacto:** Formulario de información de la concesionaria y número de contacto para consultas.  

---

## 📊 Tabla de modelos disponibles
| Marca          | Modelo                  | Año  | Precio estimado (USD) |
|----------------|-------------------------|------|-----------------------|
| Volkswagen     | Amarok V6               | 2025 | 65,000                |
| Audi           | Q7                      | 2025 | 120,000               |
| Audi           | RS6                     | 2025 | 185,000               |
| Audi           | S5 Coupé                | 2025 | 95,000                |
| BMW            | M4                      | 2025 | 170,000               |
| BMW            | X6                      | 2025 | 140,000               |
| Ford           | F-150 Raptor            | 2025 | 135,000               |
| Toyota         | Hilux GR Sport          | 2025 | 75,000                |
| Mercedes-Benz  | A45 AMG                 | 2025 | 80,000                |
| Mercedes-Benz  | Clase C AMG             | 2025 | 95,000                |

---

## 🌐 GitHub Pages
Podés acceder al proyecto desplegado en el siguiente link:  
👉 [Aurum en GitHub Pages](https://ucc-tallerdesarrolloweb.github.io/proyecto2025-llancaman-robles/)

---

## 📦 Segunda entrega

### 🧩 Alcance
En esta segunda etapa se incorporaron funcionalidades dinámicas y mayor interacción con el usuario, manteniendo la coherencia estética y técnica del proyecto original.  

Cambios y mejoras destacadas:
- Implementación de **React**. 
- Estructura de estilos migrada a **SASS** dentro de la carpeta `styles`. 
- Persistencia local del carrito mediante **localStorage** (clave `aurum_cart`).  

### ⚙️ Funcionamiento técnico
- El carrito se maneja globalmente con **CartContext**, compartido en toda la app.  
- El archivo **cartApi.js** contiene únicamente la función `addToCart`, que se conecta al mock cuando `VITE_USE_API=true`.  