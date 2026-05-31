import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { rakkiToast } from "../components/RakkiToast";

const API = import.meta.env.VITE_BACKEND_URL || "";

const TIER_META = {
  S:         { color: "#FF6B00", bg: "rgba(255,107,0,0.15)",   label: "Legendary" },
  A:         { color: "#FFD700", bg: "rgba(255,215,0,0.15)",   label: "Excellent" },
  B:         { color: "#AC4FD6", bg: "rgba(172,79,214,0.15)",  label: "Good" },
  C:         { color: "#4FC3F7", bg: "rgba(79,195,247,0.15)",  label: "Average" },
  D:         { color: "#7DD750", bg: "rgba(125,215,80,0.15)",  label: "Below Average" },
  F:         { color: "#D64F82", bg: "rgba(214,79,130,0.15)",  label: "Poor" },
  Undefined: { color: "#555",    bg: "rgba(85,85,85,0.08)",    label: "Unrated" },
};

const TIER_ORDER = ["S", "A", "B", "C", "D", "F", "Undefined"];

const ResetIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const TierList = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [games,   setGames]   = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [voting,  setVoting]  = useState(null);
  const [filter,  setFilter]  = useState("all");

  const loadGames = async () => {
    const res  = await fetch(`${API}/api/games`);
    const data = await res.json();
    setGames(Array.isArray(data) ? data : []);
  };

  const loadMyVotes = async () => {
    if (!store.isAuthenticated) return;
    const token = sessionStorage.getItem("token");
    const res   = await fetch(`${API}/api/user/game-tiers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const votes = await res.json();
    const map   = {};
    votes.forEach((v) => { map[v.game_tier_id] = v; });
    setMyVotes(map);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadGames(), loadMyVotes()]);
      setLoading(false);
    })();
  }, [store.isAuthenticated]);

  const handleVote = async (game, rating) => {
    if (!store.isAuthenticated) { navigate("/"); return; }
    const tierId   = game.game_tier?.id;
    const existing = myVotes[tierId];
    const token    = sessionStorage.getItem("token");
    setVoting(game.id);
    try {
      const res = existing
        ? await fetch(`${API}/api/user/game-tiers/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ rating }),
          })
        : await fetch(`${API}/api/user/game-tiers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ game_id: game.id, rating }),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Vote failed");
      rakkiToast.success(`Voted ${rating}/5 for ${game.title}!`);
      await Promise.all([loadGames(), loadMyVotes()]);
    } catch (err) {
      rakkiToast.error(err.message);
    } finally { setVoting(null); }
  };

  const handleDeleteVote = async (game) => {
    if (!store.isAuthenticated) return;
    const token  = sessionStorage.getItem("token");
    const tierId = game.game_tier?.id;
    const myVote = myVotes[tierId];
    if (!myVote) return;
    setVoting(game.id);
    try {
      const res = await fetch(`${API}/api/user/game-tiers/${game.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not remove vote");
      rakkiToast.info(`Vote removed for ${game.title}`);
      await Promise.all([loadGames(), loadMyVotes()]);
    } catch (err) {
      rakkiToast.error(err.message);
    } finally { setVoting(null); }
  };

  const grouped = TIER_ORDER.reduce((acc, t) => {
    acc[t] = games.filter((g) => (g.game_tier?.tier || "Undefined") === t);
    return acc;
  }, {});

  const tiersToShow = filter === "all"
    ? TIER_ORDER.filter((t) => grouped[t].length > 0)
    : [filter];

  if (loading) return (
    <div className="gs-page-bg d-flex align-items-center justify-content-center">
      <div className="gs-page-content">
        <div className="spinner-border text-light" />
      </div>
    </div>
  );

  return (
    <div className="gs-page-bg pb-5">
      <div className="gs-page-content container py-4">

        {/* ── HEADER ── */}
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 py-4 mb-2 gs-tier-header-row">
          <div>
            <h1 className="gs-tier-page-title">Global Tier List</h1>
            <p className="gs-tier-page-subtitle">
              Community rankings — {games.length} games rated by players worldwide
              {!store.isAuthenticated && (
                <span className="ms-2">
                  · <button className="btn-gs btn-pink-outline btn-sm" onClick={() => navigate("/")}>
                      Log in to vote
                    </button>
                </span>
              )}
            </p>
          </div>

          {/* Filtros */}
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn-gs ${filter === "all" ? "btn-green" : "btn-ghost"}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            {TIER_ORDER.filter((t) => t !== "Undefined" && grouped[t]?.length > 0).map((t) => (
              <button
                key={t}
                className="btn-gs gs-tier-filter-btn"
                onClick={() => setFilter(t === filter ? "all" : t)}
                style={{
                  "--tier-color": TIER_META[t].color,
                  background:  filter === t ? TIER_META[t].color : "transparent",
                  color:       filter === t ? "#000" : TIER_META[t].color,
                  borderColor: TIER_META[t].color,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── TIER ROWS ── */}
        <div className="d-flex flex-column gap-4 mt-4">
          {tiersToShow.map((tier) => {
            const meta = TIER_META[tier];
            if (!grouped[tier]?.length) return null;

            return (
              <div key={tier} style={{ "--tier-color": meta.color, "--tier-bg": meta.bg }}>

                {/* Tier label */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="gs-tier-badge">
                    {tier === "Undefined" ? "?" : tier}
                  </div>
                  <span className="gs-tier-label-text">{meta.label}</span>
                  <div className="gs-tier-divider" />
                </div>

                {/* Game cards */}
                <div className="d-flex flex-wrap gap-3">
                  {grouped[tier].map((game) => {
                    const tierId   = game.game_tier?.id;
                    const myVote   = myVotes[tierId];
                    const isVoting = voting === game.id;

                    return (
                      <div
                        key={game.id}
                        className={`gs-game-card gs-tier-game-card ${myVote ? "gs-tier-game-card--voted" : ""}`}
                      >
                        <Link to={`/games/${game.id}`} className="text-decoration-none">
                          <div className="gs-game-card__cover">
                            {game.cover_img_url
                              ? <img src={game.cover_img_url} alt={game.title} />
                              : <span>🎮</span>
                            }
                          </div>
                          <div className="gs-game-card__body">
                            <div className="gs-game-card__title">{game.title}</div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="gs-game-card__tier">
                                {game.game_tier?.tier === "Undefined" ? "—" : game.game_tier?.tier}
                              </span>
                              <span className="gs-game-card__meta">
                                {game.game_tier?.average_rating > 0
                                  ? `${game.game_tier.average_rating.toFixed(1)} · ${game.game_tier.vote_count}v`
                                  : "No votes"}
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Voting */}
                        <div className="gs-game-card__voting">
                          {store.isAuthenticated ? (
                            <>
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <p className="gs-vote-label mb-0">
                                  {myVote ? `Your vote: ${myVote.rating}/5` : "Rate this game:"}
                                </p>
                                {myVote && (
                                  <button
                                    className="gs-vote-reset"
                                    disabled={isVoting}
                                    onClick={() => handleDeleteVote(game)}
                                    title="Reset vote"
                                  >
                                    <ResetIcon />
                                  </button>
                                )}
                              </div>
                              <div className="gs-vote-stars">
                                {[1, 2, 3, 4, 5].map((r) => (
                                  <button
                                    key={r}
                                    disabled={isVoting}
                                    onClick={() => handleVote(game, r)}
                                    className={`gs-vote-star ${myVote?.rating >= r ? "active" : ""}`}
                                    title={`Rate ${r}/5`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : (
                            <button
                              className="gs-modal-link gs-tier-login-btn"
                              onClick={() => navigate("/")}
                            >
                              Log in to vote →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {games.length === 0 && (
          <div className="text-center py-5">
            <p className="text-dim">No games yet. Check back soon!</p>
            <Link to="/games" className="text-green">Browse Games →</Link>
          </div>
        )}
      </div>
    </div>
  );
};
0