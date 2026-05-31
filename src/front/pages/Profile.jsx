import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import html2canvas from "html2canvas";
import { ImageUploader } from "../components/ImageUploader";
import { rakkiToast } from "../components/RakkiToast";
import RakkiWaving from "../assets/img/Rakki_Waving_Sticker.png";

const API = import.meta.env.VITE_BACKEND_URL || "";

const STATUS = {
  playing: { label: "Playing" },
  want_to_play: { label: "Pending" },
  completed: { label: "Completed" },
  dropped: { label: "Dropped" },
};

const statusClass = (s) => s || "";

const SOCIAL = {
  instagram: {
    label: "Instagram", baseUrl: "https://instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  twitch: {
    label: "Twitch", baseUrl: "https://twitch.tv/",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  twitter: { icon: "𝕏", label: "Twitter / X", baseUrl: "https://twitter.com/" },
  website: {
    label: "Sitio Web", baseUrl: "",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
};

const Stars = ({ rating = 0, onRate }) => (
  <div className="gs-stars" onClick={onRate ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i}
        className={`gs-star${i < rating ? " on" : ""}`}
        onClick={onRate ? (e) => { e.preventDefault(); e.stopPropagation(); onRate(i + 1); } : undefined}
      >★</span>
    ))}
  </div>
);

const LibraryCard = ({ entry, openDropdown, setOpenDropdown, updateStatus, toggleFavorite, updateRating, navigate }) => {
  const g = entry.game;
  const btn = STATUS[entry.status] || { label: "—" };
  const sc = statusClass(entry.status);
  const isOpen = openDropdown === entry.id;

  return (
    <div
      onClick={() => navigate(`/games/${g.id}`)}
      className={`gs-library-card${sc ? ` gs-border-${sc} gs-glow-${sc}` : ""}${entry.status === "dropped" ? " dropped" : ""}${isOpen ? " is-open" : ""}`}
    >
      <div className="gs-library-card__cover">
        {g?.cover_img_url && <img src={g.cover_img_url} alt="" />}
        <button
          className="gs-library-card__heart"
          onClick={(e) => toggleFavorite(g.id, e)}
          title={entry.is_favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {entry.is_favorite ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="gs-library-card__body">
        <span className="gs-library-card__title">{g?.title}</span>
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
                  {entry.status === key ? <span className="gs-check">✓</span> : <span className="gs-spacer" />}
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", description: "", redes: {}, avatar_url: "" });
  const [libraryFilter, setLibraryFilter] = useState("");
  const [playingOverflow, setPlayingOverflow] = useState(null);
  const [favOverflow, setFavOverflow] = useState(null);

  const STATUS_ORDER = ["playing", "want_to_play", "completed", "dropped"];
  const statusPriority = (s) => STATUS_ORDER.indexOf(s) >= 0 ? STATUS_ORDER.indexOf(s) : 99;

  const setRedesField = (key, value) =>
    setEditForm(prev => ({ ...prev, redes: { ...prev.redes, [key]: value } }));

  const cardRef = useRef(null);
  const playingGridRef = useRef(null);
  const favGridRef = useRef(null);

  const checkOverflow = (ref, setter) => {
    if (ref.current) setter(ref.current.scrollWidth > ref.current.clientWidth);
  };

  const fetchProfile = async () => {
    const resp = await fetch(`${API}/api/private`, {
      headers: { Authorization: `Bearer ${store.token}` },
    });
    if (!resp.ok) throw new Error("Failed to load profile");
    setProfile(await resp.json());
  };

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

  const stripBaseUrl = (fullUrl, baseUrl) => {
    if (!fullUrl || !baseUrl) return fullUrl || "";
    return fullUrl.startsWith(baseUrl) ? fullUrl.slice(baseUrl.length) : fullUrl;
  };

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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ username: "", description: "", redes: {}, avatar_url: "" });
  };

  const handleSaveEdit = async () => {
    if (!profile?.id) return;
    try {
      // Actualizar username si cambió
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
        // ── Sincronizar username en store y sessionStorage ──
        const updatedUser = { ...store.user, username: editForm.username };
        dispatch({ type: "set_auth", payload: { token: store.token, user: updatedUser } });
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }

      const redesFull = {};
      Object.entries(editForm.redes).forEach(([key, val]) => {
        const base = SOCIAL[key]?.baseUrl || "";
        redesFull[key] = val ? base + val : "";
      });
      await saveProfile({ description: editForm.description, redes: redesFull, avatar_url: editForm.avatar_url });

      // Sincronizar avatar en store si cambió
      if (editForm.avatar_url && editForm.avatar_url !== store.user?.profile?.avatar_url) {
        const updatedUser = { ...store.user, profile: { ...store.user?.profile, avatar_url: editForm.avatar_url } };
        dispatch({ type: "set_auth", payload: { token: store.token, user: updatedUser } });
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setIsEditing(false);
      rakkiToast.success("Profile updated!");
    } catch (err) {
      rakkiToast.error(err.message);
    }
  };

  useEffect(() => {
    (async () => {
      try { await fetchProfile(); } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!openDropdown) return;
    const handler = () => setOpenDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openDropdown]);

  const avatarUrl = profile?.profile?.avatar_url ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || "Gamer"}`;

  const games = profile?.game_lists?.[0]?.games || [];
  const redes = profile?.profile?.redes || {};
  const playing = games.filter((g) => g.status === "playing");
  const favorites = games.filter((g) => g.is_favorite);
  const completed = games.filter((g) => g.status === "completed").length;
  const pending = games.filter((g) => g.status === "want_to_play").length;

  useEffect(() => { checkOverflow(playingGridRef, setPlayingOverflow); }, [playing]);
  useEffect(() => { checkOverflow(favGridRef, setFavOverflow); }, [favorites]);
  useEffect(() => {
    const onResize = () => {
      checkOverflow(playingGridRef, setPlayingOverflow);
      checkOverflow(favGridRef, setFavOverflow);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <img src={RakkiWaving} alt="Rakki" width={180} className="d-block mx-auto" />
        <p className="text-white-50 mt-3">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-vh-100 py-5">
      <div className="container">
        <div className="d-flex flex-column align-items-center">
          <img src={RakkiWaving} alt="Rakki" width={160} className="d-block mx-auto" />
          <p className="text-white-50 mt-2 mb-3">Something went wrong</p>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    </div>
  );

  // ── FUNCIONES ──────────────────────────────────────────────
  const updateStatus = async (entryId, newStatus) => {
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
      rakkiToast.success("Status updated!");
    } catch (err) { rakkiToast.error(err.message); }
  };

  const toggleFavorite = async (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const resp = await fetch(`${API}/api/favorite/change`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (!resp.ok) throw new Error("Error updating favorite");
      await fetchProfile();
      rakkiToast.favoriteAdd("Favorite updated!");
    } catch (err) { rakkiToast.error(err.message); }
  };

  const updateRating = async (entryId, rating) => {
    try {
      const resp = await fetch(`${API}/api/user/games/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
        body: JSON.stringify({ rating }),
      });
      if (!resp.ok) throw new Error("Error updating rating");
      await fetchProfile();
      rakkiToast.success("Rating saved!");
    } catch (err) { rakkiToast.error(err.message); }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0D0F1F", scale: 2, useCORS: true, logging: false,
      });
      const link = document.createElement("a");
      link.download = `profile-${profile?.username || "gamer"}.png`;
      link.href = canvas.toDataURL();
      link.click();
      rakkiToast.success("Screenshot downloaded!");
    } catch { rakkiToast.error("Error generating screenshot"); }
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="gs-profile-page gs-page-bg">
      <div className="gs-profile-inner">
        <div ref={cardRef} className="gs-profile-card mt-4 mt-md-5">

          {/* ── CABECERA ── */}
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

            {/* Izquierda: avatar + detalles + redes */}
            <div className="d-flex align-items-start gap-3 flex-wrap flex-grow-1">
              {/* Avatar */}
              <div className="gs-avatar-wrap flex-shrink-0">
                <img src={avatarUrl} alt="" className="gs-profile-avatar" />
              </div>

              {/* Username + desc + form edición */}
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                {isEditing ? (
                  <>
                    <input
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="gs-profile-input gs-profile-input--xl mb-2"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="gs-profile-textarea gs-profile-textarea--lg"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="gs-upload-wrap mt-2">
                      <ImageUploader
                        label="Avatar"
                        currentUrl={editForm.avatar_url || avatarUrl}
                        shape="circle"
                        previewWidth={100}
                        onUpload={(url) => setEditForm((prev) => ({ ...prev, avatar_url: url }))}
                      />
                    </div>
                    <div className="d-flex flex-column gap-2 mt-3" style={{ maxWidth: "29.9375rem" }}>
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
                    <div className="d-flex gap-3 mt-3">
                      <button onClick={handleSaveEdit} className="btn-gs btn-green">Save</button>
                      <button onClick={handleCancelEdit} className="btn-gs btn-ghost">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="gs-profile-username">{profile?.username}</h1>
                    {profile?.profile?.description && (
                      <p className="gs-profile-desc mb-0">{profile.profile.description}</p>
                    )}
                  </>
                )}
              </div>

              {/* Redes sociales */}
              {Object.entries(SOCIAL).some(([k]) => redes[k]) && (
                <div className="d-flex flex-column gap-2 flex-shrink-0">
                  {Object.entries(SOCIAL).map(([key, s]) => {
                    const url = redes[key];
                    if (!url) return null;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" title={s.label} className="gs-social-icon">
                        {s.icon}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Derecha: stats + botones */}
            <div className="text-end flex-shrink-0">
              <div className="d-flex gap-4 justify-content-end">
                <span className="gs-profile-stat text-green">{completed}</span>
                <span className="gs-profile-stat text-purple">{pending}</span>
              </div>
              <div className="d-flex gap-4 justify-content-end small fw-bold">
                <span>Completed</span>
                <span>Pending</span>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button onClick={handleStartEdit} className="gs-round-btn" title="Edit profile">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button onClick={handleShare} className="gs-round-btn" title="Share profile">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── JUGANDO AHORA ── */}
          {playing.length > 0 && (
            <>
              <h2 className="gs-section-title purple gs-graffiti-title gs-spray-pink">Currently Playing</h2>
              <div className="gs-carousel-wrap">
                {playingOverflow === true && (
                  <button className="gs-carousel-btn gs-carousel-btn--left"
                    onClick={() => playingGridRef.current?.scrollBy({ left: -300, behavior: "smooth" })}>‹</button>
                )}
                <div className="gs-playing-grid gs-carousel-grid" ref={playingGridRef}>
                {playing.map((entry) => {
                  const g = entry.game;
                  return (
                    <Link key={entry.id} to={`/games/${g.id}`} className="gs-playing-card">
                      <div className="gs-playing-card__cover">
                        {g?.cover_img_url && <img src={g.cover_img_url} alt="" />}
                      </div>
                      <div className="gs-playing-card__body">
                        <div className="gs-playing-card__title">{g?.title}</div>
                        <div className="gs-playing-card__rating">{g?.genres?.slice(0, 2).join(", ") || "—"}</div>
                        <div className="gs-playing-card__meta">
                          {g?.game_tier ? `★${g.game_tier.average_rating.toFixed(1)} | ${g.game_tier.vote_count}v` : ""}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {playingOverflow === true && (
                <button className="gs-carousel-btn gs-carousel-btn--right"
                  onClick={() => playingGridRef.current?.scrollBy({ left: 300, behavior: "smooth" })}>›</button>
              )}
            </div>
        </>
          )}

        {/* ── FAVORITOS ── */}
        {favorites.length > 0 && (
          <>
            <h2 className="gs-section-title pink gs-graffiti-title">Favorite Games</h2>
            <div className="gs-carousel-wrap">
              {favOverflow === true && (
                <button className="gs-carousel-btn gs-carousel-btn--left"
                  onClick={() => favGridRef.current?.scrollBy({ left: -300, behavior: "smooth" })}>‹</button>
              )}
              <div className="gs-fav-grid gs-carousel-grid" ref={favGridRef}>
                {favorites.map((entry) => {
                  const g = entry.game;
                  return (
                    <div key={entry.id} onClick={() => navigate(`/games/${g.id}`)} className="gs-fav-card">
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
              {favOverflow === true && (
                <button className="gs-carousel-btn gs-carousel-btn--right"
                  onClick={() => favGridRef.current?.scrollBy({ left: 300, behavior: "smooth" })}>›</button>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {playing.length === 0 && favorites.length === 0 && (
          <div className="text-center py-4">
            <img src={RakkiWaving} alt="Rakki" width={120} className="d-block mx-auto" />
            <p className="text-white-50 mt-2">No games in your profile yet</p>
            <span className="gs-rakki-tag">Rakki says: start playing!</span>
          </div>
        )}
      </div>

      {/* ── BIBLIOTECA ── */}
      <h2 className="gs-library-title gs-graffiti-title">My Library</h2>
      {games.length === 0 ? (
        <div className="text-center py-4">
          <img src={RakkiWaving} alt="Rakki" width={120} className="d-block mx-auto" />
          <span className="gs-rakki-tag">You haven't added any games yet</span>
        </div>
      ) : (
        <>
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
          <div className="gs-library-grid">
            {games
              .filter((g) => !libraryFilter || libraryFilter === "all" || g.status === libraryFilter)
              .sort((a, b) => statusPriority(a.status) - statusPriority(b.status))
              .map((entry) => (
                <LibraryCard
                  key={entry.id}
                  entry={entry}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  updateStatus={updateStatus}
                  toggleFavorite={toggleFavorite}
                  updateRating={updateRating}
                  navigate={navigate}
                />
              ))}
          </div>
        </>
      )}
    </div>
    </div >
  );
};
