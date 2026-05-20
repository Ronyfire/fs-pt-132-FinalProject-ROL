import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export const Login = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.message || "";
  // Si ya está logueado, redirige al inicio
  useEffect(() => {
    if (store.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [store.isAuthenticated, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${VITE_BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.msg || "Login failed");
        return;
      }
      const userData = { id: data.user_id, username };
      // Persiste token y usuario en sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      dispatch({
        type: "set_auth",
        payload: { token: data.token, user: userData },
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-1">Welcome Back</h1>
              <p className="text-muted text-center mb-4">
                Log in to your Game-Side account
              </p>
              <form onSubmit={handleSubmit} noValidate>
                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    {successMessage}
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>
              <p className="text-center mt-4 mb-0">
                Don't have an account?{" "}
                <Link to="/signup" className="text-decoration-none">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};