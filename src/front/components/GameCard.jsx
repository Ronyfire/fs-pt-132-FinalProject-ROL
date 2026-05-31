import { Link } from "react-router-dom";

const GameCard = ({ game, variant = "default" }) => {
  return (
    <Link to={`/games/${game.id}`} className="gs-game-card h-100">
      <div className="gs-game-card__cover">
        {game.cover_img_url ? (
          <img src={game.cover_img_url} alt={game.title} />
        ) : (
          <span>🎮</span>
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