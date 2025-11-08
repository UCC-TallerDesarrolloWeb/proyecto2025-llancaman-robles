import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handlerLogin = (e) => {
    e.preventDefault();
    if (usuario === "admin" && password === "admin") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/catalogo");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <main className="container section">
      <section className="card">
        <h1>Iniciar Sesión</h1>

        <form className="form-grid" onSubmit={handlerLogin}>
          <div className="form-control">
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              name="username"
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="current-password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

        <div className="form-control" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="btn is-primary">
              Ingresar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Login;
