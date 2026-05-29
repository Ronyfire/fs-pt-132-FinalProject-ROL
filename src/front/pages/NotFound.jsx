import { Link } from "react-router-dom";
import RakkiTest from "../assets/img/RakkiTEST.png";

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center px-3">
      <div className="gs-rakki-image-box">
        <img src={RakkiTest} alt="Rakki, Game-Side mascot" />
      </div>
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
