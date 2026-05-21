import React, { useState } from "react";

export const Survey = () => {
    const [form, setForm] = useState({
        genres: "",
        platforms: "",
        play_style: "casual",
        favorite_themes: ""
    });

    const [message, setMessage] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(`${backendUrl}/api/users/survey`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    genres: form.genres.split(",").map(item => item.trim()).filter(Boolean),
                    platforms: form.platforms.split(",").map(item => item.trim()).filter(Boolean),
                    play_style: form.play_style,
                    favorite_themes: form.favorite_themes.split(",").map(item => item.trim()).filter(Boolean)
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Could not save survey");

            setMessage("Survey successfully saved");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Taste survey</h1>

            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Favorite genres</label>
                    <input
                        className="form-control"
                        name="genres"
                        placeholder="RPG, Action, Strategy"
                        value={form.genres}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Platforms</label>
                    <input
                        className="form-control"
                        name="platforms"
                        placeholder="PC, PS5, Switch"
                        value={form.platforms}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Play style</label>
                    <select
                        className="form-control"
                        name="play_style"
                        value={form.play_style}
                        onChange={handleChange}
                    >
                        <option value="casual">Casual</option>
                        <option value="competitive">Competitive</option>
                        <option value="completionist">Completionist</option>
                        <option value="story">Story</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Favorite themes</label>
                    <input
                        className="form-control"
                        name="favorite_themes"
                        placeholder="Fantasy, Sci-fi, Horror"
                        value={form.favorite_themes}
                        onChange={handleChange}
                    />
                </div>

                <button className="btn btn-success">
                    Save survey
                </button>
            </form>
        </div>
    );
};