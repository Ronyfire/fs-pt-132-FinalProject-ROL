import React, { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AddGameForm = ({ searchTerm = "" }) => {
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

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const token = sessionStorage.getItem("token");

            const body = {
                creator: true,
                update: false,
                body: {
                    title: formData.title,
                    description: formData.description,
                    release_date: formData.release_date,
                    developer: formData.developer,
                    publisher: formData.publisher,
                    cover_img_url: formData.cover_img_url,
                    genres: formData.genres
                        .split(",")
                        .map(g => g.trim())
                        .filter(Boolean),
                    platforms: formData.platforms
                        .split(",")
                        .map(p => p.trim())
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Error sending game");
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
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
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
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Release Date</label>
                    <input
                        type="date"
                        className="form-control"
                        name="release_date"
                        value={formData.release_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Developer</label>
                    <input
                        type="text"
                        className="form-control"
                        name="developer"
                        value={formData.developer}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Publisher</label>
                    <input
                        type="text"
                        className="form-control"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Cover URL</label>
                    <input
                        type="text"
                        className="form-control"
                        name="cover_img_url"
                        value={formData.cover_img_url}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Genres (comma separated)
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        name="genres"
                        value={formData.genres}
                        onChange={handleChange}
                        placeholder="Action, RPG, Adventure"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Platforms (comma separated)
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        name="platforms"
                        value={formData.platforms}
                        onChange={handleChange}
                        placeholder="PC, PS5, Switch"
                        required
                    />
                </div>

                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Suggestion"}
                </button>

            </form>

            {
                message &&
                <div className="alert alert-info mt-3">
                    {message}
                </div>
            }
        </div>
    );
};