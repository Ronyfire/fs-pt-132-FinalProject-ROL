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
          <h1 className="gs-hero-title mb-3">Tu Universo Gaming</h1>

          <p className="gs-home-hero-text mx-auto">
            Descubre, rastrea y califica tus videojuegos favoritos.
            Únete a una comunidad apasionada de gamers.
          </p>

          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <button
              className="btn-gs btn-green"
              onClick={() => navigate("/survey")}
            >
              Comenzar ahora &gt;
            </button>

            <button
              className="btn-gs btn-green-outline"
              onClick={() => navigate("/games")}
            >
              Explorar juegos
            </button>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="container gs-home-section">
        <h2 className="gs-home-section-title text-center text-pink">
          Tu experiencia Game-Side
        </h2>

        <div className="row g-4 mt-3">
          <div className="col-md-4">
            <article className="gs-feature-card">
              <div className="gs-feature-img">
                <span>Imagen Games</span>
              </div>
              <h4 className="text-green">Descubre</h4>
              <p>Miles de juegos para explorar, buscar y conocer.</p>
            </article>
          </div>

          <div className="col-md-4">
            <article className="gs-feature-card">
              <div className="gs-feature-img">
                <span>Imagen Profile</span>
              </div>
              <h4 className="text-green">Organiza</h4>
              <p>Tu biblioteca personalizada con juegos pendientes, completados y favoritos.</p>
            </article>
          </div>

          <div className="col-md-4">
            <article className="gs-feature-card">
              <div className="gs-feature-img">
                <span>Imagen Tier List</span>
              </div>
              <h4 className="text-green">Compara</h4>
              <p>Crea y consulta tier lists con valoraciones de la comunidad.</p>
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
                Tendencias Ahora
              </h2>

              <button
                className="btn-gs btn-ghost"
                onClick={() => navigate("/games")}
              >
                Ver todos
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
                <p className="text-dim">No hay tendencias todavía.</p>
              )}
            </div>
          </section>

          {/* RECOMMENDATIONS */}
          <section className="container gs-home-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="gs-home-section-title text-green mb-0">
                Recomendaciones para ti
              </h2>

              <button
                className="btn-gs btn-ghost"
                onClick={() => navigate("/games")}
              >
                Explorar más
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
                  Completa la encuesta para mejorar tus recomendaciones.
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
              Tu próxima obsesión gamer está aquí
            </h2>

            <p className="text-dim mb-4">
              Responde unas preguntas rápidas y recibe recomendaciones hechas para ti.
            </p>

            <div className="gs-survey-benefit">
              <h5 className="text-pink">Personalizado</h5>
              <p>Recibe recomendaciones basadas en tus géneros, estilo de juego y preferencias reales.</p>
            </div>

            <div className="gs-survey-benefit">
              <h5 className="text-pink">Ahorra tiempo</h5>
              <p>Deja de perder horas buscando qué jugar y encuentra títulos que encajen contigo.</p>
            </div>

            <div className="gs-survey-benefit">
              <h5 className="text-pink">Descubre</h5>
              <p>Explora juegos nuevos, joyas ocultas y experiencias que probablemente nunca habrías encontrado.</p>
            </div>

            <button
              className="btn-gs btn-green mt-3"
              onClick={() => navigate("/survey")}
            >
              Comenzar encuesta
            </button>
          </div>

          <div className="gs-survey-preview">
            <span>Imagen Survey</span>
          </div>
        </div>
      </section>
    </main>
  );
};