import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Survey = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    genres: [],
    platforms: [],
    play_style: "casual",
    favorite_themes: []
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

  const handlePlayStyleChange = (event) => {
    setForm({
      ...form,
      play_style: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (form.genres.length === 0) {
      setMessage("Please select at least one genre.");
      return;
    }

    if (form.platforms.length === 0) {
      setMessage("Please select at least one platform.");
      return;
    }

    if (form.favorite_themes.length === 0) {
      setMessage("Please select at least one theme.");
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

      setMessage("Survey successfully saved.");

      setTimeout(() => {
        navigate("/profile");
      }, 800);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCheckboxGroup = (options, field) => {
    return (
      <div className="row">
        {options.map((option) => (
          <div className="col-md-4 mb-2" key={option}>
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form[field].includes(option)}
                onChange={() => toggleArrayValue(field, option)}
              />
              <span className="form-check-label">
                {option}
              </span>
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h1>Taste Survey</h1>

      <p className="text-muted">
        Help Game-Side understand what kind of games you enjoy.
      </p>

      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="mb-4">
          <h4>Favorite Genres</h4>
          {renderCheckboxGroup(genreOptions, "genres")}
        </div>

        <div className="mb-4">
          <h4>Platforms</h4>
          {renderCheckboxGroup(platformOptions, "platforms")}
        </div>

        <div className="mb-4">
          <h4>Play Style</h4>

          <select
            className="form-control"
            name="play_style"
            value={form.play_style}
            onChange={handlePlayStyleChange}
          >
            <option value="casual">Casual</option>
            <option value="competitive">Competitive</option>
            <option value="completionist">Completionist</option>
            <option value="story">Story-focused</option>
            <option value="exploration">Exploration</option>
            <option value="social">Social / Multiplayer</option>
          </select>
        </div>

        <div className="mb-4">
          <h4>Favorite Themes</h4>
          {renderCheckboxGroup(themeOptions, "favorite_themes")}
        </div>

        <button
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Survey"}
        </button>
      </form>
    </div>
  );
};