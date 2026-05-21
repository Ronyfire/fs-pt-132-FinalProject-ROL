import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Profile } from "./pages/Profile";
import { RequireAuth } from "./components/RequireAuth";
import { Games } from "./pages/Games"
export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Rutas protegidas — RequireAuth envuelve a Profile */}
            <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/games" element={<Games />} />
        </Route>
    )
);