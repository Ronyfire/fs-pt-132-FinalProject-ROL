import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="gs-footer">
      <div className="container">
        <div className="gs-footer-main">
          <div className="gs-footer-brand">
            <Link to="/" className="gs-footer-logo">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7DD750"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="6" width="20" height="12" rx="5" />
                <path d="M6 10v4M8 12H4" />
                <circle cx="16" cy="10.5" r="0.8" fill="#7DD750" stroke="none" />
                <circle cx="18.5" cy="12.5" r="0.8" fill="#7DD750" stroke="none" />
                <circle cx="13.5" cy="12.5" r="0.8" fill="#7DD750" stroke="none" />
                <circle cx="16" cy="14.5" r="0.8" fill="#7DD750" stroke="none" />
              </svg>

              <span>Game-Side</span>
            </Link>

            <p>
              Discover, organize, rate, and share your favorite video games in a
              modern, personalized experience built for players.
            </p>

            <div className="gs-footer-tagline">
              Track. Rate. Discover.
            </div>
          </div>

          <div className="gs-footer-column">
            <h4>Explore</h4>

            <nav className="gs-footer-links">
              <Link to="/">Home</Link>
              <Link to="/games">Games</Link>
              <Link to="/survey">Survey</Link>
              <Link to="/profile">Profile</Link>
            </nav>
          </div>

          <div className="gs-footer-column">
            <h4>Community</h4>

            <nav className="gs-footer-links">
              <Link to="/tierlist">Tier List</Link>
              <Link to="/games">Trending Games</Link>
              <Link to="/survey">Recommendations</Link>
              <Link to="/profile">My Library</Link>
            </nav>
          </div>

          <div className="gs-footer-column">
            <h4>Contact</h4>

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

        <div className="gs-footer-bottom">
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