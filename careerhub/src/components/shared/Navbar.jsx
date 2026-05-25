import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import Avatar from "../ui/Avatar";
import api from "../../lib/api";

export default function Navbar({ toast }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    function handle(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout", {}); } catch {}
    logout();
    toast.info("Logged out");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-[100] h-[64px]  w-full flex items-center px-6 gap-4 shadow-lg"
      style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Logo */}
      <Link
        to={user ? "/feed" : "/"}
        className="font-display text-[22px] tracking-tight flex-shrink-0 select-none"
        style={{ background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 800 }}
      >
        CareerHub
      </Link>

      {/* Search */}
      {user && (
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.4)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            className="w-full py-2 pl-9 pr-4 rounded-full text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
            }}
            placeholder="Search developers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={e => e.target.style.background = "rgba(255,255,255,0.15)"}
            onBlur={e => e.target.style.background = "rgba(255,255,255,0.1)"}
          />
          <style>{`input::placeholder { color: rgba(255,255,255,0.35); }`}</style>
        </div>
      )}

      <div className="flex-1" />

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {user ? (
          <>
            <Link
              to="/feed"
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.08)"; e.target.style.color = "white"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(255,255,255,0.65)"; }}
            >
              Feed
            </Link>
            <Link
              to="/connections"
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.08)"; e.target.style.color = "white"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(255,255,255,0.65)"; }}
            >
              Network
            </Link>

            {/* Avatar dropdown */}
            <div ref={dropRef} className="relative ml-2">
              <button
                onClick={() => setDropdown((d) => !d)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full transition-colors"
                style={{ background: dropdown ? "rgba(255,255,255,0.1)" : "transparent" }}
              >
                <Avatar user={user} />
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {dropdown && (
                <div className="absolute right-0 top-[calc(100%+8px)] rounded-xl shadow-lg min-w-[180px] z-50 overflow-hidden dropdown-in"
                  style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-white text-sm font-semibold">{user.fullName || user.username}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>@{user.username}</div>
                  </div>
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => { setDropdown(false); navigate(`/profile/${user.username}`); }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    My Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => { setDropdown(false); navigate("/settings"); }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                  </button>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: "#f87171" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-opacity"
            >
              Join free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
