
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
// TAB 1: Suggested Games
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
  if (!submissions.length)
    return <p className="text-center py-5 text-secondary">No pending suggestions.</p>;

  return (
    <div className="row g-3">
      {submissions.map((s) => {
        const d = s.body || {};
        return (
          <div key={s.id} className="col-12">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body d-flex gap-3">
                {d.cover_img_url ? (
                  <img
                    src={d.cover_img_url}
                    alt={d.title}
                    className="rounded"
                    style={{ width: 80, height: 100, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-secondary rounded d-flex align-items-center justify-content-center text-muted"
                    style={{ width: 80, height: 100 }}
                  >
                    No image
                  </div>
                )}

                <div className="flex-grow-1">
                  <h5 className="card-title text-pink mb-1">{d.title || "Untitled"}</h5>
                  <p className="text-secondary small mb-2">
                    {Array.isArray(d.genres) ? d.genres.join(" · ") : d.genres}
                  </p>

                  <p className="text-light small mb-3">
                    {d.description?.slice(0, 140)}...
                  </p>

                  <div className="text-secondary small">
                    <strong>Dev:</strong> {d.developer} |{" "}
                    <strong>Platforms:</strong>{" "}
                    {Array.isArray(d.platforms) ? d.platforms.join(", ") : d.platforms}
                  </div>

                  <div className="mt-2 text-info small">
                    Suggested by <strong>@{s.username || s.user_id}</strong> · {s.created_at?.slice(0, 10)}
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 justify-content-center">
                  <button
                    className="btn btn-success btn-sm fw-bold px-4"
                    onClick={() => decide(s.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm fw-bold px-4"
                    onClick={() => decide(s.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 2: Reported Comments
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
  if (!reports.length)
    return <p className="text-center py-5 text-secondary">No reported comments.</p>;

  return (
    <div className="row g-3">
      {reports.map((r) => (
        <div key={r.id} className="col-12">
          <div className="card bg-dark border-secondary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div className="flex-grow-1">
                  <div className="mb-2">
                    <span className="badge bg-pink me-2">Comment #{r.reported_comment_id}</span>
                    <span className="text-secondary small">Game ID: {r.comment_game_id}</span>
                  </div>

                  <blockquote className="border-start border-danger ps-3 text-light">
                    {r.comment_content}
                  </blockquote>

                  <div className="mt-3 text-secondary small">
                    Reported by <strong className="text-white">@{r.reporter_username}</strong> • 
                    Reason: <em className="text-warning">{r.reason}</em>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => resolve(r.id)}>
                    Ignore
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteComment(r.id)}>
                    Delete Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 3: Reported Users
// ─────────────────────────────────────────────────────────────
function ReportedUsers() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    authFetch("/api/admin/reports/users")
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resolve = async (id) => {
    await authFetch(`/api/admin/reports/${id}/resolve`, { method: "PUT" });
    load();
  };

  const banUser = async (report) => {
    await authFetch(`/api/admin/users/${report.reported_user_id}/ban`, {
      method: "PUT",
      body: JSON.stringify({ is_active: false, reason: report.reason }),
    });
    resolve(report.id);
  };

  if (loading) return <p className="text-center py-5 text-secondary">Loading...</p>;
  if (!reports.length)
    return <p className="text-center py-5 text-secondary">No reported users.</p>;

  return (
    <div className="row g-3">
      {reports.map((r) => (
        <div key={r.id} className="col-12">
          <div className="card bg-dark border-secondary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-pink mb-1">@{r.reported_username}</h5>
                  <p className="text-secondary small mb-2">ID: {r.reported_user_id}</p>
                  <p className="text-secondary small">
                    Reported by <strong>@{r.reporter_username}</strong> • Reason: <em className="text-warning">{r.reason}</em>
                  </p>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => resolve(r.id)}>
                    Ignore
                  </button>
                  <button className="btn btn-danger" onClick={() => banUser(r)}>
                    Ban User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 4: All Games
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
        className="form-control bg-dark border-secondary text-light mb-3"
        placeholder="Search game..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead className="table-pink">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Developer</th>
              <th>Publisher</th>
              <th>Genres</th>
              <th>Platforms</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id}>
                <td className="text-secondary">{g.id}</td>
                <td className="fw-semibold">{g.title}</td>
                <td>{g.developer}</td>
                <td>{g.publisher}</td>
                <td>{Array.isArray(g.genres) ? g.genres.join(", ") : g.genres}</td>
                <td>{Array.isArray(g.platforms) ? g.platforms.join(", ") : g.platforms}</td>
                <td className="text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteGame(g.id)}>
                    Delete
                  </button>
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
// TAB 5: All Users
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

  const toggleBan = async (user) => {
    const body = user.is_active
      ? { is_active: false, reason: "Banned by admin" }
      : { is_active: true };

    await authFetch(`/api/admin/users/${user.id}/ban`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    load();
  };

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center py-5 text-secondary">Loading users...</p>;

  return (
    <>
      <input
        type="text"
        className="form-control bg-dark border-secondary text-light mb-3"
        placeholder="Search user or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead className="table-pink">
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="text-secondary">{u.id}</td>
                <td className="fw-semibold">@{u.username}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? <span className="text-pink">Admin</span> : "—"}</td>
                <td>
                  <span className={`badge ${u.is_active ? "bg-success" : "bg-danger"}`}>
                    {u.is_active ? "Active" : "Banned"}
                  </span>
                </td>
                <td className="text-end">
                  {!u.is_admin && (
                    <button
                      className={`btn btn-sm ${u.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
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
  { key: "suggestions", label: "Suggested Games" },
  { key: "reportedComments", label: "Reported Comments" },
  { key: "reportedUsers", label: "Reported Users" },
  { key: "allGames", label: "All Games" },
  { key: "allUsers", label: "All Users" },
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
    <div className="min-vh-100 bg-dark text-light py-4">
      <div className="container">
        <h2 className="mb-4 fw-bold text-pink d-flex align-items-center gap-2">
          ⚙ Admin Panel
        </h2>

        <ul className="nav nav-tabs nav-fill mb-4 border-secondary" role="tablist">
          {TABS.map((tab) => (
            <li className="nav-item" key={tab.key}>
              <button
                className={`nav-link ${activeTab === tab.key ? "active bg-pink text-white border-pink" : "text-light border-secondary"}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="tab-content">
          {activeTab === "suggestions" && <SuggestedGames />}
          {activeTab === "reportedComments" && <ReportedComments />}
          {activeTab === "reportedUsers" && <ReportedUsers />}
          {activeTab === "allGames" && <AllGames />}
          {activeTab === "allUsers" && <AllUsers />}
        </div>
      </div>
    </div>
  );
};