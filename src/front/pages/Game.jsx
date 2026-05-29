import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/pages/game-detail.css';
import useGlobalReducer from "../hooks/useGlobalReducer";
import CommentCard from "../components/CommentCard";
import CommentForm from "../components/CommentForm";
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
  /* ── Cargar comentarios desde el endpoint dedicado ── */
  const loadComments = () => {
    fetch(`${VITE_BACKEND_URL}/api/games/${gameId}/comments`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      })
      .catch(() => {});
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
      <div className="mx-auto gs-page-content" style={{ maxWidth: '1440px' }}>
        
        {/* HERO BANNER */}
        <div
          className="hero-banner"
          style={
            coverUrl
              ? { backgroundImage: `url(${coverUrl})` }
              : {}
          }
        >
          <div className="hero-overlay" />
          <div className="hero-content px-4 px-md-5">
            {/* Volver atrás */}
            <div className="d-flex align-items-center gap-2 fs-4 fw-medium mb-3" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
              <span style={{ fontWeight: 900, fontSize: '1.8rem', lineHeight: 1, WebkitTextStroke: '2px currentColor' }}>←</span> Back
            </div>
            
            {/* Título */}
            <h1 className="display-3 fw-bold mb-3">{game.title}</h1>
            
            {/* Etiquetas + Rating */}
            <div className="d-flex flex-wrap align-items-center gap-3">
              {genres.map((tag, i) => (
                <span key={i} className="badge text-white px-4 py-3 fs-6" style={{ backgroundColor: 'var(--green-accent)', borderRadius: '8px' }}>{tag}</span>
              ))}
              <div className="d-flex align-items-center gap-2 fw-bold fs-5 ms-lg-3">
                <span style={{ color: '#D4B609' }}>★</span>
                <span>{Number(rating).toFixed(1)}</span>
                <span className="fw-normal opacity-75">({Number(voteCount).toLocaleString('es-ES')})</span>
              </div>
            </div>
          </div>
        </div>
        {/* CUERPO PRINCIPAL */}
        <main className="px-4 px-md-5 py-5 text-white">
          
          {/* SECCIÓN DOS COLUMNAS */}
          <div className="row g-4 mb-5">
            
            {/* Columna Izquierda: Descripción */}
            <div className="col-12 col-xl-8">
              <div className="bg-card p-4 p-md-5 rounded-3 gd-desc-card">
                <h2 className="gs-rakki-mood-card fs-3 fw-bold mb-4">Description</h2>
                <p className="fs-custom-desc mb-5">
                  {game.description || game.summary || 'No description available.'}
                </p>
                <h2 className="gs-rakki-mood-card fs-3 fw-bold mb-4">Features</h2>
                <ul className="list-unstyled fs-custom-desc">
                  {features.map((feature, idx) => (
                    <li key={idx} className="mb-3 d-flex align-items-start gap-3">
                      <span className="text-green">★</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Columna Derecha: Información */}
            <div className="col-12 col-xl-4">
              <div className="bg-card p-4 p-md-5 rounded-3 h-100">
                <h2 className="gs-rakki-mood-card fs-3 fw-bold mb-4">Information</h2>
                
                {game.developer && (
                  <div className="mb-4">
                    <div className="fs-5 opacity-75 mb-1">Developer</div>
                    <div className="fs-4 fw-bold">{game.developer}</div>
                  </div>
                )}
                {game.release_date && (
                  <div className="mb-4">
                    <div className="fs-5 opacity-75 mb-1">Release date</div>
                    <div className="fs-4 fw-bold">📅 {formatDate(game.release_date)}</div>
                  </div>
                )}
                {platforms.length > 0 && (
                  <div className="mb-4">
                    <div className="fs-5 opacity-75 mb-1">Platforms</div>
                    <div className="fs-4 fw-bold lh-base">
                      {platforms
                        .map((p) => PLATFORM_LABELS[p.toLowerCase()] || p)
                        .join(' | ')}
                    </div>
                  </div>
                )}
                {/* Tu voto */}
                <div className="mt-5">
                  <h2 className="fs-3 fw-bold mb-3">Your rating</h2>
                  <div className="progress mb-3" style={{ height: '6px', backgroundColor: '#E8DEF8' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: '100%', backgroundColor: '#E8DEF8' }}></div>
                  </div>
                  <div className="d-flex gap-1 fs-5" style={{ color: '#D4B609' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleRate(star)}
                        style={{ cursor: sessionStorage.getItem('token') ? 'pointer' : 'default', opacity: ratingLoading && star > userRating ? 0.5 : 1 }}
                      >
                        {star <= userRating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* SECCIÓN COMENTARIOS */}
          <div className="row mb-5">
            <div className="col-12 col-xl-8">
              <div className="bg-card p-4 p-md-5 rounded-3">
                <h2 className="display-6 fw-bold mb-4">Comments ({comments.length})</h2>
                {/* Formulario para nuevo comentario */}
                {sessionStorage.getItem('token') && (
                  <CommentForm
                    gameId={gameId}
                    buttonText="Publish comment"
                    onCommentCreated={loadComments}
                  />
                )}
                <div className="d-flex flex-column gap-4">
                  {parentComments.length === 0 ? (
                    <p className="text-white-50">No comments yet. Be the first to share your opinion.</p>
                  ) : (
                    parentComments.map((comment) => {
                      const replies = (comments || []).filter((c) => c.parent_id === comment.id);
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
          </div>
        </main>
      </div>
    </div>
  );
};