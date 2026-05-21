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

        setTrendingGames(data.slice(0, 4));
        setRecommendedGames(data.slice(4, 10));
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
    <div className="container mt-4">

      {/* HERO */}
      <div className="text-center py-5">
        <h1 className="display-4 fw-bold">
          Your Gaming Universe
        </h1>

        <p className="lead">
          Discover, track, and rate your favorite video games.
          Join a passionate community of gamers.
        </p>

        <div className="mt-4 d-flex justify-content-center gap-3">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/survey")}
          >
            Personalize Your Games
          </button>

          <button
            className="btn btn-outline-primary btn-lg"
            onClick={() => navigate("/games")}
          >
            Explore Games
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div className="row text-center my-5">
        <div className="col-md-4">
          <h4>🎮 Discover</h4>
          <p>Find new games based on your tastes.</p>
        </div>

        <div className="col-md-4">
          <h4>⭐ Rate</h4>
          <p>Save and rate your favorite games.</p>
        </div>

        <div className="col-md-4">
          <h4>🤖 Recommendations</h4>
          <p>A system that learns from you.</p>
        </div>
      </div>

      {loading && (
        <div className="text-center my-5">
          <p>Loading games...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* TRENDING */}
          <div className="my-5">
            <div className="d-flex justify-content-between align-items-center">
              <h2>🔥 Trending</h2>

              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate("/games")}
              >
                View All
              </button>
            </div>

            <div className="row mt-3">
              {trendingGames.length > 0 ? (
                trendingGames.map((game) => (
                  <div className="col-md-3 mb-3" key={game.id}>
                    <GameCard game={game} />
                  </div>
                ))
              ) : (
                <p>No trending games available yet.</p>
              )}
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className="my-5">
            <div className="d-flex justify-content-between align-items-center">
              <h2>🎯 Recommended for You</h2>

              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate("/games")}
              >
                Explore More
              </button>
            </div>

            <div className="row mt-3">
              {recommendedGames.length > 0 ? (
                recommendedGames.map((game) => (
                  <div className="col-md-3 mb-3" key={game.id}>
                    <GameCard game={game} />
                  </div>
                ))
              ) : (
                <p>
                  Complete the survey to improve your recommendations.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* SURVEY CTA */}
      <div className="text-center my-5 p-5 rounded border">
        <h2>Your Next Gaming Obsession Starts Here</h2>

        <p>
          Answer a few quick questions and get recommendations made for you.
        </p>

        <button
          className="btn btn-success"
          onClick={() => navigate("/survey")}
        >
          Start Survey
        </button>
      </div>

    </div>
  );
};