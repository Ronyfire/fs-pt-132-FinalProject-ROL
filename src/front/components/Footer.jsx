import { Link } from "react-router-dom";

import RakkiLogoBase from "../assets/img/RakkiLogo.png";
import RakkiLogoHover from "../assets/img/RakkiLogo2.png";
import RakkiLogoClick from "../assets/img/RakkiLogoAlter.png";

export const Footer = () => {
  return (
    <footer className="gs-footer">
      <div className="container">
        <div className="gs-footer-main">
          <div className="gs-footer-brand">
            <Link to="/" className="gs-footer-logo gs-spray-pink">
              <span className="gs-footer-logo-icon-wrap">
                <img
                  src={RakkiLogoBase}
                  alt="Game-Side logo"
                  className="gs-footer-logo-icon gs-footer-logo-icon-base"
                />

                <img
                  src={RakkiLogoHover}
                  alt=""
                  className="gs-footer-logo-icon gs-footer-logo-icon-hover"
                  aria-hidden="true"
                />

                <img
                  src={RakkiLogoClick}
                  alt=""
                  className="gs-footer-logo-icon gs-footer-logo-icon-click"
                  aria-hidden="true"
                />
              </span>

              <span>Game-Side</span>
            </Link>

            <div className="gs-footer-brand-content">
              <p>
                Discover, organize, rate, and share your favorite video games in a
                modern, personalized experience built for players.
              </p>

              <div className="gs-footer-tagline">
                Track. Rate. Discover.
              </div>
            </div>
          </div>

          <div className="gs-footer-column">
            <h4 className="gs-graffiti-title">Explore</h4>

            <nav className="gs-footer-links">
              <Link to="/">Home</Link>
              <Link to="/games">Games</Link>
              <Link to="/survey">Survey</Link>
              <Link to="/profile">Profile</Link>
            </nav>
          </div>

          <div className="gs-footer-column">
            <h4 className="gs-graffiti-title">Community</h4>

            <nav className="gs-footer-links">
              <Link to="/tierlist">Tier List</Link>
              <Link to="/games">Trending Games</Link>
              <Link to="/survey">Recommendations</Link>
              <Link to="/profile">My Library</Link>
            </nav>
          </div>

          <div className="gs-footer-column">
            <h4 className="gs-graffiti-title">Contact</h4>

            <div className="gs-footer-contact">
              <a href="mailto:contact@game-side.org">
                contact@game-side.org
              </a>

              <a href="https://github.com" target="_blank" rel="noreferrer">
                GitHub
              </a>

              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="gs-footer-bottom gs-spray-dots">
          <small>
            © {new Date().getFullYear()} Game-Side. All rights reserved.
          </small>

          <small>
            Game data powered by <span>IGDB API</span>.
          </small>
        </div>
      </div>
    </footer>
  );
};