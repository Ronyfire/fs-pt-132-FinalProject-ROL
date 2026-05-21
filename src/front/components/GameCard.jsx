import { Link } from "react-router-dom";

const GameCard = ({ game }) => {
  return (
    <Link to={`/games/${game.id}`} className="text-decoration-none text-dark">
      <div className="card h-100">
        <img
          src={game.cover_img_url}
          className="card-img-top"
          alt={game.title}
        />

        <div className="card-body">
          <h5 className="card-title">{game.title}</h5>

          <p className="card-text">
            {game.genres?.join(", ")}
          </p>

          <small>
            ⭐ {game.game_tier?.average_rating ?? 0} | ❤️ {game.favorite_count ?? 0}
          </small>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;