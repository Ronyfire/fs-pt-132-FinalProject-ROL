import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { ImageUploader } from "../components/ImageUploader";

const API = import.meta.env.VITE_BACKEND_URL || "";

// Colores del diseño Figma (dark mode)
const C = {
  green: "#7DD750",
  pink: "#D64F82",
  purple: "#AC4FD6",
  red: "#AD0003",
  bg: "#0D0F1F",
  text: "#F0F0F0",
};

// Estados posibles de un juego en la biblioteca
const STATUS = {
  completed: { label: "Completado", color: C.green },
  playing: { label: "Jugando", color: C.pink },
  want_to_play: { label: "Pendiente", color: C.purple },
  dropped: { label: "Abandonado", color: C.red },
};

// Redes sociales con iconos SVG y estilos Figma
const SOCIAL = {
  instagram: {
    label: "Instagram",
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
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  twitter: { icon: "𝕏", label: "Twitter / X" },
  website: {
    label: "Sitio Web",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
};

// Componente de estrellas para calificación
const Stars = ({ rating = 0 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} style={{ color: i < rating ? C.pink : "#555", fontSize: 24, lineHeight: 1 }}>★</span>
    ))}
  </div>
);

export const Profile = () => {
  const { store } = useGlobalReducer();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", description: "", redes: {} });
  const setRedesField = (key, value) => {
    setEditForm(prev => ({ ...prev, redes: { ...prev.redes, [key]: value } }));
  };

  // Trae los datos del perfil desde el backend
  const fetchProfile = async () => {
    const resp = await fetch(`${API}/api/private`, {
      headers: { Authorization: `Bearer ${store.token}` },
    });
    if (!resp.ok) throw new Error("Failed to load profile");
    setProfile(await resp.json());
  };

  // Guarda cambios en el perfil (descripción, redes, etc.)
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

  // Activa el modo edición con los valores actuales
  const handleStartEdit = () => {
    setEditForm({
      username: profile?.username || "",
      description: profile?.profile?.description || "",
      avatar_url: profile?.profile?.avatar_url || "",  // ← añadido
    });
    setIsEditing(true);
  };

  // Cancela la edición sin guardar
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ username: "", description: "", redes: {} });
  };

  // Guarda los cambios de username, descripción y redes
  const handleSaveEdit = async () => {
    if (!profile?.id) return;
    setStatusMsg({ type: "ok", text: "Guardando..." });
    try {
      if (editForm.username !== profile.username) {
        const userResp = await fetch(`${API}/api/users/${profile.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${store.token}` },
          body: JSON.stringify({ username: editForm.username }),
        });
        if (!userResp.ok) {
          const errBody = await userResp.text().catch(() => "");
          throw new Error(`Error al actualizar username: ${userResp.status} ${errBody}`);
        }
      }
      // Actualizar descripción
      await saveProfile({
        description: editForm.description,
        avatar_url: editForm.avatar_url, // tema avatar con cloudinary
      });
      if (editForm.avatar_url && editForm.avatar_url !== store.user?.profile?.avatar_url) {
        dispatch({ type: "set_auth", payload: { token: store.token, user: { ...store.user, profile: { ...store.user?.profile, avatar_url: editForm.avatar_url } } } });
      }
      setIsEditing(false);
      setStatusMsg({ type: "ok", text: "Perfil actualizado ✅" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // Carga el perfil al montar el componente
  useEffect(() => {
    (async () => {
      try { await fetchProfile(); } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  // Cierra el dropdown al clickear fuera
  useEffect(() => {
    if (!openDropdown) return;
    const handler = () => { setOpenDropdown(null); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openDropdown]);

  // ─────────────── PANTALLAS DE CARGA Y ERROR ───────────────

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: C.bg }}>
      <div className="spinner-border text-light" />
    </div>
  );

  if (error) return (
    <div className="min-vh-100 py-5" style={{ background: C.bg }}>
      <div className="container"><div className="alert alert-danger">{error}</div></div>
    </div>
  );

  // ─────────────── FUNCIONES ───────────────

  // Actualiza el estado de un juego en la biblioteca
  const updateStatus = async (entryId, newStatus) => {
    setStatusMsg({ type: "ok", text: "Actualizando..." });
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
      setStatusMsg({ type: "ok", text: "Estado actualizado ✅" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
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

  // ─────────────── RENDER ───────────────

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1442, margin: "0 auto", padding: "0 59px" }}>
        <div style={{
          marginTop: 60, width: "100%",
          background: C.bg, border: "1px solid " + C.green,
          boxShadow: "0px 4px 15px " + C.green,
          borderRadius: 36, padding: "40px",
          boxSizing: "border-box",
        }}>
          {/* ── HEADER: Avatar + Username/Desc + Redes + Stats ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Grupo izquierdo: Avatar + Username + Redes */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 228, height: 228, borderRadius: 332, overflow: "hidden", flexShrink: 0,
                filter: "drop-shadow(0px 4px 15px " + C.green + ")",
              }}>
                <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

            {/* Username + Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {isEditing ? (
                <>
                  {/* ← Cloudinary */}
                  <div style={{ marginBottom: 20 }}>
                    <ImageUploader
                      label="Avatar"
                      currentUrl={editForm.avatar_url || avatarUrl}
                      shape="circle"
                      previewWidth={100}
                      onUpload={(url) => setEditForm((prev) => ({ ...prev, avatar_url: url }))}
                    />
                  </div>

                  <input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    style={{ fontSize: 64, fontWeight: 700, color: C.green, background: "transparent", border: "none", borderBottom: "2px solid " + C.green, outline: "none", width: "100%", margin: 0, fontFamily: "'Inter', sans-serif", padding: 0 }}
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    style={{ fontFamily: "'Varela Round', sans-serif", fontSize: 24, lineHeight: "150%", color: "#FFEDF4", background: "transparent", border: "none", borderBottom: "2px solid #555", outline: "none", width: "100%", maxWidth: 479, marginTop: 8, resize: "vertical", padding: 0 }}
                    placeholder="Contá algo sobre vos..."
                  />
                  <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                    <button onClick={handleSaveEdit}
                      style={{ background: C.green, color: "#000", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
                    >
                      Guardar
                    </button>
                    <button onClick={handleCancelEdit}
                      style={{ background: "transparent", color: "#FFF", border: "1px solid #555", borderRadius: 8, padding: "10px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: 64, fontWeight: 700, color: C.green, margin: 0 }}>{profile?.username}</h1>
                  {profile?.profile?.description && (
                    <div style={{
                      fontFamily: "'Varela Round', sans-serif", fontSize: 24, lineHeight: "150%",
                      color: "#FFEDF4", maxWidth: 479, marginTop: 8,
                    }}>
                      {profile.profile.description}
                    </div>
                  )}
                </>
              )}
            </div>

              {/* Redes sociales — columna vertical, sin círculos, siempre visibles */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
                {Object.entries(SOCIAL).map(([key, s]) => {
                  const url = redes[key];
                  const iconStyle = {
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36,
                    fontSize: 24, color: "#FFF", textDecoration: "none",
                    transition: "transform 0.15s",
                    opacity: 1,
                    cursor: url ? "pointer" : "default",
                  };
                  return url ? (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" title={s.label}
                      style={iconStyle}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      {s.icon}
                    </a>
                  ) : (
                    <span key={key} title={s.label} style={iconStyle}>
                      {s.icon}
                    </span>
                  );
                })}
              </div>
            </div>

          {/* Stats: Completados / Pendientes + Botón Editar */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 48, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 64, fontWeight: 700, color: C.green }}>{completed}</span>
              <span style={{ fontSize: 64, fontWeight: 700, color: C.purple }}>{pending}</span>
            </div>
            <div style={{ display: "flex", gap: 48, justifyContent: "flex-end", fontSize: 14, fontWeight: 700 }}>
              <span>Completados</span>
              <span>Pendientes</span>
            </div>
            {/* Botón Editar abajo de los stats */}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleStartEdit}
                style={{ width: 48, height: 48, background: C.green, border: "none", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.15s" }}
                title="Editar perfil"
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
            </div>
          </div>
          </div>

          {/* ── Jugando actualmente ── */}
          {playing.length > 0 && (
            <>
              <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em", color: C.purple, margin: "60px 0 24px" }}>
                Jugando actualmente
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, position: "relative" }}>
                {playing.slice(0, 5).map((entry) => {
                  const g = entry.game;
                  return (
                    <Link key={entry.id} to={`/games/${g.id}`}
                      style={{ width: 263, height: 139, background: "rgba(49,38,42,0.39)", borderRadius: 5, display: "flex", padding: 15, textDecoration: "none", gap: 12, flexShrink: 0 }}
                    >
                      <div style={{ width: 100, height: 100, borderRadius: 5, overflow: "hidden", flexShrink: 0, background: "#E3E3E3" }}>
                        {g?.cover_img_url && <img src={g.cover_img_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div>
                        <div style={{ color: C.green, fontSize: 16, marginBottom: 8 }}>{g?.title}</div>
                        <div style={{ color: C.pink, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                          {g?.game_tier?.average_rating?.toFixed(1) || "—"}
                        </div>
                        <div style={{ color: "#FFF", fontSize: 14 }}>
                          {g?.game_tier ? `★${g.game_tier.average_rating.toFixed(1)} | U: ${g.game_tier.vote_count}` : ""}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Juegos favoritos ── */}
          {favorites.length > 0 && (
            <>
              <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em", color: C.pink, margin: "60px 0 24px" }}>
                Juegos favoritos
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {favorites.slice(0, 5).map((entry) => {
                  const g = entry.game;
                  return (
                    <Link key={entry.id} to={`/games/${g.id}`}
                      style={{ width: 250, height: 379, background: C.bg, borderRadius: 8, display: "flex", flexDirection: "column", textDecoration: "none", overflow: "hidden", flexShrink: 0 }}
                    >
                      <div style={{ width: 218, height: 247, overflow: "hidden", background: "#E3E3E3", margin: 16 }}>
                        {g?.cover_img_url && <img src={g.cover_img_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ color: C.green, fontSize: 16 }}>{g?.title}</span>
                        <span style={{ color: C.pink, fontSize: 16, fontWeight: 600 }}>{entry.rating > 0 ? `${entry.rating}/5` : "—"}</span>
                        <Stars rating={entry.rating} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {playing.length === 0 && favorites.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
              <p>Todavía no hay juegos en tu perfil.</p>
            </div>
          )}
        </div>

        {/* ══ MI BIBLIOTECA ══ */}
        <h2 style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.02em", color: C.green, margin: "60px 0 32px" }}>
          Mi Biblioteca
        </h2>

        {games.length === 0 ? (
          <div style={{ color: "#555" }}><p>Todavía no agregaste juegos a tu biblioteca.</p></div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 27 }}>
            {games.map((entry) => {
              const g = entry.game;
              const btn = STATUS[entry.status] || { label: "—", color: "#666" };
              const isDropped = entry.status === "dropped";
              const isOpen = openDropdown === entry.id;
              return (
                <Link key={entry.id} to={`/games/${g.id}`}
                  style={{
                    width: 422, height: 437, flexShrink: 0,
                    background: C.bg, borderRadius: 8,
                    border: isDropped ? "1px solid " + C.red : "1px solid #333",
                    boxShadow: isDropped ? "0px 4px 5.1px #FF0000" : "none",
                    textDecoration: "none", overflow: "visible",
                    display: "flex", flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <div style={{ width: "100%", height: 247, overflow: "hidden", background: "#E3E3E3", position: "relative", borderRadius: "8px 8px 0 0" }}>
                    {g?.cover_img_url && <img src={g.cover_img_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    <div style={{ position: "absolute", top: 0, left: 0, width: 76, height: 75, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {entry.is_favorite ? "❤️" : "🤍"}
                    </div>
                  </div>
                  <div style={{ padding: "16px 2px 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingRight: 14 }}>
                      <span style={{ color: C.green, fontSize: 16 }}>{g?.title}</span>
                      <span style={{ color: C.pink, fontSize: 16, fontWeight: 600 }}>{entry.rating > 0 ? `${entry.rating}/5` : "—"}</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", alignSelf: "flex-start" }}>
                      <div
                        onClick={(e) => { e.preventDefault(); setOpenDropdown(isOpen ? null : entry.id); }}
                        style={{ display: "flex", alignItems: "center", gap: 8, border: "3px solid " + btn.color, borderRadius: 8, padding: "20px 32px", height: 37, background: C.bg, boxSizing: "content-box", cursor: "pointer" }}
                      >
                        <span style={{ color: btn.color, fontSize: 20, fontWeight: 500 }}>{btn.label}</span>
                        <span style={{ color: btn.color, fontSize: 20 }}>▾</span>
                      </div>
                      {isOpen && (
                        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: C.bg, border: "1px solid #444", borderRadius: 8, zIndex: 10, minWidth: 180, overflow: "hidden" }}>
                          {Object.entries(STATUS).map(([key, opt]) => (
                            <div key={key}
                              onClick={(e) => { e.preventDefault(); updateStatus(entry.id, key); }}
                              style={{
                                padding: "12px 32px", cursor: "pointer", borderBottom: "1px solid #222",
                                display: "flex", alignItems: "center", gap: 8, color: opt.color,
                                fontSize: 18, fontWeight: 500,
                                background: entry.status === key ? "rgba(255,255,255,0.05)" : "transparent"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = entry.status === key ? "rgba(255,255,255,0.05)" : "transparent"}
                            >
                              {entry.status === key && <span style={{ fontSize: 14 }}>✓</span>}
                              {entry.status !== key && <span style={{ width: 14 }} />}
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Stars rating={entry.rating} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {statusMsg && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 100,
            padding: "12px 24px", borderRadius: 8,
            background: statusMsg.type === "error" ? "#AD0003" : C.green,
            color: "#FFF", fontSize: 16, fontWeight: 600,
          }}>
            {statusMsg.text}
          </div>
        )}
      </div>
    </div>
  );
};
