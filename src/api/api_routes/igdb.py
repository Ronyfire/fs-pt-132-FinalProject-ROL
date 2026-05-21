import logging
import requests
from datetime import datetime, timezone
from flask import current_app
from api.models import db, Game, GameTier

logger = logging.getLogger(__name__)

IGDB_URL = "https://api.igdb.com/v4/games"
TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token"

# Imagen por defecto si un juego no tiene portada
DEFAULT_COVER = (
    "https://images.unsplash.com/vector-1738312097380-45562da00459"
    "?q=80&w=1160&auto=format&fit=crop"
)


def _get_token():
    """Pide un token OAuth a Twitch. IGDB lo necesita y caduca, por eso se pide cada vez."""
    try:
        resp = requests.post(TWITCH_TOKEN_URL, params={
            "client_id": current_app.config.get("IGDB_CLIENT_ID"),
            "client_secret": current_app.config.get("IGDB_CLIENT_SECRET"),
            "grant_type": "client_credentials",
        }, timeout=10)
        return resp.json().get("access_token")
    except requests.RequestException as e:
        logger.error("Error obteniendo token de IGDB: %s", e)
        return None


def _get_headers():
    """Headers que pide IGDB en cada petición."""
    return {
        "Client-ID": current_app.config.get("IGDB_CLIENT_ID"),
        "Authorization": f"Bearer {_get_token()}",
        "Accept": "application/json",
    }


def search_igdb_games(query, page_size=20):
    """Busca juegos en IGDB por nombre. Devuelve la lista de resultados."""
    # IGDB usa su propio lenguaje de consulta en el body del POST
    body = (
        f'search "{query}"; '
        f'fields name, slug, summary, first_release_date, cover.url, '
        f'genres.name, platforms.name, '
        f'involved_companies.company.name, '
        f'involved_companies.developer, involved_companies.publisher; '
        f'where rating >= 70 & version_parent = null; '
        f'limit {page_size};'
    )

    try:
        resp = requests.post(IGDB_URL, headers=_get_headers(), data=body, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        logger.error("IGDB search error: HTTP %s — %s", resp.status_code, resp.text)
        return []
    except requests.RequestException as e:
        logger.error("Error de conexión con IGDB: %s", e)
        return []


def _get_developers_and_publishers(igdb_game):
    """Saca developers y publishers de la lista involved_companies."""
    companies = igdb_game.get("involved_companies") or []

    developers = [
        c["company"]["name"]
        for c in companies
        if c.get("developer") and c.get("company")
    ]
    publishers = [
        c["company"]["name"]
        for c in companies
        if c.get("publisher") and c.get("company")
    ]
    return developers, publishers


def _get_cover_url(igdb_game):
    """Construye la URL de la portada. IGDB la devuelve sin https y en miniatura."""
    cover = igdb_game.get("cover") or {}
    url = cover.get("url", "")

    if not url:
        return DEFAULT_COVER

    if url.startswith("//"):
        url = "https:" + url
    # t_thumb es la miniatura, t_cover_big es la imagen grande
    return url.replace("t_thumb", "t_cover_big")


def _get_release_date(igdb_game):
    """Convierte la fecha de IGDB (timestamp Unix) a un objeto date."""
    timestamp = igdb_game.get("first_release_date")
    if not timestamp:
        return None
    try:
        return datetime.fromtimestamp(timestamp, tz=timezone.utc).date()
    except Exception:
        return None


def create_game_from_igdb(igdb_game):
    """Crea o actualiza un Game en la base de datos a partir de un juego de IGDB."""
    try:
        developers, publishers = _get_developers_and_publishers(igdb_game)

        # Si el juego ya existe lo actualizamos, si no lo creamos
        game = db.session.get(Game, igdb_game["id"])
        is_new = game is None
        if not game:
            game = Game(id=igdb_game["id"])

        game.slug = igdb_game.get("slug") or str(igdb_game["id"])
        game.title = igdb_game.get("name", "")
        game.description = igdb_game.get("summary") or None
        game.release_date = _get_release_date(igdb_game)
        game.developer = ", ".join(developers) or "Unknown"
        game.publisher = ", ".join(publishers) or "Unknown"
        game.cover_img_url = _get_cover_url(igdb_game)
        game.genres = [g["name"] for g in igdb_game.get("genres") or []]
        game.platforms = [p["name"] for p in igdb_game.get("platforms") or []]

        db.session.add(game)
        db.session.flush()  # necesario para tener game.id antes de crear el tier

        # Si el juego es nuevo, crear su GameTier asociado
        if is_new:
            db.session.add(GameTier(game_id=game.id))

        db.session.commit()
        logger.info("Juego guardado: %s", game.title)
        return game

    except Exception as e:
        logger.error("Error guardando '%s': %s", igdb_game.get("name"), e)
        db.session.rollback()
        return None