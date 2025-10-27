import { useEffect, useState } from "react";
import { getCart } from "@api/cartApi";

const Cart = () => {
  const [cartList, setCartList] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCartList(data);
      } catch (error) {
        console.error("Error al obtener el carrito:", error);
      }
    };
    fetchCart();
  }, []);

  if (!cartList.length) return <p>No hay productos en el carrito.</p>;

  return (
    <main className="container section">
      <h2>Carrito</h2>
      {cartList.map((prod, i) => (
        <div key={i} className="cart-item">
          <p>{prod.nombre}</p>
          <p>USD {prod.unitPrice}</p>
        </div>
      ))}
    </main>
  );
};

export default Cart;
