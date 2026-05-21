import { Link } from "react-router-dom";

const GameCard = ({ game }) => {

    return (
        <Link to={`/games/${game.id}`}>
            <div>
                <img src={game.cover_img_url} alt={game.title} width="200"/>
                <h2>{game.title}</h2>
                <p>{game.developer}</p>
                <p>⭐ {game.game_tier?.average_rating}</p>
                <p>❤️ {game.favorite_count}</p>
            </div>
        </Link>
    );
};

export default GameCard;