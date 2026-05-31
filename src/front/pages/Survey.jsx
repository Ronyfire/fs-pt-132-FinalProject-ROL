import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RakkiSurvey from "../assets/img/RakkiSurvey.png";

export const Survey = () => {
  const navigate = useNavigate();

  // Estado del formulario: géneros, plataformas, estilo y temas favoritos
  const [form, setForm] = useState({
    genres: [],
    platforms: [],
    play_style: "casual",
    favorite_themes: []
  });

  // Estado para mensajes de éxito/error y carga
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Opciones disponibles para cada sección del survey
  const genreOptions = [
    "Action",
    "Adventure",
    "RPG",
    "Strategy",
    "Simulation",
    "Sports",
    "Racing",
    "Shooter",
    "Puzzle",
    "Horror",
    "Platformer",
    "Fighting",
    "Roguelike",
    "Survival"
  ];

  const platformOptions = [
    "PC",
    "PS5",
    "PS4",
    "Xbox Series X/S",
    "Xbox One",
    "Nintendo Switch",
    "Mobile"
  ];

  const themeOptions = [
    "Fantasy",
    "Sci-fi",
    "Cyberpunk",
    "Post-apocalyptic",
    "Medieval",
    "Modern",
    "Horror",
    "Mystery",
    "Anime",
    "War",
    "Open World",
    "Cozy",
    "Dark Fantasy",
    "Comedy"
  ];

  const playStyleOptions = [
    {
      value: "casual",
      title: "Casual",
      description: "Relaxed sessions and easy-to-pick-up games."
    },
    {
      value: "competitive",
      title: "Competitive",
      description: "Ranked matches, skill expression, and challenge."
    },
    {
      value: "completionist",
      title: "Completionist",
      description: "Achievements, collectibles, and 100% runs."
    },
    {
      value: "story",
      title: "Story-focused",
      description: "Narrative, characters, and emotional journeys."
    },
    {
      value: "exploration",
      title: "Exploration",
      description: "Open worlds, secrets, and discovery."
    },
    {
      value: "social",
      title: "Social / Multiplayer",
      description: "Co-op, party games, and shared experiences."
    }
  ];

  // Agrega o quita un valor del array correspondiente en el formulario
  const toggleArrayValue = (field, value) => {
    setForm((currentForm) => {
      const alreadySelected = currentForm[field].includes(value);

      return {
        ...currentForm,
        [field]: alreadySelected
          ? currentForm[field].filter((item) => item !== value)
          : [...currentForm[field], value]
      };
    });
  };

  // Cambia el estilo de juego seleccionado (solo uno a la vez)
  const handlePlayStyleChange = (value) => {
    setForm({
      ...form,
      play_style: value
    });
  };

  // Valida que todas las secciones tengan al menos una opción seleccionada
  const validateSurvey = () => {
    if (form.genres.length === 0) {
      return "Please select at least one genre.";
    }

    if (form.platforms.length === 0) {
      return "Please select at least one platform.";
    }

    if (form.favorite_themes.length === 0) {
      return "Please select at least one theme.";
    }

    return "";
  };

  // Envía el survey al backend y redirige al perfil si es exitoso
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const validationError = validateSurvey();

    if (validationError) {
      setMessageType("error");
      setMessage(validationError);
      return;
    }

    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(`${backendUrl}/api/users/survey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          genres: form.genres,
          platforms: form.platforms,
          play_style: form.play_style,
          favorite_themes: form.favorite_themes,
          completed_at: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Could not save survey");
      }

      setMessageType("success");
      setMessage("Survey successfully saved. Your recommendations are getting smarter.");

      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza un grupo de botones tipo pill para opciones múltiples
  const renderPillGroup = (options, field) => {
    return (
      <div className="gs-survey-pill-grid">
        {options.map((option) => {
          const selected = form[field].includes(option);

          return (
            <button
              type="button"
              key={option}
              className={`gs-survey-pill ${selected ? "selected" : ""}`}
              onClick={() => toggleArrayValue(field, option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  };

  // Total de opciones seleccionadas para la barra de progreso
  const selectedCount =
    form.genres.length + form.platforms.length + form.favorite_themes.length;

  return (
    <main className="gs-survey-page">
      <section className="container gs-survey-layout">
        {/* Columna principal: formulario */}
        <div className="gs-survey-main">
          <span className="gs-home-eyebrow">Personalized recommendations</span>

          <h1 className="gs-survey-title">
            Build Your Gaming Taste Profile
          </h1>

          <p className="gs-survey-subtitle">
            Tell Game-Side what you enjoy, where you play, and what kind of
            experiences pull you in. Your answers will help shape smarter game
            recommendations.
          </p>

          {/* Mensaje de éxito o error después de enviar */}
          {message && (
            <div className={`gs-survey-message ${messageType}`}>
              {messageType === "success" && (
                <div className="gs-feature-img gs-rakki-mood-card">
                  <span>Succes</span>
                </div>
              )}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="gs-survey-form">
            {/* Paso 1: Géneros favoritos */}
            <section className="gs-survey-block">
              <div className="gs-survey-block-header">
                <span>01</span>
                <div>
                  <h2>Favorite Genres</h2>
                  <p>Choose the genres you usually enjoy the most.</p>
                </div>
              </div>

              {renderPillGroup(genreOptions, "genres")}
            </section>

            {/* Paso 2: Plataformas */}
            <section className="gs-survey-block">
              <div className="gs-survey-block-header">
                <span>02</span>
                <div>
                  <h2>Platforms</h2>
                  <p>Select where you usually play your games.</p>
                </div>
              </div>

              {renderPillGroup(platformOptions, "platforms")}
            </section>

            {/* Paso 3: Estilo de juego */}
            <section className="gs-survey-block">
              <div className="gs-survey-block-header">
                <span>03</span>
                <div>
                  <h2>Play Style</h2>
                  <p>Pick the style that best describes how you usually play.</p>
                </div>
              </div>

              <div className="gs-playstyle-grid">
                {playStyleOptions.map((style) => (
                  <button
                    type="button"
                    key={style.value}
                    className={`gs-playstyle-card ${form.play_style === style.value ? "selected" : ""
                      }`}
                    onClick={() => handlePlayStyleChange(style.value)}
                  >
                    <strong>{style.title}</strong>
                    <span>{style.description}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Paso 4: Temas favoritos */}
            <section className="gs-survey-block">
              <div className="gs-survey-block-header">
                <span>04</span>
                <div>
                  <h2>Favorite Themes</h2>
                  <p>Choose the worlds, moods, or vibes you like most.</p>
                </div>
              </div>

              {renderPillGroup(themeOptions, "favorite_themes")}
            </section>

            {/* Botones de navegación */}
            <div className="gs-survey-actions">
              <button
                type="button"
                className="btn-gs btn-ghost"
                onClick={() => navigate("/")}
              >
                Back Home
              </button>

              <button
                type="submit"
                className="btn-gs btn-green"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Survey"}
              </button>
            </div>
          </form>
        </div>

        {/* Barra lateral: resumen del perfil y mascota */}
        <aside className="gs-survey-side">
          <div className="gs-survey-side-card">
            <span className="gs-survey-side-label">Taste Profile</span>

            <h3>Your Smart Match</h3>

            <p>
              The more specific your choices are, the better Game-Side can
              recommend games that match your actual mood and habits.
            </p>

            {/* Barra de progreso según opciones seleccionadas */}
            <div className="gs-survey-progress">
              <div className="gs-survey-progress-info">
                <span>Profile data</span>
                <strong>{selectedCount} picks</strong>
              </div>

              <div className="gs-survey-progress-bar">
                <div
                  style={{
                    width: `${Math.min(selectedCount * 8, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Resumen de selecciones por categoría */}
            <div className="gs-survey-summary">
              <div>
                <span>Genres</span>
                <strong>{form.genres.length}</strong>
              </div>

              <div>
                <span>Platforms</span>
                <strong>{form.platforms.length}</strong>
              </div>

              <div>
                <span>Themes</span>
                <strong>{form.favorite_themes.length}</strong>
              </div>
            </div>

            {/* Mascota Rakki con tablet mientras se completa el perfil */}
            <div className="gs-survey-mascot-box">
              <img
                src={RakkiSurvey}
                alt="Rakki building your taste profile"
                className="gs-survey-rakki-img"
              />

              <span className="gs-survey-mascot-caption">
                Building your taste profile...
              </span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};
