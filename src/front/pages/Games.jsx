import React, { useEffect, useState } from "react";
import { AddGameForm } from "../components/AddGameForm";
import GameCard from "../components/GameCard";

export const Games = () => {
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const loadGames = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/games`);
            const data = await response.json();

            setGames(data);
            setFilteredGames(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadGames();
    }, []);

    useEffect(() => {
        const filtered = games.filter(game =>
            game.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredGames(filtered);
        setShowForm(false);
    }, [searchTerm, games]);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Games</h1>

            <input
                type="text"
                className="form-control mb-4"
                placeholder="Search game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredGames.length > 0 ? (
                <div className="row">
                    {filteredGames.map(game => (
                        <div className="col-md-3 mb-4" key={game.id}>
                            <GameCard game={game} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center mt-5">
                    <h3>Oops.. This game does not exist here</h3>

                    <p>
                        Be the first to suggest it and help us grow the Game-Side library.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "Suggest adding game"}
                    </button>

                    {showForm && (
                        <AddGameForm searchTerm={searchTerm} />
                    )}
                </div>
            )}
        </div>
    );
};