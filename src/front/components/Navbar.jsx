import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API = import.meta.env.VITE_BACKEND_URL || "";

// ── Logo ──────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="gs-logo-link text-decoration-none d-flex align-items-center gap-2 flex-shrink-0">
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

// ── PC Icon ───────────────────────────────────────────────────
const PcSearchIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#7DD750" : "#888"} strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round"
    className={`gs-pc-icon ${active ? "active" : ""}`}
  >
    <rect x="2" y="3" width="20" height="13" rx="2" />
    <rect x="4" y="5" width="16" height="9" rx="1" className="gs-pc-screen" stroke="none" />
    <text x="12" y="12.5" textAnchor="middle" fontSize="7" fontWeight="bold"
      className="gs-pc-question" stroke="none"
      style={{ fontFamily: "Inter, sans-serif" }}>?</text>
    <line x1="12" y1="16" x2="12" y2="19" />
    <line x1="9"  y1="19" x2="15" y2="19" />
  </svg>
);

// ── Search ────────────────────────────────────────────────────
const SearchBar = () => {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate     = useNavigate();
  const inputRef     = useRef();
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
    <div ref={containerRef} className="gs-navbar-search">
      <div className={`gs-search-box ${open ? "open" : "default"}`}>
        <button className="gs-search-icon-btn" onClick={() => { setOpen(!open); if (open) close(); }} aria-label="Search">
          <PcSearchIcon active={open} />
        </button>
        <input
          ref={inputRef}
          className="gs-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) { navigate(`/games/${results[0].id}`); close(); }
            if (e.key === "Escape") close();
          }}
          placeholder="Search games..."
        />
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="gs-search-results">
          {loading && <p className="px-3 py-2 mb-0 text-dim small">Searching...</p>}
          {results.map((g) => (
            <Link key={g.id} to={`/games/${g.id}`} className="gs-search-result" onClick={close}>
              <div className="gs-search-result-cover rounded overflow-hidden flex-shrink-0">
                {g.cover_img_url && <img src={g.cover_img_url} alt="" className="w-100 h-100 object-fit-cover" />}
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
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const set = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/login`, {
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
      const res  = await fetch(`${API}/api/signup`, {
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

  const titles = { login: "Log In", signup: "Sign Up", recover: "Reset Password" };

  return (
    <div className="gs-login-dropdown">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="gs-modal-title mb-0">{titles[mode]}</h6>
        <button className="gs-modal-close position-static" onClick={onClose}>×</button>
      </div>

      {error   && <div className="gs-alert-error mb-3">{error}</div>}
      {success && <p className="text-green small mb-3">{success}</p>}

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
          <p className="text-dim text-center mb-0 small">Coming soon</p>
        </div>
      )}

      <div className="gs-modal-footer">
        {mode !== "signup"  && <button className="gs-modal-link" onClick={() => { setMode("signup");  setError(""); }}>👤 Sign Up</button>}
        {mode !== "login"   && <button className="gs-modal-link" onClick={() => { setMode("login");   setError(""); }}>🔑 Log In</button>}
        {mode !== "recover" && <button className="gs-modal-link" onClick={() => { setMode("recover"); setError(""); }}>🔐 Forgot Password</button>}
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
          <div className="gs-dropdown-header px-3 py-2">
            <div className="text-green fw-bold small">{user?.username}</div>
            <div className="text-dim" style={{ fontSize: "0.75rem" }}>{user?.email}</div>
          </div>
          <Link to="/profile" className="gs-dropdown-item" onClick={() => setOpen(false)}>👤 My Profile</Link>
          <Link to="/survey"  className="gs-dropdown-item" onClick={() => setOpen(false)}>🎮 Survey</Link>
          {user?.is_admin && <Link to="/admin" className="gs-dropdown-item" onClick={() => setOpen(false)}>⚙ Admin Panel</Link>}
          <button className="gs-dropdown-item danger" onClick={() => { onLogout(); setOpen(false); }}>🚪 Log Out</button>
        </div>
      )}
    </div>
  );
};

// ── Mobile Menu ───────────────────────────────────────────────
const MobileMenu = ({ user, onLogout, dispatch, location }) => {
  const [open, setOpen]       = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setShowLogin(false); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => { setOpen(false); setShowLogin(false); };

  const avatar = user?.profile?.avatar_url ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || "User"}`;

  return (
    <div ref={ref} className="position-relative">
      <button className="gs-hamburger" onClick={() => { setOpen(!open); setShowLogin(false); }} aria-label="Menu">
        <span className="gs-hamburger-line" />
        <span className="gs-hamburger-line" />
        <span className="gs-hamburger-line" />
      </button>

      {open && !showLogin && (
        <div className="gs-mobile-menu">
          <Link to="/games"    className={`gs-mobile-menu-item ${location.pathname === "/games"    ? "active" : ""}`} onClick={close}>🎮 Games</Link>
          <Link to="/tierlist" className={`gs-mobile-menu-item ${location.pathname === "/tierlist" ? "active" : ""}`} onClick={close}>🏆 Tier List</Link>
          <hr className="gs-mobile-divider" />
          {user ? (
            <>
              <div className="d-flex align-items-center gap-2 px-3 py-2">
                <img src={avatar} alt="" className="gs-avatar-sm" />
                <span className="text-green fw-bold small">{user.username}</span>
              </div>
              <Link to="/profile" className="gs-mobile-menu-item" onClick={close}>👤 My Profile</Link>
              <Link to="/survey"  className="gs-mobile-menu-item" onClick={close}>📋 Survey</Link>
              {user?.is_admin && <Link to="/admin" className="gs-mobile-menu-item" onClick={close}>⚙ Admin Panel</Link>}
              <button className="gs-mobile-menu-item danger" onClick={() => { onLogout(); close(); }}>🚪 Log Out</button>
            </>
          ) : (
            <button className="gs-mobile-menu-item" onClick={() => setShowLogin(true)}>🔑 Log In / Sign Up</button>
          )}
        </div>
      )}

      {open && showLogin && (
        <div className="gs-mobile-menu gs-mobile-login">
          <LoginDropdown onClose={close} dispatch={dispatch} />
        </div>
      )}
    </div>
  );
};

// ── NAVBAR ────────────────────────────────────────────────────
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
        <div className="flex-grow-1" />
        <SearchBar />
        <div className="flex-grow-1" />

        {/* Desktop */}
        <div className="d-none d-md-flex align-items-center gap-1">
          <Link to="/games"    className={`gs-nav-link ${location.pathname === "/games"    ? "active" : ""}`}>Games</Link>
          <Link to="/tierlist" className={`gs-nav-link ${location.pathname === "/tierlist" ? "active" : ""}`}>Tier List</Link>
          <div className="position-relative ms-2" ref={loginRef}>
            {store.isAuthenticated ? (
              <UserMenu user={store.user} onLogout={handleLogout} />
            ) : (
              <>
                <button className="btn-gs btn-green" onClick={() => setShowLogin(!showLogin)}>Log In</button>
                {showLogin && <LoginDropdown onClose={() => setShowLogin(false)} dispatch={dispatch} />}
              </>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="d-flex d-md-none">
          <MobileMenu
            user={store.isAuthenticated ? store.user : null}
            onLogout={handleLogout}
            dispatch={dispatch}
            location={location}
          />
        </div>

      </div>
    </nav>
  );
};
