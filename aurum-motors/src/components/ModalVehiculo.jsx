import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

const CUSTOM_STORAGE = "aurum_customizations";
const SELECTED_ID = "aurum_selected_vehicle_id";

// Valores iniciales por defecto
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

  // Evita scroll de fondo mientras está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  if (!vehiculo) return null;

  const elegirVehiculo = () => {
    // 1) Agregar al carrito
    addItem({
      id: vehiculo.id,
      title: `${vehiculo.marca} ${vehiculo.modelo}`,
      price: vehiculo.precio,
      qty: 1,
    });

    // 2) Crear personalización inicial si no existe
    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE);
      const map = raw ? JSON.parse(raw) : {};
      if (!map[vehiculo.id]) {
        map[vehiculo.id] = { ...DEFAULT_CUSTOM };
        localStorage.setItem(CUSTOM_STORAGE, JSON.stringify(map));
      }
    } catch (e) {
      console.error("Error guardando personalización inicial:", e);
    }

    // 3) Guardar seleccionado y navegar
    try {
      localStorage.setItem(SELECTED_ID, vehiculo.id);
    } catch (e) {
      console.error("Error guardando vehículo seleccionado:", e);
    }

    navigate("/personalizar");
  };

  return (
    <>
      <div className="modal-backdrop is-open" onClick={onClose}></div>
      <section
        className="modal is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="veh-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="modal-body">
          <figure className="modal-media">
            <img src={vehiculo.imagen} alt={vehiculo.modelo} />
          </figure>

          <div className="modal-content">
            <h3 id="veh-title">
              {vehiculo.marca} {vehiculo.modelo}
            </h3>
            <p className="meta">{vehiculo.meta}</p>
            <p className="muted">
              Este modelo acepta personalización y agregados opcionales.
            </p>
            <strong className="price">
              USD {vehiculo.precio.toLocaleString()}
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
