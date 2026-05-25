import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import FollowBtn from "../components/ui/FollowBtn";
import api from "../lib/api";

export default function Search({ toast }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [skills, setSkills] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim() && !skills.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (skills.trim()) params.set("skills", skills.trim());
      const data = await api.get(`/profile/search?${params}`);
      setProfiles(data.profiles || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (searchParams.get("q")) { setQ(searchParams.get("q")); search(); }
  }, [searchParams.get("q")]);

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-7 pb-12">
      <h1 className="font-display font-bold text-2xl text-ink mb-6">Find Developers</h1>

      <div className="flex gap-2.5 flex-wrap mb-7">
        <div className="relative flex-[2] min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-paper-3 rounded-xl text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/8 transition-all"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or username…"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
        </div>
        <input
          className="flex-1 min-w-[160px] px-4 py-2.5 bg-white border border-paper-3 rounded-xl text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/8 transition-all"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Filter by skills (React, Node…)"
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <button
          onClick={search}
          disabled={loading}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Spinner /> : "Search"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner large /></div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 text-ink-3">
          <div className="w-16 h-16 bg-paper-2 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔍</div>
          <div className="font-medium text-ink-2">Search for developers by name, username, or skills.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const u = profile.userId;
            if (!u) return null;
            return (
              <div
                key={profile._id}
                className="bg-white rounded-xl border border-paper-3 p-4 flex flex-col gap-3 card-hover"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    user={u}
                    size="md"
                    onClick={() => navigate(`/profile/${u.username}`)}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-sm truncate cursor-pointer hover:text-accent transition-colors"
                      onClick={() => navigate(`/profile/${u.username}`)}
                    >
                      {u.fullName || u.username}
                    </div>
                    <div className="text-xs text-ink-3 truncate">@{u.username}</div>
                  </div>
                  {user && u._id !== user._id && (
                    <FollowBtn targetId={u._id} toast={toast} />
                  )}
                </div>
                {profile.headline && (
                  <p className="text-sm text-ink-3">{profile.headline}</p>
                )}
                {profile.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 4).map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full text-xs bg-accent-pale text-accent font-medium">{s}</span>
                    ))}
                    {profile.skills.length > 4 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-paper-2 text-ink-3">
                        +{profile.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
