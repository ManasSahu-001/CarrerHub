import { useState } from "react";
import Avatar from "../ui/Avatar";
import Spinner from "../ui/Spinner";
import api from "../../lib/api";

export default function PostComposer({ user, onPost, toast }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [posting, setPosting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append("content", content.trim());
      fd.append("visibility", visibility);
      const post = await api.postForm("/posts", fd);
      onPost(post);
      setContent("");
      setOpen(false);
      toast.success("Post published!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  const improveWithAI = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    try {
      const data = await api.post("/ai/improve-post", { content });
      setContent(data.improved);
      toast.success("Post improved with AI ✦");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-paper-3 shadow-sm p-4">
      <div className="flex gap-3 items-start">
        <Avatar user={user} />
        <textarea
          className="flex-1 px-4 py-2.5 bg-paper-2 border border-transparent rounded-xl text-sm text-ink placeholder-ink-3 outline-none focus:border-accent/40 focus:bg-white focus:ring-2 focus:ring-accent/8 transition-all resize-none min-h-[44px]"
          placeholder="Share something with the community…"
          value={content}
          rows={open ? 4 : 1}
          onChange={(e) => { setContent(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-paper-2">
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-1.5 bg-paper-2 border border-paper-3 rounded-lg text-xs text-ink-2 outline-none focus:border-accent transition-colors"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">🌍 Public</option>
              <option value="connections">🔒 Connections</option>
            </select>
            <button
              onClick={improveWithAI}
              disabled={aiLoading || !content.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ch-violet-pale text-ch-violet hover:bg-ch-violet/15 transition-colors disabled:opacity-50"
            >
              {aiLoading ? <Spinner /> : <span>✦</span>} AI Improve
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-3">{content.length}/2000</span>
            <button
              onClick={() => { setOpen(false); setContent(""); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-ink-2 hover:bg-paper-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={posting || !content.trim()}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold gradient-bg text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {posting ? <Spinner /> : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
