import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API = import.meta.env.VITE_BACKEND_URL || "";

// ── Logo ──────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 flex-shrink-0">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7DD750" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="5" />
      <path d="M6 10v4M8 12H4" />
      <circle cx="16" cy="10.5" r="0.8" fill="#7DD750" stroke="none" />
      <circle cx="18.5" cy="12.5" r="0.8" fill="#7DD750" stroke="none" />
      <circle cx="13.5" cy="12.5" r="0.8" fill="#7DD750" stroke="none" />
      <circle cx="16" cy="14.5" r="0.8" fill="#7DD750" stroke="none" />
    </svg>
    <span className="gs-logo-text">Game-Side</span>
  </Link>
);

// ── Search ────────────────────────────────────────────────────
const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  const containerRef = useRef();

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setQuery(""); setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/games`);
        const all = await res.json();
        setResults(
          (Array.isArray(all) ? all : [])
            .filter(g => g.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 6)
        );
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const close = () => { setOpen(false); setQuery(""); setResults([]); };

  return (
    <div ref={containerRef} className="position-relative d-flex align-items-center">
      <div className={`gs-search-box ${open ? "open" : ""}`}>
        <button className="gs-search-btn" onClick={() => { setOpen(!open); if (open) close(); }} aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {open && (
          <input
            ref={inputRef}
            className="gs-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) { navigate(`/games/${results[0].id}`); close(); }
              if (e.key === "Escape") close();
            }}
            placeholder="Search games..."
          />
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="gs-search-results">
          {loading && <div className="px-3 py-2 text-dim" style={{ fontSize: "0.8125rem" }}>Searching...</div>}
          {results.map((g) => (
            <Link key={g.id} to={`/games/${g.id}`} className="gs-search-result" onClick={close}>
              <div className="rounded overflow-hidden flex-shrink-0"
                style={{ width: "2.25rem", height: "2.25rem", background: "var(--bg-hover)" }}>
                {g.cover_img_url && <img src={g.cover_img_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div>
                <div className="gs-search-result-title">{g.title}</div>
                <div className="gs-search-result-tier">{g.game_tier?.tier || "Unrated"}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Login Dropdown ────────────────────────────────────────────
const LoginDropdown = ({ onClose, dispatch }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Login failed");
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      dispatch({ type: "set_auth", payload: { token: data.token, user: data.user } });
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Signup failed");
      setSuccess("Account created! Please log in.");
      setTimeout(() => { setMode("login"); setSuccess(""); }, 1500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="gs-login-dropdown">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="gs-modal-title mb-0">
          {mode === "login" ? "Log In" : mode === "signup" ? "Sign Up" : "Reset Password"}
        </h6>
        <button className="gs-modal-close position-static" onClick={onClose}>×</button>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2" style={{ background: "rgba(214,79,130,0.1)", color: "var(--pink)", fontSize: "0.8125rem", borderRadius: "var(--radius-sm)" }}>
          {error}
        </div>
      )}
      {success && <div className="mb-3 text-green" style={{ fontSize: "0.8125rem" }}>{success}</div>}

      {mode === "login" && (
        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          <div>
            <label className="gs-label">Username</label>
            <input name="username" value={form.username} onChange={set} className="gs-input" autoComplete="username" required />
          </div>
          <div>
            <label className="gs-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={set} className="gs-input" autoComplete="current-password" required />
          </div>
          <button type="submit" disabled={loading} className="btn-gs btn-green w-100">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      )}

      {mode === "signup" && (
        <form onSubmit={handleSignup} className="d-flex flex-column gap-3">
          <div>
            <label className="gs-label">Username</label>
            <input name="username" value={form.username} onChange={set} className="gs-input" required />
          </div>
          <div>
            <label className="gs-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={set} className="gs-input" required />
          </div>
          <div>
            <label className="gs-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={set} className="gs-input" required />
          </div>
          <button type="submit" disabled={loading} className="btn-gs btn-green w-100">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      )}

      {mode === "recover" && (
        <div className="d-flex flex-column gap-3">
          <div>
            <label className="gs-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={set} className="gs-input" placeholder="your@email.com" />
          </div>
          <button className="btn-gs btn-green w-100">Send reset link</button>
          <p className="text-dim text-center mb-0" style={{ fontSize: "0.75rem" }}>Coming soon</p>
        </div>
      )}

      <div className="gs-modal-footer">
        {mode !== "signup" && <button className="gs-modal-link" onClick={() => { setMode("signup"); setError(""); }}><span>👤</span> Sign Up</button>}
        {mode !== "login" && <button className="gs-modal-link" onClick={() => { setMode("login"); setError(""); }}><span>🔑</span> Log In</button>}
        {mode !== "recover" && <button className="gs-modal-link" onClick={() => { setMode("recover"); setError(""); }}><span>🔐</span> Forgot Password</button>}
      </div>
    </div>
  );
};

// ── User Menu ─────────────────────────────────────────────────
const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatar = user?.profile?.avatar_url ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || "User"}`;

  return (
    <div ref={ref} className="position-relative">
      <button className="gs-avatar-btn" onClick={() => setOpen(!open)} aria-label="User menu">
        <img src={avatar} alt={user?.username} />
      </button>

      {open && (
        <div className="gs-dropdown">
          <div className="px-3 py-2" style={{ borderBottom: "0.0625rem solid var(--border)" }}>
            <div className="text-green fw-bold" style={{ fontSize: "0.875rem" }}>{user?.username}</div>
            <div className="text-dim" style={{ fontSize: "0.75rem" }}>{user?.email}</div>
          </div>
          <Link to="/profile" className="gs-dropdown-item" onClick={() => setOpen(false)}>👤 My Profile</Link>
          <Link to="/survey" className="gs-dropdown-item" onClick={() => setOpen(false)}>🎮 Survey</Link>
          {user?.is_admin && (
            <Link to="/admin" className="gs-dropdown-item" onClick={() => setOpen(false)}>⚙ Admin Panel</Link>
          )}
          <button className="gs-dropdown-item danger" onClick={() => { onLogout(); setOpen(false); }}>
            🚪 Log Out
          </button>
        </div>
      )}
    </div>
  );
};

// ── NAVBAR PRINCIPAL ──────────────────────────────────────────
export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const [showLogin, setShowLogin] = useState(false);
  const loginRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!showLogin) return;
    const handler = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setShowLogin(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLogin]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/");
  };

  return (
    <nav className="gs-navbar">
      <div className="container h-100 d-flex align-items-center gap-3">

        <Logo />
        <SearchBar />
        <div className="flex-grow-1" />

        <div className="d-flex align-items-center gap-1">
          <Link to="/games" className={`gs-nav-link ${location.pathname === "/games" ? "active" : ""}`}>Games</Link>
          <Link to="/tierlist" className={`gs-nav-link ${location.pathname === "/tierlist" ? "active" : ""}`}>Tier List</Link>
        </div>

        <div className="d-flex align-items-center position-relative" ref={loginRef}>
          {store.isAuthenticated ? (
            <UserMenu user={store.user} onLogout={handleLogout} />
          ) : (
            <>
              <button className="btn-gs btn-green" onClick={() => setShowLogin(!showLogin)}>
                Log In
              </button>
              {showLogin && (
                <LoginDropdown onClose={() => setShowLogin(false)} dispatch={dispatch} />
              )}
            </>
          )}
        </div>

      </div>
    </nav>
  );
};
