import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Game } from "./pages/Game";
import { Survey } from "./pages/Survey";
import { Profile } from "./pages/Profile";
import { RequireAuth } from "./components/RequireAuth";
import { Games } from "./pages/Games";
import { AdminPanel } from "./pages/AdminPanel";
import { TierList } from "./pages/TierList";
import { Rakki } from "./pages/Rakki";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:gameId" element={<Game />} />
            <Route path="/tierlist" element={<TierList />} />

            {/* Rutas protegidas */}
            <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/survey" element={<Survey />} />
                <Route path="/rakki" element={<Rakki />} />
                
            {/* Ruta Admin - Solo para administradores */}
                <Route path="/admin" element={<AdminPanel />} />
            </Route>
        </Route>
    )
);
