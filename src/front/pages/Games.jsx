import React, { useEffect, useState } from "react";
import { AddGameForm } from "../components/AddGameForm";

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

    }, [searchTerm, games]);

    return (
        <div className="container mt-4">

            <h1 className="mb-4">Games</h1>

            <input type="text" className="form-control mb-4" placeholder="Search game..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            {
                filteredGames.length > 0 ? (
                    <div className="row">
                        {
                            filteredGames.map(game => (
                                <div className="col-md-3 mb-4" key={game.id}>

                                    <div className="card h-100">
                                        <img
                                            src={game.cover_img_url}
                                            className="card-img-top"
                                        />

                                        <div className="card-body">
                                            <h5>{game.title}</h5>
                                            <p>
                                                {game.description.slice(0, 80)}...
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            ))
                        }
                    </div>
                ) : (
                    <div className="text-center mt-5">

                        <h3>No games found</h3>

                        <p>
                            Be the first to suggest this game!
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {
                                showForm
                                    ? "Close form"
                                    : "Suggest game"
                            }
                        </button>

                        {
                            showForm &&
                            <AddGameForm searchTerm={searchTerm} />
                        }

                    </div>
                )
            }
        </div>
    );
};