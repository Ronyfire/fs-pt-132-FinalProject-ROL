import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameCard from "../components/GameCard.jsx";

export const Home = () => {
  const navigate = useNavigate();

  const [trendingGames, setTrendingGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const loadHomeGames = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/games`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || "Could not load games");
        }

        setTrendingGames(data.slice(0, 3));
        setRecommendedGames(data.slice(3, 11));
      } catch (error) {
        console.log(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeGames();
  }, []);

  return (
    <main className="gs-home">
      {/* HERO */}
      <section className="gs-home-hero text-center">
        <div className="container">
          <h1 className="gs-hero-title mb-3">Your Gaming Universe</h1>

          <p className="gs-home-hero-text mx-auto">
            Discover, track, and rate your favorite video games.
            Join a passionate community of gamers.
          </p>

          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <button
              className="btn-gs btn-green"
              onClick={() => navigate("/survey")}
            >
              Get Started &gt;
            </button>

            <button
              className="btn-gs btn-green-outline"
              onClick={() => navigate("/games")}
            >
              Explore Games
            </button>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="container gs-home-section">
        <h2 className="gs-home-section-title text-center text-pink">
          Your Game-Side Experience
        </h2>

        <div className="row g-4 mt-3">
          <div className="col-md-4">
            <article className="gs-feature-card">
              <div className="gs-feature-img">
                <span>Games Page Image</span>
              </div>

              <h4 className="text-green">Discover</h4>

              <p>
                Browse thousands of games, search by title, and find your next favorite adventure.
              </p>
            </article>
          </div>

          <div className="col-md-4">
            <article className="gs-feature-card">
              <div className="gs-feature-img">
                <span>Profile Page Image</span>
              </div>

              <h4 className="text-green">Organize</h4>

              <p>
                Build your personal library with games you want to play, are playing, completed, or dropped.
              </p>
            </article>
          </div>

          <div className="col-md-4">
            <article className="gs-feature-card">
              <div className="gs-feature-img">
                <span>Tier List Image</span>
              </div>

              <h4 className="text-green">Rank</h4>

              <p>
                Rate games, compare community scores, and explore tier lists built by players.
              </p>
            </article>
          </div>
        </div>
      </section>

      {loading && (
        <div className="container text-center my-5">
          <p className="text-dim">Loading games...</p>
        </div>
      )}

      {error && (
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* TRENDING */}
          <section className="container gs-home-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="gs-home-section-title text-green mb-0">
                Trending Now
              </h2>

              <button
                className="btn-gs btn-ghost"
                onClick={() => navigate("/games")}
              >
                View All
              </button>
            </div>

            <div className="row g-4">
              {trendingGames.length > 0 ? (
                trendingGames.map((game) => (
                  <div className="col-md-4" key={game.id}>
                    <GameCard game={game} />
                  </div>
                ))
              ) : (
                <p className="text-dim">No trending games available yet.</p>
              )}
            </div>
          </section>

          {/* RECOMMENDATIONS */}
          <section className="container gs-home-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="gs-home-section-title text-green mb-0">
                Recommended for You
              </h2>

              <button
                className="btn-gs btn-ghost"
                onClick={() => navigate("/games")}
              >
                Explore More
              </button>
            </div>

            <div className="gs-home-carousel">
              {recommendedGames.length > 0 ? (
                recommendedGames.map((game) => (
                  <div className="gs-home-carousel-item" key={game.id}>
                    <GameCard game={game} />
                  </div>
                ))
              ) : (
                <p className="text-dim">
                  Complete the survey to improve your recommendations.
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* SURVEY CTA */}
      <section className="container gs-home-section pb-5">
        <div className="gs-survey-cta">
          <div>
            <h2 className="text-green">
              Your Next Gaming Obsession Starts Here
            </h2>

            <p className="text-dim mb-4">
              Answer a few quick questions and get recommendations made for you.
            </p>

            <div className="gs-survey-benefit">
              <h5 className="text-pink">Personalized</h5>
              <p>
                Get recommendations based on your favorite genres, play style, and real preferences.
              </p>
            </div>

            <div className="gs-survey-benefit">
              <h5 className="text-pink">Save Time</h5>
              <p>
                Stop spending hours wondering what to play and find games that actually match your taste.
              </p>
            </div>

            <div className="gs-survey-benefit">
              <h5 className="text-pink">Discover More</h5>
              <p>
                Explore new releases, hidden gems, and experiences you might never have found on your own.
              </p>
            </div>

            <button
              className="btn-gs btn-green mt-3"
              onClick={() => navigate("/survey")}
            >
              Start Survey
            </button>
          </div>

          <div className="gs-survey-preview">
            <span>Survey Image</span>
          </div>
        </div>
      </section>
    </main>
  );
};