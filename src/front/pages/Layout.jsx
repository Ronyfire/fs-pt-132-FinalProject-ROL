import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

// Base component that keeps the navbar and footer across the app.
export const Layout = () => {
    return (
        <ScrollToTop>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />

                <main className="flex-grow-1">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </ScrollToTop>
    );
};