import { useState } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { PLATFORM_ICONS } from "../../lib/utils";
import api from "../../lib/api";

// ── Basic Info ──────────────────────────────────────────────────────────────
export function EditBasicModal({ user, profile, onClose, onSave, toast }) {
  const [form, setForm] = useState({
    fullName: user.fullName || "",
    bio: profile.bio || "",
    headline: profile.headline || "",
    location: profile.location || "",
    website: profile.website || "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    try {
      const updated = await api.put("/profile/basic", form);
      onSave({ user: { fullName: form.fullName }, profile: updated });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <div className="space-y-4">
        {[
          { k: "fullName", label: "Full Name" },
          { k: "headline", label: "Headline" },
          { k: "location", label: "Location" },
          { k: "website", label: "Website" },
        ].map(({ k, label }) => (
          <div key={k}>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label}</label>
            <input
              className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all"
              value={form[k]}
              onChange={set(k)}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Bio</label>
          <textarea
            className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white transition-all resize-y min-h-[80px]"
            value={form.bio}
            onChange={set("bio")}
            maxLength={300}
          />
          <div className="text-right text-xs text-ink-3 mt-1">{form.bio.length}/300</div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2 rounded-xl transition-colors">Cancel</button>
          <button onClick={save} disabled={loading} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors">
            {loading ? <Spinner /> : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Skills ──────────────────────────────────────────────────────────────────
export function EditSkillsModal({ profile, onClose, onSave, toast }) {
  const [skills, setSkills] = useState([...(profile.skills || [])]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const add = () => {
    const s = input.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setInput(""); }
  };

  const save = async () => {
    setLoading(true);
    try { onSave(await api.put("/profile/skills", { skills })); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Edit Skills" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-2.5 bg-paper border border-paper-3 rounded text-sm outline-none focus:border-accent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. React, Node.js…"
          />
          <button onClick={add} className="px-4 py-2 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-accent-pale text-accent cursor-pointer hover:bg-paper-3 transition-colors"
              onClick={() => setSkills(skills.filter((x) => x !== s))}
            >
              {s} ✕
            </span>
          ))}
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2 rounded-xl transition-colors">Cancel</button>
          <button onClick={save} disabled={loading} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors">
            {loading ? <Spinner /> : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Platform Links ──────────────────────────────────────────────────────────
export function EditLinksModal({ profile, onClose, onSave, toast }) {
  const [form, setForm] = useState({
    github: "", leetcode: "", codeforces: "", linkedin: "", portfolio: "",
    ...profile.platformLinks,
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try { onSave(await api.put("/profile/platform-links", form)); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Platform Links" onClose={onClose}>
      <div className="space-y-4">
        {Object.keys(form).map((k) => (
          <div key={k}>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">
              {PLATFORM_ICONS[k]} {k.charAt(0).toUpperCase() + k.slice(1)}
            </label>
            <input
              className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all"
              value={form[k]}
              onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              placeholder={`https://${k}.com/…`}
            />
          </div>
        ))}
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2 rounded-xl transition-colors">Cancel</button>
          <button onClick={save} disabled={loading} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors">
            {loading ? <Spinner /> : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Add Experience ──────────────────────────────────────────────────────────
export function AddExpModal({ onClose, onSave, toast }) {
  const [form, setForm] = useState({ company: "", role: "", description: "", startDate: "", current: false, endDate: "", location: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    try { onSave(await api.post("/profile/experience", form)); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Add Experience" onClose={onClose}>
      <div className="space-y-4">
        {[["company", "Company"], ["role", "Role / Title"], ["location", "Location"]].map(([k, l]) => (
          <div key={k}>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">{l}</label>
            <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" value={form[k]} onChange={set(k)} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Description</label>
          <textarea className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white transition-all resize-y min-h-[80px]" value={form.description} onChange={set("description")} maxLength={500} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Start Date</label>
            <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" type="date" value={form.startDate} onChange={set("startDate")} />
          </div>
          {!form.current && (
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">End Date</label>
              <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" type="date" value={form.endDate} onChange={set("endDate")} />
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))} />
          Currently working here
        </label>
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2 rounded-xl transition-colors">Cancel</button>
          <button onClick={save} disabled={loading} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors">
            {loading ? <Spinner /> : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Add Education ───────────────────────────────────────────────────────────
export function AddEduModal({ onClose, onSave, toast }) {
  const [form, setForm] = useState({ school: "", degree: "", field: "", startYear: "", endYear: "", grade: "", current: false });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    try {
      onSave(await api.post("/profile/education", {
        ...form,
        startYear: Number(form.startYear),
        endYear: form.endYear ? Number(form.endYear) : undefined,
      }));
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Add Education" onClose={onClose}>
      <div className="space-y-4">
        {[["school", "School / University"], ["degree", "Degree (e.g. B.Tech)"], ["field", "Field of Study"]].map(([k, l]) => (
          <div key={k}>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">{l}</label>
            <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" value={form[k]} onChange={set(k)} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Start Year</label>
            <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" type="number" min="1990" max="2030" value={form.startYear} onChange={set("startYear")} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">End Year</label>
            <input className="w-full px-4 py-2.5 bg-paper border border-paper-3 rounded text-sm outline-none focus:border-accent disabled:opacity-50" type="number" min="1990" max="2035" value={form.endYear} onChange={set("endYear")} disabled={form.current} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))} />
          Currently studying
        </label>
        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Grade (optional)</label>
          <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" value={form.grade} onChange={set("grade")} placeholder="e.g. 8.5 CGPA" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2 rounded-xl transition-colors">Cancel</button>
          <button onClick={save} disabled={loading} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors">
            {loading ? <Spinner /> : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Add Project ─────────────────────────────────────────────────────────────
export function AddProjectModal({ onClose, onSave, toast }) {
  const [form, setForm] = useState({ title: "", description: "", techStack: "", githubUrl: "", liveUrl: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    try {
      onSave(await api.post("/profile/projects", {
        ...form,
        techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      }));
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Add Project" onClose={onClose}>
      <div className="space-y-4">
        {[
          { k: "title", label: "Project Title", placeholder: "" },
          { k: "githubUrl", label: "GitHub URL", placeholder: "https://github.com/…" },
          { k: "liveUrl", label: "Live URL", placeholder: "https://…" },
        ].map(({ k, label, placeholder }) => (
          <div key={k}>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">{label}</label>
            <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" value={form[k]} onChange={set(k)} placeholder={placeholder} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Description</label>
          <textarea className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white transition-all resize-y min-h-[80px]" value={form.description} onChange={set("description")} maxLength={500} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Tech Stack</label>
          <input className="w-full px-4 py-3 bg-paper-2 border border-transparent rounded-xl text-sm outline-none focus:border-accent/50 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all" value={form.techStack} onChange={set("techStack")} placeholder="React, Node.js, MongoDB (comma-separated)" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2 rounded-xl transition-colors">Cancel</button>
          <button onClick={save} disabled={loading} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors">
            {loading ? <Spinner /> : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
