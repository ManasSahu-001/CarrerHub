import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { timeAgo } from "../../lib/utils";
import api from "../../lib/api";

export default function CommentList({ postId, comments, setComments, user, toast }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const addComment = async (e) => {
    if (e.key !== "Enter" || !text.trim()) return;
    try {
      const c = await api.post(`/posts/${postId}/comments`, { content: text });
      setComments((prev) => [c, ...prev]);
      setText("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteComment = async (cid) => {
    try {
      await api.delete(`/posts/${postId}/comments/${cid}`);
      setComments((prev) => prev.filter((c) => c._id !== cid));
    } catch {}
  };

  return (
    <div className="border-t border-paper-2 px-4 py-3">
      {user && (
        <div className="flex gap-2.5 items-center mb-3">
          <Avatar user={user} size="sm" />
          <input
            className="flex-1 px-4 py-2 bg-paper-2 border border-transparent rounded-xl text-sm text-ink outline-none focus:border-accent/50 focus:bg-white transition-all transition-colors"
            placeholder="Add a comment… (press Enter)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={addComment}
          />
        </div>
      )}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-2.5">
            <Avatar
              user={c.author}
              size="sm"
              onClick={() => navigate(`/profile/${c.author?.username}`)}
            />
            <div className="flex-1 bg-paper-2 rounded-xl px-3 py-2 text-sm">
              <div
                className="font-semibold text-sm cursor-pointer hover:text-accent transition-colors"
                onClick={() => navigate(`/profile/${c.author?.username}`)}
              >
                {c.author?.fullName || c.author?.username}
              </div>
              <div className="text-ink-2 leading-snug mt-0.5">{c.content}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-ink-3">{timeAgo(c.createdAt)}</span>
                {user && c.author?._id === user._id && (
                  <button
                    onClick={() => deleteComment(c._id)}
                    className="text-xs text-brand-red hover:underline"
                  >
                    delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
