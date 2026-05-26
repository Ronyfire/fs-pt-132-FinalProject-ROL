import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import html2canvas from "html2canvas";
import { ImageUploader } from "../components/ImageUploader";
import Rakki from "../components/Rakki";
import RakkiPng from "../assets/img/RakkiTEST.png";
const API = import.meta.env.VITE_BACKEND_URL || "";
// Opciones de estado del juego
// Los colores viven en CSS: gs-border-{key} / gs-text-{key}
const STATUS = {
  playing: { label: "Playing" },
  want_to_play: { label: "Pending" },
  completed: { label: "Completed" },
  dropped: { label: "Dropped" },
};
// Devuelve el sufijo CSS para una clave de estado
const statusClass = (s) => s || "";
// Redes sociales con iconos SVG
// El input social solo acepta el nombre de usuario; baseUrl se agrega al guardar
const SOCIAL = {
  instagram: {
    label: "Instagram",
    baseUrl: "https://instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  twitch: {
    label: "Twitch",
    baseUrl: "https://twitch.tv/",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  twitter: { icon: "𝕏", label: "Twitter / X", baseUrl: "https://twitter.com/" },
  website: {
    label: "Sitio Web",
    baseUrl: "",  // URL libre, sin prefijo
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
};
// Componente de estrellas
const Stars = ({ rating = 0, onRate }) => (
  <div className="gs-stars" onClick={onRate ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i}
        className={`gs-star${i < rating ? " on" : ""}`}
        onClick={onRate ? (e) => { e.preventDefault(); e.stopPropagation(); onRate(i + 1); } : undefined}
        style={onRate ? { cursor: "pointer" } : {}}
      >★</span>
    ))}
  </div>
);
// Subcomponente para cada tarjeta de biblioteca
const LibraryCard = ({ entry, openDropdown, setOpenDropdown, updateStatus, toggleFavorite, updateRating, navigate }) => {
  const g = entry.game;
  const btn = STATUS[entry.status] || { label: "—" };
  const sc = statusClass(entry.status);
  const isDropped = entry.status === "dropped";
  const isOpen = openDropdown === entry.id;
  return (
    <div onClick={() => navigate(`/games/${g.id}`)}
      className={`gs-library-card${sc ? ` gs-border-${sc} gs-glow-${sc}` : ""}${isDropped ? " dropped" : ""}`}
      style={{ cursor: "pointer" }}
    >
      <div className="gs-library-card__cover">
        {g?.cover_img_url && <img src={g.cover_img_url} alt="" />}
        <button className="gs-library-card__heart"
          onClick={(e) => toggleFavorite(g.id, e)}
          title={entry.is_favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {entry.is_favorite ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="gs-library-card__body">
        <div className="gs-library-card__header">
          <span className="gs-library-card__title">{g?.title}</span>
        </div>
        <span className="gs-library-card__score">{g?.genres?.slice(0, 2).join(", ") || "—"}</span>
        <div onClick={(e) => e.stopPropagation()} className="gs-status-wrap">
          <div
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDropdown(isOpen ? null : entry.id); }}
            className={`gs-status-trigger gs-border-${sc}`}
          >
            <span className={`gs-status-label gs-text-${sc}`}>{btn.label}</span>
            <span className={`gs-status-arrow gs-text-${sc}`}>▾</span>
          </div>
          {isOpen && (
            <div className="gs-status-menu">
              {Object.entries(STATUS).map(([key, opt]) => (
                <button key={key}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateStatus(entry.id, key); }}
                  className={`gs-status-option gs-text-${statusClass(key)}${entry.status === key ? " active" : ""}`}
                >
                  {entry.status === key && <span className="gs-check">✓</span>}
                  {entry.status !== key && <span className="gs-spacer" />}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Stars rating={entry.rating} onRate={(val) => updateRating(entry.id, val)} />
      </div>
    </div>
  );
};
export const Profile = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", description: "", redes: {}, avatar_url: "" });
  const [libraryFilter, setLibraryFilter] = useState("");
  // Orden de prioridad para mostrar juegos en la biblioteca
  const STATUS_ORDER = ["playing", "want_to_play", "completed", "dropped"];
  const statusPriority = (s) => STATUS_ORDER.indexOf(s) >= 0 ? STATUS_ORDER.indexOf(s) : 99;
  const setRedesField = (key, value) => {
    setEditForm(prev => ({ ...prev, redes: { ...prev.redes, [key]: value } }));
  };
  const cardRef = useRef(null);
  const playingGridRef = useRef(null);
  const favGridRef = useRef(null);
  // Obtener datos del perfil desde el backend
  const fetchProfile = async () => {
    const resp = await fetch(`${API}/api/private`, {
      headers: { Authorization: `Bearer ${store.token}` },
    });
    if (!resp.ok) throw new Error("Failed to load profile");
    setProfile(await resp.json());
  };
  // Guardar cambios del perfil (descripción, redes sociales, etc.)
  const saveProfile = async (data) => {
    if (!profile?.id) throw new Error("Profile not loaded yet");
    const resp = await fetch(`${API}/api/users/${profile.id}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      throw new Error(`Error ${resp.status}: ${body || resp.statusText}`);
    }
    await fetchProfile();
  };
  // Quitar el prefijo baseUrl para mostrar solo el nombre en modo edición
  const stripBaseUrl = (fullUrl, baseUrl) => {
    if (!fullUrl || !baseUrl) return fullUrl || "";
    return fullUrl.startsWith(baseUrl) ? fullUrl.slice(baseUrl.length) : fullUrl;
  };
  // Iniciar modo edición con los valores actuales
  const handleStartEdit = () => {
    const currentRedes = profile?.profile?.redes || {};
    const redesForEdit = {};
    Object.entries(SOCIAL).forEach(([key, s]) => {
      redesForEdit[key] = stripBaseUrl(currentRedes[key], s.baseUrl);
    });
    setEditForm({
      username: profile?.username || "",
      description: profile?.profile?.description || "",
      redes: redesForEdit,
      avatar_url: profile?.profile?.avatar_url || "",
    });
    setIsEditing(true);
  };
  // Cancelar edición sin guardar
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ username: "", description: "", redes: {}, avatar_url: "" });
  };
  // Guardar cambios de username, descripción y redes
  const handleSaveEdit = async () => {
    if (!profile?.id) return;
    setStatusMsg({ type: "ok", text: "Saving..." });
    try {
      if (editForm.username !== profile.username) {
        const userResp = await fetch(`${API}/api/users/${profile.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
          body: JSON.stringify({ username: editForm.username }),
        });
        if (!userResp.ok) {
          const errBody = await userResp.text().catch(() => "");
          throw new Error(`Error updating username: ${userResp.status} ${errBody}`);
        }
      }
      // Construir URLs completas: baseUrl + nombre de perfil
      const redesFull = {};
      Object.entries(editForm.redes).forEach(([key, val]) => {
        const base = SOCIAL[key]?.baseUrl || "";
        redesFull[key] = val ? base + val : "";
      });
      await saveProfile({ description: editForm.description, redes: redesFull, avatar_url: editForm.avatar_url });
      // Sincronizar avatar en el store global
      if (editForm.avatar_url && editForm.avatar_url !== store.user?.profile?.avatar_url) {
        dispatch({
          type: "set_auth",
          payload: {
            token: store.token,
            user: { ...store.user, profile: { ...store.user?.profile, avatar_url: editForm.avatar_url } },
          },
        });
      }
      setIsEditing(false);
      setStatusMsg({ type: "ok", text: "Profile updated ✅" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };
  // Cargar perfil al montar el componente
  useEffect(() => {
    (async () => {
      try { await fetchProfile(); } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    if (!openDropdown) return;
    const handler = () => { setOpenDropdown(null); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openDropdown]);
  // ─────────────── ESTADOS DE CARGA Y ERROR ───────────────
  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <Rakki pose="searching" size="lg" text="Loading profile..." />
    </div>
  );
  if (error) return (
    <div className="min-vh-100 py-5">
      <div className="container">
        <div className="d-flex flex-column align-items-center">
          <div className="rakki-wrapper rakki-lg" style={{ width: 180 }}>
            <img src={RakkiPng} alt="Rakki" style={{ width: '100%', height: 'auto', display: 'block' }} />
            <p className="rakki-caption">Something went wrong</p>
          </div>
          <div className="alert alert-danger mt-3">{error}</div>
        </div>
      </div>
    </div>
  );
  // ─────────────── FUNCIONES ───────────────
  // Actualizar estado del juego en la biblioteca
  const updateStatus = async (entryId, newStatus) => {
    setStatusMsg({ type: "ok", text: "Updating..." });
    try {
      const resp = await fetch(`${API}/api/user/games/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`Error ${resp.status}: ${body || resp.statusText}`);
      }
      setOpenDropdown(null);
      await fetchProfile();
      setStatusMsg({ type: "ok", text: "Status updated ✅" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };
  // Alternar favorito para un juego de la biblioteca
  const toggleFavorite = async (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setStatusMsg({ type: "ok", text: "Updating..." });
    try {
      const resp = await fetch(`${API}/api/favorite/change`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (!resp.ok) throw new Error("Error updating favorite");
      await fetchProfile();
      setStatusMsg({ type: "ok", text: "Favorite updated ✅" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };
  // Actualizar rating de un juego (favoritos y biblioteca)
  const updateRating = async (entryId, rating) => {
    setStatusMsg({ type: "ok", text: "Saving rating..." });
    try {
      const resp = await fetch(`${API}/api/user/games/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
        body: JSON.stringify({ rating }),
      });
      if (!resp.ok) throw new Error("Error updating rating");
      await fetchProfile();
      setStatusMsg({ type: "ok", text: "Rating updated ✅" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };
  // Capturar tarjeta de perfil con html2canvas y descargar
  const handleShare = async () => {
    if (!cardRef.current) return;
    setStatusMsg({ type: "ok", text: "Generating screenshot..." });
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0D0F1F",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `profile-${profile?.username || "gamer"}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setStatusMsg({ type: "ok", text: "Screenshot downloaded ✅" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "error", text: "Error generating screenshot" });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };
  // ─────────────── DATOS DERIVADOS ───────────────
  const avatarUrl = profile?.profile?.avatar_url ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || "Gamer"}`;
  const games = profile?.game_lists?.[0]?.games || [];
  const redes = profile?.profile?.redes || {};
  const playing = games.filter((g) => g.status === "playing");
  const favorites = games.filter((g) => g.is_favorite);
  const completed = games.filter((g) => g.status === "completed").length;
  const pending = games.filter((g) => g.status === "want_to_play").length;
  // ─────────────── RENDERIZADO ───────────────
  return (
    <div className="gs-profile-page">
      <div className="gs-profile-inner">
        <div ref={cardRef} className="gs-profile-card mt-5 w-100">
          {/* ── CABECERA: Avatar + Usuario/Desc + Redes + Stats ── */}
          <div className="gs-profile-header">
            {/* Grupo izquierdo: Avatar + Usuario + Redes */}
            <div className="gs-profile-header-left">
              {/* Avatar */}
              <div className="gs-avatar-wrap">
                <img src={avatarUrl} alt="" className="gs-profile-avatar" />
              </div>
              {/* Usuario + Descripción */}
              <div className="gs-profile-details">
                {isEditing ? (
                  <>
                    <input
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="gs-profile-input gs-profile-input--xl"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="gs-profile-textarea gs-profile-textarea--lg"
                      placeholder="Tell us about yourself..."
                    />
                    {/* Subida de avatar con Cloudinary */}
                    <div className="gs-upload-wrap">
                      <ImageUploader
                        label="Avatar"
                        currentUrl={editForm.avatar_url || avatarUrl}
                        shape="circle"
                        previewWidth={100}
                        onUpload={(url) => setEditForm((prev) => ({ ...prev, avatar_url: url }))}
                      />
                    </div>
                    {/* Inputs de redes sociales */}
                    <div className="gs-social-edit-group">
                      {Object.entries(SOCIAL).map(([key, s]) => (
                        <div key={key} className="gs-social-edit-row">
                          <span className="gs-social-edit-icon">{s.icon}</span>
                          <input
                            value={editForm.redes[key] || ""}
                            onChange={(e) => setRedesField(key, e.target.value)}
                            placeholder={s.baseUrl ? "username" : "https://..."}
                            className="gs-social-edit-input"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="gs-edit-actions">
                      <button onClick={handleSaveEdit} className="btn-gs btn-green">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="btn-gs btn-ghost">
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="gs-profile-username">{profile?.username}</h1>
                    {profile?.profile?.description && (
                      <div className="font-varela gs-profile-desc">
                        {profile.profile.description}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Redes sociales — solo mostrar si existe URL */}
              {Object.entries(SOCIAL).some(([k]) => redes[k]) && (
                <div className="gs-social-col">
                  {Object.entries(SOCIAL).map(([key, s]) => {
                    const url = redes[key];
                    if (!url) return null;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" title={s.label}
                        className="gs-social-icon"
                      >
                        {s.icon}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Estadísticas */}
            <div className="gs-profile-stats">
              <div className="gs-stats-row">
                <span className="gs-profile-stat text-green">{completed}</span>
                <span className="gs-profile-stat text-purple">{pending}</span>
              </div>
              <div className="gs-stats-label">
                <span>Completed</span>
                <span>Pending</span>
              </div>
              {/* Botones de acción */}
              <div className="gs-profile-btns">
                <button onClick={handleStartEdit} className="gs-round-btn" title="Edit profile">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button onClick={handleShare} className="gs-round-btn" title="Share profile">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* ── Jugando ahora ── */}
          {playing.length > 0 && (
            <>
              <h2 className="gs-section-title purple">Currently Playing</h2>
              <div className="gs-carousel-wrap">
                <button className="gs-carousel-btn gs-carousel-btn--left"
                  onClick={() => playingGridRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                >‹</button>
                <div className="gs-playing-grid gs-carousel-grid" ref={playingGridRef}>
                  {playing.slice(0, 5).map((entry) => {
                    const g = entry.game;
                    return (
                      <Link key={entry.id} to={`/games/${g.id}`} className="gs-playing-card">
                        <div className="gs-playing-card__cover">
                          {g?.cover_img_url && <img src={g.cover_img_url} alt="" />}
                        </div>
                        <div className="gs-playing-card__body">
                          <div className="gs-playing-card__title">{g?.title}</div>
                          <div className="gs-playing-card__rating">
                            {g?.game_tier?.average_rating?.toFixed(1) || "—"}
                          </div>
                          <div className="gs-playing-card__meta">
                            {g?.game_tier ? `★${g.game_tier.average_rating.toFixed(1)} | U: ${g.game_tier.vote_count}` : ""}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <button className="gs-carousel-btn gs-carousel-btn--right"
                  onClick={() => playingGridRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                >›</button>
              </div>
            </>
          )}
          {/* ── Juegos favoritos ── */}
          {favorites.length > 0 && (
            <>
              <h2 className="gs-section-title pink">Favorite Games</h2>
              <div className="gs-carousel-wrap">
                <button className="gs-carousel-btn gs-carousel-btn--left"
                  onClick={() => favGridRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                >‹</button>
                <div className="gs-fav-grid gs-carousel-grid" ref={favGridRef}>
                  {favorites.slice(0, 5).map((entry) => {
                    const g = entry.game;
                    return (
                      <div onClick={() => navigate(`/games/${g.id}`)} className="gs-fav-card" style={{ cursor: "pointer" }}>
                        <div className="gs-fav-card__cover">
                          {g?.cover_img_url && <img src={g.cover_img_url} alt="" />}
                        </div>
                        <div className="gs-fav-card__body">
                          <span className="gs-fav-card__title">{g?.title}</span>
                          <span className="gs-fav-card__score">{g?.genres?.slice(0, 2).join(", ") || "—"}</span>
                          <Stars rating={entry.rating} onRate={(val) => updateRating(entry.id, val)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="gs-carousel-btn gs-carousel-btn--right"
                  onClick={() => favGridRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                >›</button>
              </div>
            </>
          )}
          {playing.length === 0 && favorites.length === 0 && (
            <div className="gs-empty">
              <div className="rakki-wrapper rakki-md" style={{ width: 120 }}>
                <img src={RakkiPng} alt="Rakki" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <p className="rakki-caption">No games in your profile yet</p>
              </div>
            </div>
          )}
        </div>
        {/* ══ MI BIBLIOTECA ══ */}
        <h2 className="gs-library-title">My Library</h2>
        {games.length === 0 ? (
          <div className="gs-empty">
            <div className="rakki-wrapper rakki-md" style={{ width: 120 }}>
                <img src={RakkiPng} alt="Rakki" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <p className="rakki-caption">You haven't added any games yet</p>
              </div>
          </div>
        ) : (
          <>
            {/* Botones de filtro */}
            <div className="gs-filter-bar">
              {[{ key: "all", label: "All" }, ...Object.entries(STATUS).map(([k, v]) => ({ key: k, label: v.label }))].map((f) => (
                <button key={f.key}
                  onClick={() => setLibraryFilter(f.key === libraryFilter ? "" : f.key)}
                  className={`gs-filter-btn${libraryFilter === f.key ? " active" : ""}${f.key !== "all" ? ` ${f.key}` : ""}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Juegos ordenados por prioridad de estado */}
            <div className="gs-library-grid">
              {games
                .filter((g) => !libraryFilter || libraryFilter === "all" || g.status === libraryFilter)
                .sort((a, b) => statusPriority(a.status) - statusPriority(b.status))
                .map((entry) => (
                  <LibraryCard key={entry.id} entry={entry} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} updateStatus={updateStatus} toggleFavorite={toggleFavorite} updateRating={updateRating} navigate={navigate} />
                ))}
            </div>
          </>
        )}
        {statusMsg && (
          <div className={`gs-toast ${statusMsg.type === "error" ? "error" : "ok"}`}>
            {statusMsg.type !== "error" && (
              <Rakki pose="celebrating" size="sm" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
