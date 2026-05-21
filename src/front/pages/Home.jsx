import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [trendingGames, setTrendingGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/games/trending`);
        const data = await res.json();
        setTrendingGames(data);
      } catch (err) {
        console.log(err);
      }
    };

    loadTrending();
  }, []);

  return (
    <div className="container mt-4">

      {/* HERO */}
      <div className="text-center py-5">
        <h1 className="display-4 fw-bold">
          Tu Universo Gaming
        </h1>

        <p className="lead">
          Descubre, rastrea y califica tus videojuegos favoritos.
          Únete a una comunidad apasionada de gamers.
        </p>

        <div className="mt-4 d-flex justify-content-center gap-3">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/survey")}
          >
            Personaliza tus juegos
          </button>

          <button
            className="btn btn-outline-light btn-lg"
            onClick={() => navigate("/games")}
          >
            Explorar juegos
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div className="row text-center my-5">
        <div className="col-md-4">
          <h4>🎮 Descubre</h4>
          <p>Nuevos juegos adaptados a tus gustos.</p>
        </div>

        <div className="col-md-4">
          <h4>⭐ Califica</h4>
          <p>Guarda y vota tus juegos favoritos.</p>
        </div>

        <div className="col-md-4">
          <h4>🤖 Recomendaciones</h4>
          <p>Sistema que aprende de ti.</p>
        </div>
      </div>

      {/* TRENDING */}
      <div className="my-5">
        <h2>🔥 Tendencias</h2>

        <div className="row mt-3">
          {trendingGames.length > 0 ? (
            trendingGames.map((game) => (
              <div className="col-md-3 mb-3" key={game.id}>
                <div className="card h-100">
                  <img
                    src={game.cover_img_url}
                    className="card-img-top"
                    alt={game.title}
                  />
                  <div className="card-body">
                    <h5>{game.title}</h5>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No hay datos de tendencias aún.</p>
          )}
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="my-5">
        <h2>🎯 Recomendados para ti</h2>

        <div className="d-flex overflow-auto gap-3 mt-3">
          {recommendedGames.map((game) => (
            <div key={game.id} style={{ minWidth: "200px" }}>
              <div className="card">
                <img src={game.cover_img_url} className="card-img-top" />
                <div className="card-body">
                  <small>{game.title}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SURVEY CTA */}
      <div className="text-center my-5 p-5 rounded">
        <h2>Tu próxima obsesión gamer está aquí</h2>
        <p>Responde unas preguntas rápidas y recibe recomendaciones hechas para ti.</p>

        <button
          className="btn btn-success"
          onClick={() => navigate("/survey")}
        >
          Comenzar encuesta
        </button>
      </div>

    </div>
  );
};