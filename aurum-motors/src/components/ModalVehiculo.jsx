// ModalVehiculo.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@components/CartContext";

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
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // bloquear scroll al abrir (si hay vehiculo)
  useEffect(() => {
    if (!vehiculo) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [vehiculo]);

  if (!vehiculo) return null;

  const { id, marca, modelo, precio, title: t } = vehiculo;
  const title =
    (t || [marca, modelo].filter(Boolean).join(" ")).trim() || "Vehículo";
  const priceNumber = Number(precio ?? 0);

  const elegirVehiculo = () => {
    addItem({ id, title, price: priceNumber, qty: 1 });

    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE);
      const map = raw ? JSON.parse(raw) : {};
      if (!map[id]) map[id] = { ...DEFAULT_CUSTOM };
      localStorage.setItem(CUSTOM_STORAGE, JSON.stringify(map));
      localStorage.setItem(SELECTED_ID, String(id));
    } catch (e) {
      console.error("Error guardando selección/personalización:", e);
    }

    onClose?.();
    navigate("/personalizar");
  };

  return (
    <>
      <div className="modal-backdrop is-open" />

      <section
        className="modal is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="veh-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className="modal-body" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>

          <figure className="modal-media">
            {vehiculo?.imagen && (
              <img src={vehiculo.imagen} alt={vehiculo.modelo} />
            )}
          </figure>

          <div className="modal-content">
            <h3 id="veh-title">
              {vehiculo?.marca} {vehiculo?.modelo}
            </h3>
            {vehiculo?.meta && <p className="meta">{vehiculo.meta}</p>}
            <p className="muted">
              Este modelo acepta personalización y agregados opcionales.
            </p>
            <strong className="price">
              USD {vehiculo?.precio?.toLocaleString("es-AR")}
            </strong>
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
