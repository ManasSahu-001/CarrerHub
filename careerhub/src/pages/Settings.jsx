import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import Spinner from "../components/ui/Spinner";
import api from "../lib/api";

export default function Settings({ toast }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("password");
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    setPwLoading(true); setPwError("");
    try {
      await api.post("/auth/change-password", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed!");
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    ["password", "Change Password"],
    ["account", "Account"],
  ];

  return (
    <div className="max-w-xl mx-auto px-5 py-7 pb-12">
      <h1 className="font-display font-bold text-2xl text-ink mb-6">Settings</h1>

      <div className="bg-white rounded-xl border border-paper-3 shadow-sm p-6">
        {/* Tab switcher */}
        <div className="inline-flex gap-1 bg-paper-2 rounded-xl p-1 mb-6">
          {tabs.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === k ? "bg-white text-ink shadow-sm" : "text-ink-3 hover:text-ink"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "password" && (
          <form onSubmit={changePassword} className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-ink mb-4">Change Password</h3>
            {pwError && (
              <div className="px-4 py-3 rounded-xl bg-brand-red-pale border border-brand-red/15 text-brand-red text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {pwError}
              </div>
            )}
            {[
              { k: "oldPassword", label: "Current Password" },
              { k: "newPassword", label: "New Password", min: 8 },
              { k: "confirm", label: "Confirm New Password" },
            ].map(({ k, label, min }) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label}</label>
                <input
                  className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all"
                  type="password"
                  value={pwForm[k]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [k]: e.target.value }))}
                  required
                  minLength={min}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {pwLoading ? <Spinner /> : "Update Password"}
            </button>
          </form>
        )}

        {tab === "account" && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-ink mb-4">Account Info</h3>
            {[
              { label: "Username", value: user?.username },
              { label: "Email", value: user?.email },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label}</label>
                <input
                  className="w-full px-4 py-3 bg-paper-2 border border-paper-3 rounded-xl text-sm text-ink-3 cursor-not-allowed"
                  value={value || ""}
                  disabled
                  readOnly
                />
              </div>
            ))}
            <p className="text-xs text-ink-3">To change your email, please contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}
