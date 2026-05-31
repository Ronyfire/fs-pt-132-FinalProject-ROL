import { Link } from "react-router-dom";
import RakkiConcerned from "../assets/img/Rakki_Concerned_Sticker.png";
import "../styles/pages/not-found.css";

const NotFound = () => {
  return (
    <main className="gs-not-found-page">
      <section className="container gs-not-found-content">
        <div className="gs-not-found-card">
          <span className="gs-not-found-kicker">
            Error 404
          </span>

          <h1>
            Rakki got lost.
          </h1>

          <p>
            Rakki looked everywhere, but couldn&apos;t find this page.
            It might have been moved, deleted, or hidden in another backlog.
          </p>

          <img
            className="gs-not-found-rakki"
            src={RakkiConcerned}
            alt="Rakki looking concerned"
          />

          <div className="gs-not-found-actions">
            <Link to="/" className="btn-gs btn-green">
              Back to Home
            </Link>

            <Link to="/games" className="btn-gs btn-green-outline">
              Explore Games
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFound;