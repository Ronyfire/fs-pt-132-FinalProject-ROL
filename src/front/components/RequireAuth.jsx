import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const RequireAuth = () => {
  const { store } = useGlobalReducer();
  if (!store.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};