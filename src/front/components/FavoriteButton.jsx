import React, { useState } from "react";

const FavoriteButton = ({ gameId }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [message, setMessage] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleFavorite = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(`${backendUrl}/api/favorite/change`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    game_id: gameId
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Could not update favorite");

            setIsFavorite(data.is_favorite);
            setMessage("");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div>
            <button
                className={isFavorite ? "btn btn-danger" : "btn btn-outline-danger"}
                onClick={handleFavorite}
            >
                {isFavorite ? "Favorite" : "Favorite"}
            </button>

            {message && (
                <small className="d-block text-danger">
                    {message}
                </small>
            )}
        </div>
    );
};

export default FavoriteButton;
