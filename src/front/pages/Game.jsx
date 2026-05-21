import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentForm from "../components/CommentForm";
import FavoriteButton from "../components/FavoriteButton";

export const Game = () => {
    const { gameId } = useParams();

    const [game, setGame] = useState(null);
    const [comments, setComments] = useState([]);
    const [message, setMessage] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const loadGame = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/games/${gameId}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Game not found");

            setGame(data);
        } catch (error) {
            setMessage(error.message);
        }
    };

    const loadComments = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/games/${gameId}/comments`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Could not load comments");

            setComments(data.comments);
        } catch (error) {
            console.log(error);
        }
    };

    const addToList = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(`${backendUrl}/api/user/glg`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    game_id: Number(gameId),
                    status: "want_to_play"
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Could not add game");

            setMessage("Juego añadido a tu lista");
        } catch (error) {
            setMessage(error.message);
        }
    };

    const voteGame = async (rating) => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(`${backendUrl}/api/user/game-tiers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    game_id: Number(gameId),
                    rating
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Could not vote");

            setMessage("Voto guardado");
            loadGame();
        } catch (error) {
            setMessage(error.message);
        }
    };

    useEffect(() => {
        loadGame();
        loadComments();
    }, [gameId]);

    if (!game) {
        return (
            <div className="container mt-4">
                {message || "Loading..."}
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            <img
                src={game.cover_img_url}
                alt={game.title}
                className="img-fluid mb-3"
            />

            <h1>{game.title}</h1>

            <p>{game.description}</p>

            <p>
                <strong>Developer:</strong> {game.developer}
            </p>

            <p>
                <strong>Publisher:</strong> {game.publisher}
            </p>

            <p>
                <strong>Genres:</strong> {game.genres?.join(", ")}
            </p>

            <p>
                <strong>Platforms:</strong> {game.platforms?.join(", ")}
            </p>

            <p>
                <strong>Rating:</strong> {game.game_tier?.average_rating ?? 0}
            </p>

            <div className="d-flex gap-2 mb-4">
                <button className="btn btn-success" onClick={addToList}>
                    Add to my list
                </button>

                <FavoriteButton gameId={Number(gameId)} />

                {[1, 2, 3, 4, 5].map(number => (
                    <button
                        key={number}
                        className="btn btn-outline-warning"
                        onClick={() => voteGame(number)}
                    >
                        {number}
                    </button>
                ))}
            </div>

            <hr />

            <h3>Comments ({comments.length})</h3>

            <CommentForm
                gameId={Number(gameId)}
                onCommentCreated={loadComments}
            />

            <div className="mt-3">
                {comments.map(comment => (
                    <div className="card mb-2" key={comment.id}>
                        <div className="card-body">
                            <strong>{comment.username}</strong>
                            <p>{comment.content}</p>

                            {comment.parent_id && (
                                <small>Add comment from #{comment.parent_id}</small>
                            )}

                            <CommentForm
                                gameId={Number(gameId)}
                                parentId={comment.id}
                                buttonText="Responder"
                                onCommentCreated={loadComments}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};