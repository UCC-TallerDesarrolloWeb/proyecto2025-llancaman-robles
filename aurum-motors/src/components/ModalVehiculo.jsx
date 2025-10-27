import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

const CUSTOM_STORAGE = "aurum_customizations";
const SELECTED_ID = "aurum_selected_vehicle_id";

const DEFAULT_CUSTOM = {
  color: "Negro",
  paquete: "Base",
  llantas: "18”",
  garantia: "Fábrica (2 años)",
  accesorios: [],
};

const ModalVehiculo = ({ vehiculo, onClose }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  if (!vehiculo) return null;

  const { id, marca, modelo, precio, imagen, meta } = vehiculo;
  const title = `${marca} ${modelo}`;

  const elegirVehiculo = () => {
    addItem({ id, title, price: precio, qty: 1 });

    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE);
      const map = raw ? JSON.parse(raw) : {};
      if (!map[id]) map[id] = { ...DEFAULT_CUSTOM };
      localStorage.setItem(CUSTOM_STORAGE, JSON.stringify(map));
      localStorage.setItem(SELECTED_ID, id);
    } catch (e) {
      console.error("Error guardando selección/personalización:", e);
    }

    navigate("/personalizar");
  };

  return (
    <>
      <div className="modal-backdrop is-open" onClick={onClose}></div>
      <section className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="veh-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="modal-body">
          <figure className="modal-media">
            <img src={imagen} alt={modelo} />
          </figure>

          <div className="modal-content">
            <h3 id="veh-title">{title}</h3>
            <p className="meta">{meta}</p>
            <p className="muted">Este modelo acepta personalización y agregados opcionales.</p>
            <strong className="price">USD {precio.toLocaleString()}</strong>

            <div className="modal-actions">
              <button className="btn is-primary" onClick={elegirVehiculo}>
                Elegir este auto
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ModalVehiculo;
