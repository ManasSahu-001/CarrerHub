import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function Forgot({ toast }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post("/auth/forgot-password", { email }); setDone(true); }
    catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-accent/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-display text-3xl font-bold gradient-text mb-1">CareerHub</div>
          <p className="text-ink-3 text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl border border-paper-3 shadow-md p-8">
          {done ? (
            <div>
              <div className="mb-5 px-4 py-3 rounded-xl bg-brand-green-pale border border-brand-green/20 text-brand-green text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                If that email is registered, a reset link is on its way.
              </div>
              <Link
                to="/login"
                className="block w-full text-center py-3 border border-paper-3 rounded-xl text-sm font-medium text-ink-2 hover:border-accent/40 hover:text-accent hover:bg-accent-pale transition-all"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1.5">Email</label>
                <input
                  className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all placeholder-ink-3"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
              >
                {loading ? <Spinner /> : "Send reset link"}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-ink-3 mt-5">
            <Link to="/login" className="text-accent font-medium hover:underline">← Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
