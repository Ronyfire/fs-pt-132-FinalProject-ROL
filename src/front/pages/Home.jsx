import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GameCard from "../components/GameCard.jsx";
import RakkiPlaying from "../assets/img/RakkiPlaying.png";


export const Home = () => {
  const navigate = useNavigate();

  const [trendingGames, setTrendingGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const recommendedCarouselRef = useRef(null);

  const scrollRecommended = (direction) => {
    if (!recommendedCarouselRef.current) return;

    recommendedCarouselRef.current.scrollBy({
      left: direction === "left" ? -450 : 450,
      behavior: "smooth"
    });
  };

  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0
  });

  const handleDragStart = (event) => {
    const carousel = recommendedCarouselRef.current;
    if (!carousel) return;

    dragState.current.isDown = true;
    dragState.current.startX = event.pageX - carousel.offsetLeft;
    dragState.current.scrollLeft = carousel.scrollLeft;
  };

  const handleDragMove = (event) => {
    const carousel = recommendedCarouselRef.current;
    if (!carousel || !dragState.current.isDown) return;

    event.preventDefault();

    const x = event.pageX - carousel.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.4;

    carousel.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleDragEnd = () => {
    dragState.current.isDown = false;
  };

  useEffect(() => {
    const loadHomeGames = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const [trendingResponse, recommendationsResponse] = await Promise.all([
          fetch(`${backendUrl}/api/games/trending`),
          fetch(`${backendUrl}/api/games/recommendations`, {
            headers
          })
        ]);

        const trendingData = await trendingResponse.json();
        const recommendationsData = await recommendationsResponse.json();

        if (!trendingResponse.ok) {
          throw new Error(trendingData.msg || "Could not load trending games");
        }

        if (!recommendationsResponse.ok) {
          throw new Error(recommendationsData.msg || "Could not load recommendations");
        }

        setTrendingGames(trendingData.slice(0, 3));
        setRecommendedGames(recommendationsData.slice(0, 10));
      } catch (error) {
        console.log(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeGames();
  }, [backendUrl]);

  return (
    <main className="gs-home gs-page-bg gs-punk-noise">
      <div className="gs-page-content">
        {/* HERO */}
        <section className="gs-home-hero">
          <Link
            to="/rakki"
            className="gs-rakki-easter-egg"
            aria-label="Find Rakki"
          >
            ✦
            <span>Rakki?</span>
          </Link>

          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-7 text-center text-lg-start">
                <span className="gs-home-eyebrow">
                  Track. Rate. Discover.
                </span>

                <h1 className="gs-home-hero-title gs-spray-pink">
                  Your Gaming Universe
                  <span> Starts Here</span>
                </h1>

                <p className="gs-home-hero-text gs-spray-pink">
                  Discover new games, organize your library, rate your favorites,
                  and get recommendations shaped around the way you actually play.
                </p>

                <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center justify-content-lg-start">
                  <button
                    className="btn-gs btn-green gs-home-main-btn"
                    onClick={() => navigate("/survey")}
                  >
                    Personalize My Games
                  </button>

                  <button
                    className="btn-gs btn-green-outline gs-home-main-btn"
                    onClick={() => navigate("/games")}
                  >
                    Explore Games
                  </button>
                </div>

                <div className="gs-home-stats gs-spray-pink">
                  <div>
                    <strong>1000+</strong>
                    <span>Games to explore</span>
                  </div>

                  <div>
                    <strong>Tier Lists</strong>
                    <span>Community rankings</span>
                  </div>

                  <div>
                    <strong>Smart Picks</strong>
                    <span>Based on your taste</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="gs-home-hero-panel">
                  <div className="gs-home-orbit gs-home-orbit-one"></div>
                  <div className="gs-home-orbit gs-home-orbit-two"></div>

                  <div className="gs-home-floating-card card-one">
                    <span>🔥 Trending</span>
                    <strong>What everyone is playing</strong>
                  </div>

                  <div className="gs-home-floating-card card-two">
                    <span>⭐ Rating</span>
                    <strong>Build your own taste profile</strong>
                  </div>

                  <div className="gs-rakki-image-box">
                    <img src={RakkiPlaying} alt="Rakki, Game-Side mascot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="container gs-home-section gs-spray-pink ">
          <div className="text-center mb-4">
            <span className="gs-home-eyebrow">What can you do?</span>

            <h2 className="gs-home-section-title text-pink">
              Your Game-Side Experience
            </h2>

            <p className="gs-home-section-subtitle mx-auto">
              Everything you need to turn your backlog, ratings, and discoveries
              into one personalized gaming hub.
            </p>
          </div>

          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <article className="gs-feature-card">
                <div className="gs-feature-img gs-rakki-mood-card">
                  <span>Games Page Preview</span>
                </div>

                <div className="gs-feature-content">
                  <span className="gs-feature-number">01</span>
                  <h4>Discover</h4>
                  <p>
                    Browse thousands of games, search by title, and find your next
                    favorite adventure.
                  </p>
                </div>
              </article>
            </div>

            <div className="col-md-4">
              <article className="gs-feature-card">
                <div className="gs-feature-img gs-rakki-mood-card">
                  <span>Profile Page Preview</span>
                </div>

                <div className="gs-feature-content">
                  <span className="gs-feature-number">02</span>
                  <h4>Organize</h4>
                  <p>
                    Build your personal library with games you want to play, are
                    playing, completed, or dropped.
                  </p>
                </div>
              </article>
            </div>

            <div className="col-md-4">
              <article className="gs-feature-card">
                <div className="gs-feature-img gs-rakki-mood-card">
                  <span>Tier List Preview</span>
                </div>

                <div className="gs-feature-content">
                  <span className="gs-feature-number">03</span>
                  <h4>Rank</h4>
                  <p>
                    Rate games, compare community scores, and explore tier lists
                    built by players.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {loading && (
          <div className="container text-center my-5">
            <div className="gs-home-loading">
              Loading games...
            </div>
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
            <section className="container gs-home-section gs-spray-dots">
              <div className="gs-section-header">
                <div>
                  <span className="gs-home-eyebrow">Hot right now</span>

                  <h2 className="gs-home-section-title text-green mb-0">
                    <span className="gs-graffiti-title">Trending Now</span>
                  </h2>
                </div>

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
            <section className="container gs-home-section gs-spray-pink">
              <div className="gs-section-header">
                <div>
                  <span className="gs-home-eyebrow">Picked for your next session</span>

                  <h2 className="gs-home-section-title text-green mb-0">
                    <span className="gs-graffiti-title">Recommended for You</span>
                    <span className="gs-rakki-tag">
                      Rakki picked this
                    </span>
                  </h2>
                </div>

                <button
                  className="btn-gs btn-ghost"
                  onClick={() => navigate("/games")}
                >
                  Explore More
                </button>
              </div>

              <div className="gs-carousel-shell">
                <button
                  type="button"
                  className="gs-carousel-arrow gs-carousel-arrow-left"
                  onClick={() => scrollRecommended("left")}
                  aria-label="Scroll recommendations left"
                >
                  ‹
                </button>

                <div
                  className="gs-home-carousel gs-home-carousel-draggable"
                  ref={recommendedCarouselRef}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
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

                <button
                  type="button"
                  className="gs-carousel-arrow gs-carousel-arrow-right"
                  onClick={() => scrollRecommended("right")}
                  aria-label="Scroll recommendations right"
                >
                  ›
                </button>
              </div>
            </section>
          </>
        )}

        {/* SURVEY CTA */}
        <section className="container gs-home-section pb-5 gs-spray-pink">
          <div className="gs-survey-cta">
            <div className="gs-survey-copy">
              <span className="gs-home-eyebrow">Personalized recommendations</span><span className="gs-rakki-tag">
                Rakki loved this
              </span>

              <h2>
                Your Next Gaming Obsession Starts Here
              </h2>

              <p className="gs-survey-intro">
                Answer a few quick questions and get recommendations made for
                your taste, platforms, genres, and play style.
              </p>

              <div className="gs-survey-benefit">
                <h5>Personalized</h5>
                <p>
                  Get recommendations based on your favorite genres, play style,
                  and real preferences.
                </p>
              </div>

              <div className="gs-survey-benefit">
                <h5>Save Time</h5>
                <p>
                  Stop spending hours wondering what to play and find games that
                  actually match your taste.
                </p>
              </div>

              <div className="gs-survey-benefit">
                <h5>Discover More</h5>
                <p>
                  Explore new releases, hidden gems, and experiences you might
                  never have found on your own.
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
              <div className="gs-survey-preview-card">
                <span>Question 01</span>
                <strong>What kind of worlds do you enjoy?</strong>

                <div className="gs-survey-pill-row">
                  <span>Fantasy</span>
                  <span>Sci-Fi</span>
                  <span>Horror</span>
                </div>
              </div>

              <div className="gs-survey-preview-card secondary">
                <span>Smart Match</span>
                <strong>Recommendations update with your answers.</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};