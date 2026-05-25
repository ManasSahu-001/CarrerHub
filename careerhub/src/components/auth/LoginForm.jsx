import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import api from "../../lib/api";
import Spinner from "../ui/Spinner";

export default function LoginForm({ toast }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", form);
      login(data.user, data.accessToken);
      toast.success("Welcome back!");
      navigate("/feed");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-5 py-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-accent/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-display text-3xl font-bold gradient-text mb-1">CareerHub</div>
          <p className="text-ink-3 text-sm">Welcome back — sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl border border-paper-3 shadow-md p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-brand-red-pale border border-brand-red/15 text-brand-red text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Email</label>
              <input
                className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm text-ink outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all placeholder-ink-3"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Password</label>
              <input
                className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm text-ink outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all placeholder-ink-3"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                required
              />
              <div className="text-right mt-2">
                <Link to="/forgot" className="text-xs text-accent hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Spinner /> : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-3 mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Join CareerHub
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
