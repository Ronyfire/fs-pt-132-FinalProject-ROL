import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API = import.meta.env.VITE_BACKEND_URL || "";
const getToken = () => sessionStorage.getItem("token");

const authFetch = (url, opts = {}) =>
  fetch(`${API}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  });

// ─────────────────────────────────────────────────────────────
// SUGGESTED GAMES
// ─────────────────────────────────────────────────────────────
function SuggestedGames() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    authFetch("/api/admin/addgames")
      .then((r) => r.json())
      .then((d) => setSubmissions(d.submissions || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const decide = async (id, status) => {
    await authFetch(`/api/admin/addgames/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    load();
  };

  if (loading) return <p className="text-center py-5 text-secondary">Loading suggestions...</p>;
  if (!submissions.length) return <p className="text-center py-5 text-secondary">No pending suggestions.</p>;

  return (
    <div className="d-flex flex-column gap-3">
      {submissions.map((s) => {
        const d = s.body || {};
        return (
          <div key={s.id} className="gs-admin-card">
            {/* Cover */}
            {d.cover_img_url ? (
              <img src={d.cover_img_url} alt={d.title} className="gs-admin-cover-img" />
            ) : (
              <div className="gs-admin-cover-empty">No img</div>
            )}

            {/* Info */}
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-baseline gap-2 mb-1 flex-wrap">
                <span className="gs-admin-game-title">{d.title || "Untitled"}</span>
                <span className="text-muted-gs small">
                  by <strong className="text-green">@{s.username || s.user_id}</strong> · {s.created_at?.slice(0, 10)}
                </span>
              </div>

              {d.genres && (
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {(Array.isArray(d.genres) ? d.genres : d.genres.split(",")).map((g, i) => (
                    <span key={i} className="gs-admin-tag">{g.trim()}</span>
                  ))}
                </div>
              )}

              <p className="text-muted-gs small mb-2" style={{ lineHeight: 1.5 }}>
                {d.description?.slice(0, 180)}{d.description?.length > 180 ? "…" : ""}
              </p>

              <div className="text-muted-gs small d-flex flex-wrap gap-3">
                {d.developer && <span><strong className="text-dim">Dev:</strong> {d.developer}</span>}
                {d.publisher && <span><strong className="text-dim">Pub:</strong> {d.publisher}</span>}
                {d.platforms && (
                  <span>
                    <strong className="text-dim">Platforms:</strong>{" "}
                    {Array.isArray(d.platforms) ? d.platforms.join(", ") : d.platforms}
                  </span>
                )}
                {d.release_date && <span><strong className="text-dim">Release:</strong> {d.release_date?.slice(0, 10)}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex flex-column gap-2 flex-shrink-0">
              <button className="btn-gs btn-green" onClick={() => decide(s.id, "approved")}>Approve</button>
              <button className="btn-gs btn-pink-outline" onClick={() => decide(s.id, "rejected")}>Reject</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REPORTED COMMENTS
// ─────────────────────────────────────────────────────────────
function ReportedComments() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    authFetch("/api/admin/reports/comments")
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resolve = async (id) => {
    await authFetch(`/api/admin/reports/${id}/resolve`, { method: "PUT" });
    load();
  };

  const deleteComment = async (id) => {
    if (!confirm("Delete this comment? This action cannot be undone.")) return;
    await authFetch(`/api/admin/reports/${id}/delete-comment`, { method: "DELETE" });
    load();
  };

  if (loading) return <p className="text-center py-5 text-secondary">Loading reports...</p>;
  if (!reports.length) return <p className="text-center py-5 text-secondary">No reported comments.</p>;

  return (
    <div className="d-flex flex-column gap-3">
      {reports.map((r) => (
        <div key={r.id} className="gs-admin-card">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <span className="gs-admin-badge gs-admin-badge--pink">Comment #{r.reported_comment_id}</span>
              <span className="text-muted-gs small">Game #{r.comment_game_id}</span>
            </div>

            <blockquote className="gs-admin-quote">{r.comment_content}</blockquote>

            <div className="text-muted-gs small mt-2">
              Reported by <strong className="text-white">@{r.reporter_username}</strong>
              {" · "}Reason: <em className="text-pink">{r.reason}</em>
            </div>
          </div>

          <div className="d-flex flex-column gap-2 flex-shrink-0">
            <button className="btn-gs btn-ghost" onClick={() => resolve(r.id)}>Ignore</button>
            <button className="btn-gs btn-pink-outline" onClick={() => deleteComment(r.id)}>Delete</button>
            <button
              className="btn-gs btn-ghost"
              style={{ color: "var(--red)", borderColor: "var(--red)" }}
              onClick={async () => {
                const reason = prompt(`Ban reason for @${r.comment_author_username || "this user"}:`);
                if (!reason) return;
                await authFetch(`/api/admin/users/${r.comment_author_id}/ban`, {
                  method: "PUT",
                  body: JSON.stringify({ is_active: false, reason }),
                });
                resolve(r.id);
              }}
            >
              🔨 Ban
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BAN HISTORY
// ─────────────────────────────────────────────────────────────
function ReportedUsers() {
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    authFetch("/api/admin/bans")
      .then((r) => r.json())
      .then((d) => setBans(d.bans || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const unban = async (userId) => {
    await authFetch(`/api/admin/users/${userId}/ban`, {
      method: "PUT",
      body: JSON.stringify({ is_active: true }),
    });
    load();
  };

  const filtered = bans.filter((b) => {
    if (filter === "active") return b.is_active_ban;
    if (filter === "lifted") return !b.is_active_ban;
    return true;
  });

  if (loading) return <p className="text-center py-5 text-secondary">Loading...</p>;

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        {[["all", "All"], ["active", "🔴 Active"], ["lifted", "✅ Lifted"]].map(([val, label]) => (
          <button
            key={val}
            className={`btn-gs btn-sm ${filter === val ? "btn-green" : "btn-ghost"}`}
            onClick={() => setFilter(val)}
          >
            {label}
          </button>
        ))}
        <span className="text-muted-gs small ms-auto align-self-center">{filtered.length} records</span>
      </div>

      {!filtered.length && <p className="text-center py-5 text-secondary">No records found.</p>}

      <div className="d-flex flex-column gap-3">
        {filtered.map((b) => (
          <div key={b.id} className={`gs-admin-card ${b.is_active_ban ? "gs-admin-card--danger" : ""}`}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className={`gs-admin-badge ${b.is_active_ban ? "gs-admin-badge--red" : "gs-admin-badge--green"}`}>
                  {b.is_active_ban ? "Banned" : "Lifted"}
                </span>
                <strong className="text-white">@{b.username}</strong>
              </div>
              <p className="text-pink small mb-1"><em>{b.reason}</em></p>
              <p className="text-secondary small mb-0">
                Banned by <strong className="text-light">@{b.admin_username}</strong>
                {" · "}{b.created_at?.slice(0, 10)}
                {" · "}{b.ends === "Permanent" ? "Permanent" : `Until ${b.ends?.slice(0, 10)}`}
              </p>
              {!b.is_active_ban && b.unbanned_at && (
                <p className="text-green small mb-0 mt-1">
                  ✅ Unbanned by <strong>@{b.unbanned_by_username}</strong> on {b.unbanned_at?.slice(0, 10)}
                </p>
              )}
            </div>
            {b.is_active_ban && (
              <button className="btn-gs btn-green-outline btn-sm flex-shrink-0" onClick={() => unban(b.user_id)}>
                Unban
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ALL GAMES
// ─────────────────────────────────────────────────────────────
function AllGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    authFetch("/api/games")
      .then((r) => r.json())
      .then((d) => setGames(Array.isArray(d) ? d : d.games || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteGame = async (id) => {
    if (!confirm("Delete this game?")) return;
    await authFetch(`/api/games/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = games.filter((g) =>
    g.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center py-5 text-secondary">Loading games...</p>;

  return (
    <>
      <input
        type="text"
        className="gs-input mb-3"
        placeholder="Search game..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr style={{ borderBottom: "0.0625rem solid var(--border)" }}>
              <th className="text-muted-gs small">ID</th>
              <th className="text-muted-gs small">Title</th>
              <th className="text-muted-gs small">Developer</th>
              <th className="text-muted-gs small">Publisher</th>
              <th className="text-muted-gs small">Genres</th>
              <th className="text-muted-gs small">Platforms</th>
              <th className="text-end text-muted-gs small">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} style={{ borderBottom: "0.0625rem solid var(--border)" }}>
                <td className="text-dim small">{g.id}</td>
                <td className="fw-semibold">{g.title}</td>
                <td className="text-muted-gs">{g.developer}</td>
                <td className="text-muted-gs">{g.publisher}</td>
                <td className="text-muted-gs small">{Array.isArray(g.genres) ? g.genres.join(", ") : g.genres}</td>
                <td className="text-muted-gs small">{Array.isArray(g.platforms) ? g.platforms.join(", ") : g.platforms}</td>
                <td className="text-end">
                  <button className="btn-gs btn-pink-outline btn-sm" onClick={() => deleteGame(g.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ALL USERS
// ─────────────────────────────────────────────────────────────
function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    authFetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || d || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleBan = async (u) => {
    const body = u.is_active
      ? { is_active: false, reason: prompt("Ban reason:") || "No reason" }
      : { is_active: true };
    if (u.is_active && !body.reason) return;
    await authFetch(`/api/admin/users/${u.id}/ban`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    load();
  };

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center py-5 text-secondary">Loading users...</p>;

  return (
    <>
      <input
        type="text"
        className="gs-input mb-3"
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr style={{ borderBottom: "0.0625rem solid var(--border)" }}>
              <th className="text-muted-gs small">Username</th>
              <th className="text-muted-gs small">Email</th>
              <th className="text-muted-gs small">Role</th>
              <th className="text-muted-gs small">Status</th>
              <th className="text-end text-muted-gs small">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: "0.0625rem solid var(--border)" }}>
                <td className="fw-semibold">@{u.username}</td>
                <td className="text-muted-gs">{u.email}</td>
                <td>
                  <span className={`gs-admin-badge ${u.is_admin ? "gs-admin-badge--pink" : "gs-admin-badge--neutral"}`}>
                    {u.is_admin ? "Admin" : "User"}
                  </span>
                </td>
                <td>
                  <span className={`gs-admin-badge ${u.is_active ? "gs-admin-badge--green" : "gs-admin-badge--red"}`}>
                    {u.is_active ? "Active" : "Banned"}
                  </span>
                </td>
                <td className="text-end">
                  {!u.is_admin && (
                    <button
                      className={`btn-gs btn-sm ${u.is_active ? "btn-pink-outline" : "btn-green-outline"}`}
                      onClick={() => toggleBan(u)}
                    >
                      {u.is_active ? "Ban" : "Unban"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "suggestions",      label: "Suggested Games" },
  { key: "reportedComments", label: "Reported Comments" },
  { key: "reportedUsers",    label: "🔨 Ban History" },
  { key: "allGames",         label: "All Games" },
  { key: "allUsers",         label: "All Users" },
];

export const AdminPanel = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("suggestions");

  useEffect(() => {
    if (!store.isAuthenticated || !store.user?.is_admin) {
      navigate("/");
    }
  }, [store.isAuthenticated, store.user, navigate]);

  return (
    <div className="gs-admin-page">
      <div className="container py-4">
        <h2 className="mb-4 fw-bold text-pink">⚙ Admin Panel</h2>

        {/* Tabs */}
        <div className="gs-admin-tabs mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`gs-admin-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "suggestions"      && <SuggestedGames />}
          {activeTab === "reportedComments" && <ReportedComments />}
          {activeTab === "reportedUsers"    && <ReportedUsers />}
          {activeTab === "allGames"         && <AllGames />}
          {activeTab === "allUsers"         && <AllUsers />}
        </div>
      </div>
    </div>
  );
};
