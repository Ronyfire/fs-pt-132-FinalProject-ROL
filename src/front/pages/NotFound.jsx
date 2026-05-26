import { Link } from "react-router-dom";
import Rakki from "../components/Rakki";

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center px-3">
      <Rakki pose="scared" size="xl" text="404 — Page not found" />
      <p className="text-muted mt-2" style={{ maxWidth: 360, fontSize: "0.95rem" }}>
        Rakki looked everywhere but couldn't find this page. It might have been moved or doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary mt-3">
        Back to home
      </Link>
    </div>
  );
};

export default NotFound;
