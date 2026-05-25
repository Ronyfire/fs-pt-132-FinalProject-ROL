import React, { useState } from "react";
import { ImageUploader } from "./ImageUploader";

export const AddGameForm = ({ searchTerm = "" }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    title: searchTerm,
    description: "",
    release_date: "",
    developer: "",
    publisher: "",
    cover_img_url: "",
    genres: "",
    platforms: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const parseResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        msg: text
      };
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setMessage("You must be logged in to suggest a game.");
        setLoading(false);
        return;
      }

      const body = {
        creator: true,
        update: false,
        body: {
          title: formData.title.trim(),
          description: formData.description.trim(),
          release_date: formData.release_date || null,
          developer: formData.developer.trim(),
          publisher: formData.publisher.trim(),
          cover_img_url: formData.cover_img_url.trim(),
          genres: formData.genres
            .split(",")
            .map((genre) => genre.trim())
            .filter(Boolean),
          platforms: formData.platforms
            .split(",")
            .map((platform) => platform.trim())
            .filter(Boolean)
        }
      };

      const response = await fetch(`${backendUrl}/api/addgame`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.msg || "Could not send game suggestion.");
      }

      setMessage("Game suggestion sent successfully!");

      setFormData({
        title: "",
        description: "",
        release_date: "",
        developer: "",
        publisher: "",
        cover_img_url: "",
        genres: "",
        platforms: ""
      });

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mt-4">
      <h3 className="mb-3">Suggest a Game</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Elden Ring, Overwatch, World of Warcraft..."
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Release Date</label>
          <input
            className="form-control"
            type="date"
            name="release_date"
            value={formData.release_date}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Developer</label>
          <input
            className="form-control"
            type="text"
            name="developer"
            value={formData.developer}
            onChange={handleChange}
            placeholder="Digital Extremes"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Publisher</label>
          <input
            className="form-control"
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
            placeholder="Digital Extremes"
            required
          />
        </div>

        <div className="mb-3">
          <ImageUploader
            label="Cover Image"
            currentUrl={formData.cover_img_url}
            shape="square"
            previewWidth={100}
            previewHeight={140}
            onUpload={(url) => setFormData((prev) => ({ ...prev, cover_img_url: url }))}
          />
          {/* Fallback manual */}
          <input
            className="form-control bg-dark border-secondary text-light mt-2"
            type="text"
            name="cover_img_url"
            value={formData.cover_img_url}
            onChange={handleChange}
            placeholder="Or paste a URL manually..."
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Genres</label>
          <input
            className="form-control"
            type="text"
            name="genres"
            value={formData.genres}
            onChange={handleChange}
            placeholder="Action, RPG, Shooter"
            required
          />
          <small className="text-muted">Separate genres with commas.</small>
        </div>

        <div className="mb-3">
          <label className="form-label">Platforms</label>
          <input
            className="form-control"
            type="text"
            name="platforms"
            value={formData.platforms}
            onChange={handleChange}
            placeholder="PC, PS5, Xbox Series X/S"
            required
          />
          <small className="text-muted">Separate platforms with commas.</small>
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Suggestion"}
        </button>
      </form>

      {message && (
        <div className="alert alert-info mt-3">
          {message}
        </div>
      )}
    </div>
  );
};