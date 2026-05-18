import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
// Protege rutas: si no está autenticado, redirige al login
export const RequireAuth = () => {
  const { store } = useGlobalReducer();
  if (!store.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};