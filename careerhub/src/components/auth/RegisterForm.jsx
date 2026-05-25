import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Spinner from "../ui/Spinner";

export default function RegisterForm({ toast }) {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", form);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-5">
        <div className="w-full max-w-md bg-white rounded-2xl border border-paper-3 shadow-md p-10 text-center">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">✉️</div>
          <h2 className="font-display font-bold text-2xl text-ink mb-2">Check your inbox</h2>
          <p className="text-ink-3 text-sm mb-6">
            We sent a verification link to <strong className="text-ink">{form.email}</strong>.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 border border-paper-3 rounded-full text-sm font-medium text-ink-2 hover:border-accent/40 hover:text-accent hover:bg-accent-pale transition-all"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-5 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-ch-violet/7 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-display text-3xl font-bold gradient-text mb-1">CareerHub</div>
          <p className="text-ink-3 text-sm">Create your developer profile — it's free</p>
        </div>

        <div className="bg-white rounded-2xl border border-paper-3 shadow-md p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-brand-red-pale border border-brand-red/15 text-brand-red text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {[
              { key: "username", label: "Username", type: "text", placeholder: "devhandle" },
              { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { key: "password", label: "Password", type: "password", placeholder: "at least 8 characters", min: 8 },
            ].map(({ key, label, type, placeholder, min }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label}</label>
                <input
                  className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm text-ink outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all placeholder-ink-3"
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  required
                  minLength={min}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Spinner /> : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-3 mt-5">
            Already a member?{" "}
            <Link to="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
