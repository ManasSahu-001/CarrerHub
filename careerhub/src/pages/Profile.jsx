import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import FollowBtn from "../components/ui/FollowBtn";
import {
  EditBasicModal, EditSkillsModal, EditLinksModal,
  AddExpModal, AddEduModal, AddProjectModal,
} from "../components/profile/EditModals";
import { formatDate, PLATFORM_ICONS, timeAgo } from "../lib/utils";
import api from "../lib/api";

export default function Profile({ toast }) {
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const targetUsername = username || user?.username;
  const isOwn = user && targetUsername === user.username;

  useEffect(() => {
    if (!targetUsername) return;
    setLoading(true);
    Promise.all([
      api.get(`/profile/${targetUsername}`),
      api.get(`/posts/user/${targetUsername}`).catch(() => ({ posts: [] })),
    ])
      .then(([profileData, postsData]) => {
        setData(profileData);
        setPosts(postsData.posts || []);
      })
      .catch(() => toast.error("Profile not found"))
      .finally(() => setLoading(false));
  }, [targetUsername]);

  const generateResumeSummary = async () => {
    setAiLoading(true);
    try {
      const d = await api.post("/ai/resume-summary", {});
      setData((prev) => ({ ...prev, profile: { ...prev.profile, resumeSummary: d.summary } }));
      toast.success("Resume summary generated! ✦");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("avatar", file);
    try {
      const result = await api.postForm("/users/avatar", fd);
      updateUser({ avatar: result.avatar });
      setData((prev) => ({ ...prev, user: { ...prev.user, avatar: result.avatar } }));
      toast.success("Avatar updated!");
    } catch (err) { toast.error(err.message); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("cover", file);
    try {
      const result = await api.postForm("/users/cover", fd);
      updateUser({ coverPhoto: result.coverPhoto });
      setData((prev) => ({ ...prev, user: { ...prev.user, coverPhoto: result.coverPhoto } }));
      toast.success("Cover updated!");
    } catch (err) { toast.error(err.message); }
  };

  const removeExp = async (id) => {
    await api.delete(`/profile/experience/${id}`);
    setData((d) => ({ ...d, profile: { ...d.profile, experience: d.profile.experience.filter((e) => e._id !== id) } }));
    toast.success("Removed");
  };

  const removeEdu = async (id) => {
    await api.delete(`/profile/education/${id}`);
    setData((d) => ({ ...d, profile: { ...d.profile, education: d.profile.education.filter((e) => e._id !== id) } }));
    toast.success("Removed");
  };

  const removeProject = async (id) => {
    await api.delete(`/profile/projects/${id}`);
    setData((d) => ({ ...d, profile: { ...d.profile, projects: d.profile.projects.filter((p) => p._id !== id) } }));
    toast.success("Removed");
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner large /></div>;
  if (!data) return (
    <div className="text-center py-16 text-ink-3">
      <div className="text-4xl mb-3">🔍</div>Profile not found
    </div>
  );

  const { user: profileUser, profile } = data;

  const Section = ({ title, action, children }) => (
    <div className="bg-white rounded-xl border border-paper-3 shadow-sm p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-base text-ink">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );

  const EntryItem = ({ title, sub, date, desc, techStack, links, onEdit, onDelete }) => (
    <div className="py-3 border-b border-paper-2 last:border-0 last:pb-0 first:pt-0">
      <div className="font-semibold text-sm">{title}</div>
      {sub && <div className="text-sm text-ink-2 mt-0.5">{sub}</div>}
      {date && <div className="text-xs text-ink-3 mt-0.5">{date}</div>}
      {desc && <div className="text-sm text-ink-2 mt-1.5 leading-snug">{desc}</div>}
      {techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {techStack.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-paper-2 text-ink-2">{t}</span>
          ))}
        </div>
      )}
      {links && <div className="flex gap-2 mt-2">{links}</div>}
      {isOwn && (
        <div className="flex gap-2 mt-2">
          {onEdit && (
            <button onClick={onEdit} className="px-2.5 py-1 text-xs text-ink-2 hover:bg-paper-2 rounded-full transition-colors">✏️ Edit</button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="px-2.5 py-1 text-xs bg-brand-red-pale text-brand-red hover:bg-brand-red hover:text-white rounded-full transition-colors">✕</button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-7 pb-12">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-paper-3 shadow-sm mb-4">
        {/* Cover */}
        <div className="h-44 relative">
          {profileUser.coverPhoto?.url ? (
            <img src={profileUser.coverPhoto.url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-paper-3"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #e11d74 100%)" }}></div>
          )}
          {isOwn && (
            <label className="absolute bottom-3 right-3 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              <span className="px-3 py-1.5 text-xs font-medium bg-white/85 border border-paper-3 rounded-full hover:bg-white transition-colors">📷 Cover</span>
            </label>
          )}
        </div>

        {/* Avatar + info row */}
        <div className="px-6 pb-5 flex items-end justify-between gap-4 -mt-8 relative z-10">
          <div>
            {isOwn ? (
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <div style={{ background: "white", borderRadius: "9999px", padding: "3px", display: "inline-block" }}>
                    <Avatar user={profileUser} size="lg" />
                  </div>
              </label>
            ) : (
              <div style={{ background: "white", borderRadius: "9999px", padding: "3px", display: "inline-block" }}>
                  <Avatar user={profileUser} size="lg" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-1 min-w-0">
            <div className="font-display text-xl text-ink">{profileUser.fullName || profileUser.username}</div>
            <div className="text-sm text-ink-2 mt-0.5">{profile.headline || "@" + profileUser.username}</div>
            {profile.location && <div className="text-xs text-ink-3 mt-1">📍 {profile.location}</div>}
          </div>
          <div className="flex gap-2 pb-1">
            {isOwn ? (
              <button
                onClick={() => setEditSection("basic")}
                className="px-4 py-2 text-sm border border-paper-3 rounded-full text-ink-2 hover:border-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
              >
                ✏️ Edit profile
              </button>
            ) : user ? (
              <>
                <FollowBtn targetId={profileUser._id} toast={toast} size="sm" />
                <button
                  onClick={async () => {
                    try { await api.post(`/users/${profileUser._id}/connect`, {}); setConnectionStatus("pending"); toast.success("Request sent!"); }
                    catch (err) { toast.error(err.message); }
                  }}
                  disabled={connectionStatus === "pending"}
                  className="px-4 py-2 text-sm border border-paper-3 rounded-full text-ink-2 hover:border-ink-2 disabled:opacity-50 transition-colors"
                >
                  {connectionStatus === "pending" ? "Pending" : connectionStatus === "accepted" ? "✓ Connected" : "+ Connect"}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 px-6 py-3 border-t border-paper-2">
          {[["Followers", profile.followersCount || 0], ["Following", profile.followingCount || 0], ["Connections", profile.connectionsCount || 0]].map(([l, v]) => (
            <div key={l} className="text-center cursor-pointer">
              <div className="font-bold text-lg">{v}</div>
              <div className="text-xs text-ink-3">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div>
          {/* About */}
          {(profile.bio || isOwn) && (
            <Section
              title="About"
              action={isOwn && <button onClick={() => setEditSection("basic")} className="px-2.5 py-1 text-xs text-ink-2 hover:bg-paper-2 rounded-full transition-colors">✏️</button>}
            >
              <p className="text-sm leading-relaxed">{profile.bio || <span className="text-ink-3">Add a bio to tell people about yourself.</span>}</p>
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm text-accent mt-2 block hover:underline">{profile.website}</a>
              )}
            </Section>
          )}

          {/* AI Resume Summary */}
          {(profile.resumeSummary || isOwn) && (
            <Section
              title={<span>Resume Summary <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "linear-gradient(135deg, rgba(244,163,90,0.13), rgba(200,80,10,0.13))", border: "1px solid rgba(200,80,10,0.27)", color: "#c8500a" }}>✦ AI</span></span>}
              action={isOwn && (
                <button onClick={generateResumeSummary} disabled={aiLoading} className="flex items-center gap-1 px-3 py-1.5 text-xs text-ink-2 hover:bg-paper-2 rounded-full disabled:opacity-50 transition-colors">
                  {aiLoading ? <Spinner /> : "✦ Regenerate"}
                </button>
              )}
            >
              {profile.resumeSummary ? (
                <p className="text-sm leading-relaxed">{profile.resumeSummary}</p>
              ) : isOwn ? (
                <div>
                  <p className="text-sm text-ink-3 mb-3">Generate a professional summary from your profile using AI.</p>
                  <button onClick={generateResumeSummary} disabled={aiLoading} className="flex items-center gap-1 px-4 py-2 text-sm gradient-bg text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-colors">
                    {aiLoading ? <Spinner /> : "✦ Generate with AI"}
                  </button>
                </div>
              ) : null}
            </Section>
          )}

          {/* Skills */}
          <Section
            title="Skills"
            action={isOwn && <button onClick={() => setEditSection("skills")} className="px-2.5 py-1 text-xs text-ink-2 hover:bg-paper-2 rounded-full transition-colors">✏️</button>}
          >
            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-accent-pale text-accent">{s}</span>
                ))}
              </div>
            ) : <p className="text-sm text-ink-3">No skills listed yet.</p>}
          </Section>

          {/* Experience */}
          <Section
            title="Experience"
            action={isOwn && <button onClick={() => setEditSection("addExp")} className="px-3 py-1.5 text-xs gradient-bg text-white rounded-full hover:opacity-90 transition-colors">+ Add</button>}
          >
            {profile.experience?.length > 0 ? (
              profile.experience.map((exp) => (
                <EntryItem
                  key={exp._id}
                  title={exp.role}
                  sub={`${exp.company}${exp.location ? ` · ${exp.location}` : ""}`}
                  date={`${formatDate(exp.startDate)} — ${exp.current ? "Present" : formatDate(exp.endDate)}`}
                  desc={exp.description}
                  onDelete={() => removeExp(exp._id)}
                />
              ))
            ) : <p className="text-sm text-ink-3">No experience listed.</p>}
          </Section>

          {/* Education */}
          <Section
            title="Education"
            action={isOwn && <button onClick={() => setEditSection("addEdu")} className="px-3 py-1.5 text-xs gradient-bg text-white rounded-full hover:opacity-90 transition-colors">+ Add</button>}
          >
            {profile.education?.length > 0 ? (
              profile.education.map((edu) => (
                <EntryItem
                  key={edu._id}
                  title={edu.school}
                  sub={`${edu.degree} in ${edu.field}`}
                  date={`${edu.startYear} — ${edu.current ? "Present" : edu.endYear || ""}`}
                  desc={edu.grade ? `Grade: ${edu.grade}` : ""}
                  onDelete={() => removeEdu(edu._id)}
                />
              ))
            ) : <p className="text-sm text-ink-3">No education listed.</p>}
          </Section>

          {/* Projects */}
          <Section
            title="Projects"
            action={isOwn && <button onClick={() => setEditSection("addProject")} className="px-3 py-1.5 text-xs gradient-bg text-white rounded-full hover:opacity-90 transition-colors">+ Add</button>}
          >
            {profile.projects?.length > 0 ? (
              profile.projects.map((pr) => (
                <EntryItem
                  key={pr._id}
                  title={pr.title}
                  desc={pr.description}
                  techStack={pr.techStack}
                  links={
                    <>
                      {pr.githubUrl && <a href={pr.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-2 border border-paper-3 text-xs text-ink-2 hover:border-accent hover:text-accent hover:bg-accent-pale transition-all">⌥ GitHub</a>}
                      {pr.liveUrl && <a href={pr.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-2 border border-paper-3 text-xs text-ink-2 hover:border-accent hover:text-accent hover:bg-accent-pale transition-all">◎ Live</a>}
                    </>
                  }
                  onDelete={() => removeProject(pr._id)}
                />
              ))
            ) : <p className="text-sm text-ink-3">No projects listed.</p>}
          </Section>
        </div>

        {/* Right sidebar */}
        <div>
          {/* Platform links */}
          <div className="bg-white rounded-xl border border-paper-3 shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-base text-ink">Links</div>
              {isOwn && <button onClick={() => setEditSection("links")} className="px-2.5 py-1 text-xs text-ink-2 hover:bg-paper-2 rounded-full transition-colors">✏️</button>}
            </div>
            {Object.values(profile.platformLinks || {}).some(Boolean) ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(profile.platformLinks || {}).map(([k, v]) =>
                  v ? (
                    <a key={k} href={v} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper-2 border border-paper-3 text-xs font-medium text-ink-2 hover:border-accent hover:text-accent hover:bg-accent-pale transition-all">
                      {PLATFORM_ICONS[k]} {k.charAt(0).toUpperCase() + k.slice(1)}
                    </a>
                  ) : null
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-3">
                {isOwn ? "Add your GitHub, LeetCode, and other profiles." : "No links added."}
              </p>
            )}
          </div>

          {/* Recent posts */}
          {posts.length > 0 && (
            <div className="bg-white rounded-xl border border-paper-3 shadow-sm p-5">
              <div className="font-display text-base text-ink mb-4">Recent Posts</div>
              {posts.slice(0, 3).map((p) => (
                <div key={p._id} className="pb-3 mb-3 border-b border-paper-2 last:border-0 last:mb-0 last:pb-0">
                  <p className="text-sm leading-relaxed">{p.content.slice(0, 120)}{p.content.length > 120 && "…"}</p>
                  <div className="text-xs text-ink-3 mt-1">{timeAgo(p.createdAt)} · ♡ {p.likesCount || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modals */}
      {editSection === "basic" && (
        <EditBasicModal
          user={profileUser} profile={profile} onClose={() => setEditSection(null)}
          onSave={(u) => { setData((d) => ({ ...d, user: { ...d.user, ...u.user }, profile: { ...d.profile, ...u.profile } })); setEditSection(null); toast.success("Profile updated!"); }}
          toast={toast}
        />
      )}
      {editSection === "skills" && (
        <EditSkillsModal
          profile={profile} onClose={() => setEditSection(null)}
          onSave={(p) => { setData((d) => ({ ...d, profile: p })); setEditSection(null); toast.success("Skills updated!"); }}
          toast={toast}
        />
      )}
      {editSection === "links" && (
        <EditLinksModal
          profile={profile} onClose={() => setEditSection(null)}
          onSave={(p) => { setData((d) => ({ ...d, profile: p })); setEditSection(null); toast.success("Links updated!"); }}
          toast={toast}
        />
      )}
      {editSection === "addExp" && (
        <AddExpModal
          onClose={() => setEditSection(null)}
          onSave={(p) => { setData((d) => ({ ...d, profile: p })); setEditSection(null); toast.success("Experience added!"); }}
          toast={toast}
        />
      )}
      {editSection === "addEdu" && (
        <AddEduModal
          onClose={() => setEditSection(null)}
          onSave={(p) => { setData((d) => ({ ...d, profile: p })); setEditSection(null); toast.success("Education added!"); }}
          toast={toast}
        />
      )}
      {editSection === "addProject" && (
        <AddProjectModal
          onClose={() => setEditSection(null)}
          onSave={(p) => { setData((d) => ({ ...d, profile: p })); setEditSection(null); toast.success("Project added!"); }}
          toast={toast}
        />
      )}
    </div>
  );
}
