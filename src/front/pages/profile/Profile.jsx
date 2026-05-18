import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export const Profile = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Trae los datos del usuario desde el backend
  const fetchProfile = async () => {
    try {
      const resp = await fetch(`${VITE_BACKEND_URL}/api/private`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to load profile");
      const data = await resp.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/login", { replace: true });
  };
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-1">My Profile</h1>
              <p className="text-muted text-center mb-4">
                Welcome back, {store.user?.username}
              </p>
              <hr />
              <dl className="row mb-0">
                <dt className="col-sm-4">Username</dt>
                <dd className="col-sm-8">{profile?.username || store.user?.username}</dd>
                <dt className="col-sm-4">Email</dt>
                <dd className="col-sm-8">{profile?.email || "—"}</dd>
                <dt className="col-sm-4">User ID</dt>
                <dd className="col-sm-8">#{profile?.id || store.user?.id}</dd>
              </dl>
              <hr />
              <button
                className="btn btn-outline-danger w-100"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};