import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import api from "../lib/api";

export default function Connections({ toast }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("connections");
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get("/users/connections/all"),
      api.get("/users/connections/pending"),
    ])
      .then(([connData, pendData]) => {
        setConnections(connData.connections || []);
        setPending(Array.isArray(pendData) ? pendData : []);
      })
      .catch(() => toast.error("Failed to load network"))
      .finally(() => setLoading(false));
  }, []);

  const accept = async (id) => {
    try {
      await api.put(`/users/connections/${id}/accept`, {});
      setPending((p) => p.filter((r) => r._id !== id));
      toast.success("Connection accepted!");
      api.get("/users/connections/all").then((d) => setConnections(d.connections || [])).catch(() => {});
    } catch (err) { toast.error(err.message); }
  };

  const reject = async (id) => {
    try {
      await api.put(`/users/connections/${id}/reject`, {});
      setPending((p) => p.filter((r) => r._id !== id));
      toast.info("Request rejected");
    } catch (err) { toast.error(err.message); }
  };

  if (!user) {
    return (
      <div className="text-center py-16 text-ink-3">Please log in to view your network.</div>
    );
  }

  const tabs = [
    ["connections", `Connections (${connections.length})`],
    ["pending", `Pending (${pending.length})`],
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 py-7 pb-12">
      <h1 className="font-display font-bold text-2xl text-ink mb-6">My Network</h1>

      {/* Tab switcher */}
      <div className="inline-flex gap-1 bg-paper-2 rounded-xl p-1 mb-6">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === k
                ? "bg-white text-ink shadow-sm"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner large /></div>
      ) : tab === "connections" ? (
        connections.length === 0 ? (
          <div className="text-center py-16 text-ink-3">
            <div className="w-16 h-16 bg-paper-2 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🤝</div>
            <div className="font-medium text-ink-2">No connections yet. Start by following developers and sending connection requests.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {connections.map((conn) => {
              const other = conn.requester._id === user._id ? conn.recipient : conn.requester;
              return (
                <div key={conn._id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-paper-3 card-hover">
                  <Avatar user={other} size="md" onClick={() => navigate(`/profile/${other.username}`)} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-sm cursor-pointer hover:text-accent truncate transition-colors"
                      onClick={() => navigate(`/profile/${other.username}`)}
                    >
                      {other.fullName || other.username}
                    </div>
                    <div className="text-xs text-ink-3 truncate">{other.headline || "@" + other.username}</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-green-pale text-brand-green">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Connected
                  </span>
                </div>
              );
            })}
          </div>
        )
      ) : (
        pending.length === 0 ? (
          <div className="text-center py-16 text-ink-3">
            <div className="w-16 h-16 bg-paper-2 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📭</div>
            <div className="font-medium text-ink-2">No pending connection requests.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((req) => (
              <div key={req._id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-paper-3">
                <Avatar user={req.requester} size="md" onClick={() => navigate(`/profile/${req.requester?.username}`)} />
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm cursor-pointer hover:text-accent truncate transition-colors"
                    onClick={() => navigate(`/profile/${req.requester?.username}`)}
                  >
                    {req.requester?.fullName || req.requester?.username}
                  </div>
                  <div className="text-xs text-ink-3 truncate">{req.requester?.headline || "@" + req.requester?.username}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept(req._id)}
                    className="px-3.5 py-1.5 text-xs font-semibold gradient-bg text-white rounded-full hover:opacity-90 transition-opacity"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => reject(req._id)}
                    className="px-3.5 py-1.5 text-xs font-semibold border border-paper-3 text-ink-2 rounded-full hover:border-ink-2 hover:text-ink transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
