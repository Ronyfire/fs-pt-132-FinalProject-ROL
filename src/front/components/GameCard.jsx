import { Link } from "react-router-dom";
import { rakkiToast } from "./RakkiToast";

const GameCard = ({ game, variant = "default", showLibraryAction = false }) => {
  const addToLibrary = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const token = sessionStorage.getItem("token");

    if (!token) {
      rakkiToast.info("Log in to add games to your library!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/glg`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            game_id: game.id,
            status: "want_to_play",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.msg === "Game already in your list") {
          rakkiToast.info("Already in your library!");
          return;
        }

        throw new Error(data.msg || "Could not add game to library");
      }

      rakkiToast.success(`${game.title} added to your library!`);
    } catch (error) {
      rakkiToast.error(error.message);
    }
  };

  return (
    <Link to={`/games/${game.id}`} className="gs-game-card h-100">
      <div className="gs-game-card__cover">
        {game.cover_img_url ? (
          <img src={game.cover_img_url} alt={game.title} />
        ) : (
          <span>🎮</span>
        )}

        {showLibraryAction && (
          <button
            type="button"
            className="gs-game-card__library-btn"
            onClick={addToLibrary}
          >
            + Add to Library
          </button>
        )}
      </div>

      <div className="gs-game-card__body">
        <h5 className="gs-game-card__title">{game.title}</h5>

        <p className="gs-game-card__meta mb-1">
          {game.genres?.slice(0, 2).join(", ") || "Unknown genre"}
        </p>

        <div className="d-flex justify-content-between align-items-center mt-auto">
          <small className="text-purple">
            ⭐ {game.game_tier?.average_rating ?? 0}
          </small>

          <small className="text-pink">
            ❤️ {game.favorite_count ?? 0}
          </small>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;