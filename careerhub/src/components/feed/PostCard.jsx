import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import Spinner from "../ui/Spinner";
import CommentList from "./CommentList";
import { timeAgo } from "../../lib/utils";
import api from "../../lib/api";

export default function PostCard({ post, user, onLike, onDelete, toast }) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef();

  const isOwner = user && post.author?._id?.toString() === user._id?.toString();
  const likesCount = post.likesCount ?? post.likes?.length ?? 0;

  useEffect(() => {
    function h(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    }
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const toggleComments = async () => {
    setShowComments((s) => !s);
    if (!commentsLoaded) {
      try {
        const data = await api.get(`/posts/${post._id}`);
        setComments(data.comments || []);
        setCommentsLoaded(true);
      } catch {}
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/posts/${post._id}`, { content: editContent });
      post.content = editContent;
      setEditMode(false);
      toast.success("Post updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-paper-3 shadow-sm overflow-hidden hover:border-paper-3 transition-all">
      {/* Header */}
      <div className="p-4 flex gap-3 items-start">
        <Avatar
          user={post.author}
          onClick={() => navigate(`/profile/${post.author?.username}`)}
        />
        <div className="flex-1">
          <div
            className="font-semibold text-sm text-ink cursor-pointer hover:text-accent transition-colors"
            onClick={() => navigate(`/profile/${post.author?.username}`)}
          >
            {post.author?.fullName || post.author?.username}
          </div>
          {post.author?.headline && (
            <div className="text-xs text-ink-3">{post.author.headline}</div>
          )}
          <div className="text-xs text-ink-3 mt-0.5">{timeAgo(post.createdAt)}</div>
        </div>
        {isOwner && (
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setDropdown((d) => !d)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            {dropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-paper-3 shadow-md min-w-[150px] z-50 overflow-hidden dropdown-in">
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-2 hover:bg-paper-2 hover:text-ink text-left transition-colors"
                  onClick={() => { setEditMode(true); setDropdown(false); }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-red hover:bg-brand-red-pale text-left transition-colors"
                  onClick={() => { setDropdown(false); onDelete(post._id); }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {editMode ? (
        <div className="px-4 pb-3">
          <textarea
            className="w-full px-4 py-3 bg-paper border border-paper-3 rounded-xl text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all resize-y min-h-[80px]"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
          />
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-3 py-1.5 text-sm text-ink-2 hover:bg-paper-2 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-1.5 text-sm gradient-bg text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? <Spinner /> : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
          {post.content}
        </div>
      )}

      {post.image?.url && (
        <img className="w-full max-h-[440px] object-cover" src={post.image.url} alt="" />
      )}

      {/* Actions */}
      <div className="px-3 py-2.5 flex gap-0.5 border-t border-paper-2">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            post.isLiked
              ? "text-ch-pink bg-ch-pink-pale"
              : "text-ink-3 hover:bg-paper-2 hover:text-ink"
          }`}
        >
          {post.isLiked ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          )}
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-ink-3 hover:bg-paper-2 hover:text-ink transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentList
          postId={post._id}
          comments={comments}
          setComments={setComments}
          user={user}
          toast={toast}
        />
      )}
    </div>
  );
}
