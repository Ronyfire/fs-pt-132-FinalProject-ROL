import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toaster } from "react-hot-toast";

// Base component that keeps the navbar and footer across the app.
export const Layout = () => {
    return (
        <ScrollToTop>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />

                <main className="flex-grow-1">
                    <Outlet />
                    <Toaster
                        position="bottom-right"
                        toastOptions={{ duration: 3000 }}
                    />
                </main>

                <Footer />
            </div>
        </ScrollToTop>
    );
};