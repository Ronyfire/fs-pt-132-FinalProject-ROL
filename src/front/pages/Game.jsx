import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/pages/game-detail.css';
import useGlobalReducer from "../hooks/useGlobalReducer";
import CommentCard from "../components/CommentCard";
import CommentForm from "../components/CommentForm";
import { rakkiToast } from "../components/RakkiToast";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
/* ─── Helper: label bonito para plataformas ─── */
const PLATFORM_LABELS = {
  pc: 'PC',
  windows: 'PC',
  mac: 'Mac',
  linux: 'Linux',
  playstation: 'PlayStation',
  ps4: 'PlayStation 4',
  ps5: 'PlayStation 5',
  xbox: 'Xbox',
  xbox_one: 'Xbox One',
  xbox_series: 'Xbox Series X|S',
  nintendo: 'Nintendo',
  switch: 'Nintendo Switch',
  mobile: 'Mobile',
  ios: 'iOS',
  android: 'Android',
};
/* ─── Formatear fecha ─── */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
export const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  /* ── Estado del juego ── */
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /* ── Comentarios ── */
  const [comments, setComments] = useState([]);
  /* ── Voto del usuario ── */
  const [userRating, setUserRating] = useState(0);
  const [userVoteId, setUserVoteId] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [libraryEntry, setLibraryEntry] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(false);
  /* ── Cargar comentarios desde el endpoint dedicado ── */
  const loadComments = () => {
    fetch(`${VITE_BACKEND_URL}/api/games/${gameId}/comments`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      })
      .catch(() => { });
  };

  const loadLibraryEntry = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setLibraryEntry(null);
      return;
    }

    try {
      const res = await fetch(`${VITE_BACKEND_URL}/api/private`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        setLibraryEntry(null);
        return;
      }

      const userData = await res.json();

      const games = userData?.game_lists?.[0]?.games || [];

      const entry = games.find(
        (item) => Number(item.game_id) === Number(gameId)
      );

      setLibraryEntry(entry || null);
    } catch (err) {
      console.error("Error loading library entry:", err);
      setLibraryEntry(null);
    }
  };
  /* ── Cargar datos ── */
  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    setError(null);
    const token = sessionStorage.getItem('token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch(`${VITE_BACKEND_URL}/api/games/${gameId}`),
      fetch(`${VITE_BACKEND_URL}/api/user/game-tiers`, { headers: authHeaders }),
    ])
      .then(async ([gameRes, voteRes]) => {
        if (!gameRes.ok) throw new Error(`Error ${gameRes.status}`);
        const gameData = await gameRes.json();
        setGame(gameData);
        // Cargar comentarios del endpoint dedicado
        loadComments();

        await loadLibraryEntry();
        // Buscar si el usuario ya votó este juego
        if (voteRes.ok) {
          const votes = await voteRes.json();
          if (gameData.game_tier?.id) {
            const myVote = (Array.isArray(votes) ? votes : []).find(
              (v) => v.game_tier_id === gameData.game_tier.id
            );
            if (myVote) {
              setUserRating(myVote.rating);
              setUserVoteId(myVote.id);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [gameId]);
  /* ───── Votar (crear o actualizar) ───── */
  const handleRate = async (star) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    setRatingLoading(true);
    try {
      const authHeaders = { Authorization: `Bearer ${token}` };
      const body = { game_id: parseInt(gameId), rating: star };
      if (userVoteId) {
        const res = await fetch(`${VITE_BACKEND_URL}/api/user/game-tiers/${userVoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ rating: star }),
        });
        if (!res.ok) throw new Error('Error al actualizar voto');
      } else {
        const res = await fetch(`${VITE_BACKEND_URL}/api/user/game-tiers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Error al crear voto');
      }
      // Refrescar datos del juego (actualiza promedio)
      const gameRes = await fetch(`${VITE_BACKEND_URL}/api/games/${gameId}`);
      if (gameRes.ok) setGame(await gameRes.json());
      setUserRating(star);
    } catch (err) {
      console.error('Error rating game:', err);
    } finally {
      setRatingLoading(false);
    }
  };
  /* ═══════ LOADING ═══════ */
  const requireLogin = (message = "Log in to use this feature!") => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      rakkiToast.info(message);
      return null;
    }

    return token;
  };

  const addToLibrary = async (status = "want_to_play") => {
    const token = requireLogin("Log in to add games to your library!");
    if (!token) return;

    if (libraryEntry) {
      rakkiToast.info("Already in your library!");
      return;
    }

    setLibraryLoading(true);

    try {
      const res = await fetch(`${VITE_BACKEND_URL}/api/user/glg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          game_id: parseInt(gameId),
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.msg === "Game already in your list") {
          rakkiToast.info("Already in your library!");
          await loadLibraryEntry();
          return;
        }

        throw new Error(data.msg || "Could not add game to library");
      }

      await loadLibraryEntry();
      rakkiToast.success(`${game.title} added to your library!`);
    } catch (err) {
      rakkiToast.error(err.message);
    } finally {
      setLibraryLoading(false);
    }
  };

  const toggleFavorite = async () => {
    const token = requireLogin("Log in to add favorites!");
    if (!token) return;

    if (!libraryEntry?.id) {
      rakkiToast.info("Add this game to your library first!");
      return;
    }

    try {
      const res = await fetch(`${VITE_BACKEND_URL}/api/favorite/change`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          game_id: parseInt(gameId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Could not update favorite");
      }

      await loadLibraryEntry();

      if (libraryEntry.is_favorite) {
        rakkiToast.favoriteRemove("Removed from favorites");
      } else {
        rakkiToast.favoriteAdd("Added to favorites!");
      }
    } catch (err) {
      rakkiToast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="gs-page-bg">
        <div className="mx-auto gs-page-content text-center py-5" style={{ maxWidth: '1440px' }}>
          <div className="spinner-border text-light mt-5" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  /* ═══════ ERROR ═══════ */
  if (error || !game) {
    return (
      <div className="gs-page-bg">
        <div className="mx-auto gs-page-content text-center py-5 text-white" style={{ maxWidth: '1440px' }}>
          <h2 className="mt-5">
            {error?.includes('404') ? 'Game not found' : 'Something went wrong'}
          </h2>
          <p className="text-white-50">{error || 'Could not load the game.'}</p>
          <Link to="/games" className="btn btn-success mt-3">
            Back to Games
          </Link>
        </div>
      </div>
    );
  }
  /* ═══════ DATOS ═══════ */
  const coverUrl = game.cover_img_url || game.background_image || '';
  const genres = game.genres || [];
  const platforms = game.platforms || [];
  const rating = game.game_tier?.average_rating ?? game.rating ?? 0;
  const voteCount = game.game_tier?.vote_count ?? game.ratings_count ?? 0;
  const currentUser = store.user || null;
  const isAdmin = store.user?.is_admin || false;
  const features = [
    'Online co-op for up to 4 players',
    'Wide variety of characters with unique abilities',
    'Advanced movement and parkour system',
    'Weapon, character, and build customization',
    'Open worlds and exploration',
    'Frequent events and updates',
    'PvE missions and endgame content',
    'Player trading',
  ];
  // Comentarios principales (sin parent_id) y sus respuestas
  const parentComments = (comments || []).filter((c) => !c.parent_id);
  return (
    <div className="gs-page-bg">
      <div className="container-xxl gs-page-content py-4 py-lg-5">

        {/* HERO */}
        <section
          className="gd-hero mb-4 mb-lg-5"
          style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}
        >
          <div className="gd-hero-overlay" />

          <div className="gd-hero-content">
            <button
              type="button"
              className="btn btn-sm btn-outline-light border-0 px-0 mb-3 gd-back-btn"
              onClick={() => navigate(-1)}
            >
              ← Back to games
            </button>

            <div className="row align-items-end g-4">
              <div className="col-lg-8">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {genres.slice(0, 4).map((tag) => (
                    <span key={tag} className="badge gd-badge-green">
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="display-3 fw-black text-white mb-3">
                  {game.title}
                </h1>

                <div className="d-flex flex-wrap align-items-center gap-3">
                  <span className="gd-rating-pill">
                    <span>★</span>
                    {Number(rating).toFixed(1)}
                    <small>({Number(voteCount).toLocaleString("es-ES")} votes)</small>
                  </span>

                  {game.game_tier?.tier && (
                    <span className="gd-tier-pill">
                      Tier {game.game_tier.tier}
                    </span>
                  )}

                  {game.favorite_count !== undefined && (
                    <span className="gd-soft-pill">
                      ♥ {game.favorite_count} favorites
                    </span>
                  )}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="gd-action-panel">
                  <button
                    type="button"
                    className={`btn-gs w-100 mb-2 ${libraryEntry ? "btn-green-outline" : "btn-green"}`}
                    onClick={() => addToLibrary("want_to_play")}
                    disabled={libraryLoading || Boolean(libraryEntry)}
                  >
                    {libraryLoading
                      ? "Updating..."
                      : libraryEntry
                        ? "✓ In your Library"
                        : "+ Add to Library"}
                  </button>

                  <button
                    type="button"
                    className="btn-gs btn-pink-outline w-100 mb-3"
                    onClick={toggleFavorite}
                    disabled={!libraryEntry}
                  >
                    {libraryEntry?.is_favorite ? "♥ Remove Favorite" : "♡ Add to Favorites"}
                  </button>

                  <div className="gd-user-rating">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Your rating</span>
                      <strong>{userRating ? `${userRating}/5` : "Not rated"}</strong>
                    </div>

                    <div className="d-flex gap-1 fs-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="gd-star-btn"
                          onClick={() => handleRate(star)}
                          disabled={ratingLoading}
                          aria-label={`Rate ${star} stars`}
                        >
                          {star <= userRating ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <main className="row g-4 align-items-start">

          {/* LEFT */}
          <section className="col-lg-8">
            <div className="card gs-card gd-card mb-4">
              <div className="card-body p-4 p-lg-5">
                <span className="gs-home-eyebrow">Overview</span>

                <h2 className="h3 fw-bold text-green mb-3">
                  Description
                </h2>

                <p className="gd-description mb-0">
                  {game.description || game.summary || "No description available."}
                </p>
              </div>
            </div>

            <div className="card gs-card gd-card mb-4">
              <div className="card-body p-4 p-lg-5">
                <span className="gs-home-eyebrow">Gameplay</span>

                <h2 className="h3 fw-bold text-green mb-4">
                  Features
                </h2>

                <div className="row g-3">
                  {features.map((feature) => (
                    <div className="col-md-6" key={feature}>
                      <div className="gd-feature-item">
                        <span>✦</span>
                        <p>{feature}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card gs-card gd-card gd-comments-section">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                  <div>
                    <span className="gs-home-eyebrow">Community</span>
                    <h2 className="h3 fw-bold text-green mb-0">
                      Comments ({comments.length})
                    </h2>
                  </div>
                </div>

                {sessionStorage.getItem("token") ? (
                  <CommentForm
                    gameId={gameId}
                    buttonText="Publish comment"
                    onCommentCreated={loadComments}
                  />
                ) : (
                  <div className="alert gd-login-alert">
                    Log in to leave a comment.
                  </div>
                )}

                <div className="d-flex flex-column gap-4 mt-4">
                  {parentComments.length === 0 ? (
                    <p className="text-dim mb-0">
                      No comments yet. Be the first to share your opinion.
                    </p>
                  ) : (
                    parentComments.map((comment) => {
                      const replies = (comments || []).filter(
                        (c) => c.parent_id === comment.id
                      );

                      return (
                        <CommentCard
                          key={comment.id}
                          comment={comment}
                          replies={replies}
                          gameId={gameId}
                          currentUser={currentUser}
                          isAdmin={isAdmin}
                          onRefresh={loadComments}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="col-lg-4">
            <div className="card gs-card gd-card gd-sticky-card mb-4">
              <div className="card-body p-4">
                <span className="gs-home-eyebrow">Game info</span>

                <h2 className="h4 fw-bold text-green mb-4">
                  Information
                </h2>

                <div className="gd-info-list">
                  {game.developer && (
                    <div>
                      <span>Developer</span>
                      <strong>{game.developer}</strong>
                    </div>
                  )}

                  {game.publisher && (
                    <div>
                      <span>Publisher</span>
                      <strong>{game.publisher}</strong>
                    </div>
                  )}

                  {game.release_date && (
                    <div>
                      <span>Release date</span>
                      <strong>{formatDate(game.release_date)}</strong>
                    </div>
                  )}

                  {platforms.length > 0 && (
                    <div>
                      <span>Platforms</span>
                      <strong>
                        {platforms
                          .map((p) => PLATFORM_LABELS[p.toLowerCase()] || p)
                          .join(" · ")}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card gs-card gd-card">
              <div className="card-body p-4">
                <span className="gs-home-eyebrow">Tags</span>

                <div className="d-flex flex-wrap gap-2 mt-2">
                  {genres.length > 0 ? (
                    genres.map((genre) => (
                      <span key={genre} className="badge gd-badge-purple">
                        {genre}
                      </span>
                    ))
                  ) : (
                    <span className="text-dim">No genres available.</span>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};