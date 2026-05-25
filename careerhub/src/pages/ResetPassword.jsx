import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import Spinner from "../components/ui/Spinner";

export default function ResetPassword({ toast }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword: password });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-5">
      <div className="w-full max-w-md bg-white rounded-2xl border border-paper-3 shadow-md p-8">
        <div className="font-display text-3xl font-bold gradient-text text-center mb-1">
          Pro<span className="text-accent">Link</span>
        </div>
        <p className="text-center text-ink-3 text-sm mb-7">Set a new password</p>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded bg-brand-red-pale text-brand-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">New Password</label>
            <input
              className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="at least 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Spinner /> : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-3 mt-5">
          <Link to="/login" className="text-accent hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}