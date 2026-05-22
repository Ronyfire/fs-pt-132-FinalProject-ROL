import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand mb-0 h1">
          Game-Side
        </Link>
        <div className="d-flex align-items-center gap-2">
          {store.isAuthenticated ? (
            <>
              <span className="navbar-text me-2">{store.user?.username}</span>

              {/* Botón Admin — solo visible si el usuario es admin */}
              {store.user?.is_admin && (
                <Link to="/admin" className="btn btn-warning btn-sm fw-bold">
                  ⚙ Admin
                </Link>
              )}

              <Link to="/profile" className="btn btn-outline-primary btn-sm">
                Profile
              </Link>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
