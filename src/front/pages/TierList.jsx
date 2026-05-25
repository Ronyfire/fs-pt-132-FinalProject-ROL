import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API = import.meta.env.VITE_BACKEND_URL || "";

const C = {
  green: "#7DD750",
  pink: "#D64F82",
  purple: "#AC4FD6",
  bg: "#0D0F1F",
  text: "#F0F0F0",
};

// Colores y etiquetas por tier
const TIER_META = {
  S: { color: "#FFD700", bg: "rgba(255,215,0,0.12)",  label: "S — Legendary" },
  A: { color: "#7DD750", bg: "rgba(125,215,80,0.12)", label: "A — Excellent" },
  B: { color: "#4FC3F7", bg: "rgba(79,195,247,0.12)", label: "B — Good" },
  C: { color: "#AC4FD6", bg: "rgba(172,79,214,0.12)", label: "C — Average" },
  D: { color: "#FF9800", bg: "rgba(255,152,0,0.12)",  label: "D — Below Average" },
  F: { color: "#D64F82", bg: "rgba(214,79,130,0.12)", label: "F — Poor" },
  Undefined: { color: "#555", bg: "rgba(85,85,85,0.08)", label: "Unrated" },
};

// Convierte rating 1-5 a label
const RATING_LABELS = { 1: "F", 2: "D–C", 3: "B", 4: "A", 5: "S" };

export const TierList = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [games, setGames]       = useState([]);
  const [myVotes, setMyVotes]   = useState({}); // { game_tier_id: { id, rating } }
  const [loading, setLoading]   = useState(true);
  const [voting, setVoting]     = useState(null); // game_id being voted
  const [msg, setMsg]           = useState(null);
  const [filter, setFilter]     = useState("all"); // "all" | tier letter

  // ── Cargar todos los juegos (público) ──
  const loadGames = async () => {
    const res  = await fetch(`${API}/api/games`);
    const data = await res.json();
    setGames(Array.isArray(data) ? data : []);
  };

  // ── Cargar mis votos si está logueado ──
  const loadMyVotes = async () => {
    if (!store.isAuthenticated) return;
    const token = sessionStorage.getItem("token");
    const res   = await fetch(`${API}/api/user/game-tiers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const votes = await res.json();
    // Indexar por game_tier_id para acceso rápido
    const map = {};
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

  // ── Votar ──
  const handleVote = async (game, rating) => {
    if (!store.isAuthenticated) { navigate("/login"); return; }

    const tierId    = game.game_tier?.id;
    const existing  = myVotes[tierId];
    const token     = sessionStorage.getItem("token");
    setVoting(game.id);

    try {
      let res;
      if (existing) {
        // Actualizar voto
        res = await fetch(`${API}/api/user/game-tiers/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rating }),
        });
      } else {
        // Crear voto
        res = await fetch(`${API}/api/user/game-tiers`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ game_id: game.id, rating }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Vote failed");

      setMsg({ type: "ok", text: `Voted ${rating}/5 for ${game.title} ✅` });
      setTimeout(() => setMsg(null), 2500);

      // Recargar datos frescos
      await Promise.all([loadGames(), loadMyVotes()]);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setVoting(null);
    }
  };

  // ── Eliminar voto ──
  const handleDeleteVote = async (game) => {
    if (!store.isAuthenticated) return;
    const token = sessionStorage.getItem("token");
    setVoting(game.id);
    try {
      const res = await fetch(`${API}/api/user/game-tiers/${game.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not remove vote");
      setMsg({ type: "ok", text: `Vote removed for ${game.title}` });
      setTimeout(() => setMsg(null), 2000);
      await Promise.all([loadGames(), loadMyVotes()]);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setVoting(null);
    }
  };

  // ── Agrupar juegos por tier ──
  const TIER_ORDER = ["S", "A", "B", "C", "D", "F", "Undefined"];

  const grouped = TIER_ORDER.reduce((acc, t) => {
    acc[t] = games.filter((g) => (g.game_tier?.tier || "Undefined") === t);
    return acc;
  }, {});

  const tiersToShow = filter === "all"
    ? TIER_ORDER.filter((t) => grouped[t].length > 0)
    : [filter];

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner-border text-light" />
    </div>
  );

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* ── HEADER ── */}
        <div style={{ paddingTop: 56, paddingBottom: 32, borderBottom: "1px solid #1e2235" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 52, fontWeight: 800, color: C.green, margin: 0, letterSpacing: "-0.03em" }}>
                Global Tier List
              </h1>
              <p style={{ color: "#888", fontSize: 16, margin: "8px 0 0" }}>
                Community rankings — {games.length} games rated by players worldwide
                {!store.isAuthenticated && (
                  <span style={{ color: C.pink, marginLeft: 8 }}>
                    · <Link to="/login" style={{ color: C.pink }}>Log in</Link> to vote
                  </span>
                )}
              </p>
            </div>

            {/* Filtro por tier */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => setFilter("all")}
                style={{
                  background: filter === "all" ? C.green : "transparent",
                  color: filter === "all" ? "#000" : "#888",
                  border: "1px solid " + (filter === "all" ? C.green : "#333"),
                  borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}
              >
                All
              </button>
              {TIER_ORDER.filter((t) => t !== "Undefined" && grouped[t]?.length > 0).map((t) => (
                <button key={t}
                  onClick={() => setFilter(t === filter ? "all" : t)}
                  style={{
                    background: filter === t ? TIER_META[t].color : "transparent",
                    color: filter === t ? "#000" : TIER_META[t].color,
                    border: "1px solid " + TIER_META[t].color,
                    borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TIER ROWS ── */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 32 }}>
          {tiersToShow.map((tier) => {
            if (!grouped[tier] || grouped[tier].length === 0) return null;
            const meta = TIER_META[tier];
            return (
              <div key={tier}>
                {/* Tier label */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                    background: meta.bg, border: "2px solid " + meta.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 800, color: meta.color,
                  }}>
                    {tier === "Undefined" ? "?" : tier}
                  </div>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontSize: 14, color: "#555", marginLeft: 12 }}>{grouped[tier].length} game{grouped[tier].length !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ flex: 1, height: 1, background: meta.color + "33", marginLeft: 8 }} />
                </div>

                {/* Game cards */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                  {grouped[tier].map((game) => {
                    const tierId   = game.game_tier?.id;
                    const myVote   = myVotes[tierId];
                    const isVoting = voting === game.id;

                    return (
                      <div key={game.id} style={{
                        width: 180, background: "#0f1120",
                        border: "1px solid " + (myVote ? meta.color : "#1e2235"),
                        borderRadius: 10, overflow: "hidden", flexShrink: 0,
                        boxShadow: myVote ? `0 0 10px ${meta.color}44` : "none",
                        transition: "box-shadow 0.2s",
                      }}>
                        {/* Cover */}
                        <Link to={`/games/${game.id}`} style={{ display: "block", textDecoration: "none" }}>
                          <div style={{ width: "100%", height: 110, overflow: "hidden", background: "#1a1c2e" }}>
                            {game.cover_img_url
                              ? <img src={game.cover_img_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 32 }}>🎮</div>
                            }
                          </div>
                          <div style={{ padding: "8px 10px 4px" }}>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, lineHeight: 1.3,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {game.title}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                              <span style={{ color: meta.color, fontSize: 18, fontWeight: 800 }}>
                                {game.game_tier?.tier === "Undefined" ? "—" : game.game_tier?.tier}
                              </span>
                              <span style={{ color: "#666", fontSize: 12 }}>
                                {game.game_tier?.average_rating > 0
                                  ? `${game.game_tier.average_rating.toFixed(1)} · ${game.game_tier.vote_count}v`
                                  : "No votes"}
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Voting */}
                        <div style={{ padding: "6px 10px 10px", borderTop: "1px solid #1e2235" }}>
                          {store.isAuthenticated ? (
                            <>
                              <div style={{ fontSize: 11, color: "#555", marginBottom: 5 }}>
                                {myVote ? `Your vote: ${myVote.rating}/5` : "Rate this game:"}
                              </div>
                              <div style={{ display: "flex", gap: 4 }}>
                                {[1, 2, 3, 4, 5].map((r) => (
                                  <button key={r}
                                    disabled={isVoting}
                                    onClick={() => handleVote(game, r)}
                                    style={{
                                      flex: 1, height: 26,
                                      background: myVote?.rating === r ? meta.color : "#1a1c2e",
                                      color: myVote?.rating === r ? "#000" : "#666",
                                      border: "1px solid " + (myVote?.rating === r ? meta.color : "#2a2c3e"),
                                      borderRadius: 4, fontSize: 11, fontWeight: 700,
                                      cursor: isVoting ? "not-allowed" : "pointer",
                                      transition: "all 0.15s",
                                    }}
                                    title={`Rate ${r}/5 (${RATING_LABELS[r]})`}
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                              {myVote && (
                                <button
                                  onClick={() => handleDeleteVote(game)}
                                  disabled={isVoting}
                                  style={{
                                    marginTop: 5, width: "100%", background: "transparent",
                                    border: "1px solid #2a2c3e", borderRadius: 4,
                                    color: "#555", fontSize: 10, cursor: "pointer", padding: "3px 0"
                                  }}
                                >
                                  remove vote
                                </button>
                              )}
                            </>
                          ) : (
                            <Link to="/login" style={{
                              display: "block", textAlign: "center", fontSize: 11,
                              color: C.pink, padding: "4px 0", textDecoration: "none"
                            }}>
                              Log in to vote →
                            </Link>
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
          <div style={{ textAlign: "center", paddingTop: 80, color: "#555" }}>
            <p style={{ fontSize: 18 }}>No games yet. Check back soon!</p>
            <Link to="/games" style={{ color: C.green }}>Browse Games →</Link>
          </div>
        )}
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          padding: "12px 24px", borderRadius: 8,
          background: msg.type === "error" ? "#AD0003" : C.green,
          color: msg.type === "error" ? "#fff" : "#000",
          fontSize: 15, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {msg.text}
        </div>
      )}
    </div>
  );
};
