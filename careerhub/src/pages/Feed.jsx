import { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import PostCard from "../components/feed/PostCard";
import PostComposer from "../components/feed/PostComposer";
import Sidebar from "../components/shared/Sidebar";
import Spinner from "../components/ui/Spinner";
import api from "../lib/api";

function WelcomeBanner({ user }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user?.fullName?.split(" ")[0] || user?.username || "there";

  return (
    <div className="rounded-xl overflow-hidden mb-1" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #e11d74 100%)" }}>
      <div className="px-6 py-5 relative">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translateY(40%)" }} />
        <div className="relative">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{greeting} 👋</p>
          <h2 className="text-white font-display font-bold text-xl mb-1">Welcome back, {name}!</h2>
          <p className="text-white/65 text-sm">Share what you're building, learning, or thinking — your network wants to hear from you.</p>
        </div>
      </div>
    </div>
  );
}

export default function Feed({ toast }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = async (p = 1) => {
    try {
      const data = await api.get(`/posts?page=${p}&limit=10`);
      if (p === 1) setPosts(data.posts);
      else setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(p < data.pagination.pages);
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const toggleLike = async (postId) => {
    if (!user) { toast.error("Log in to like posts"); return; }
    try {
      const data = await api.post(`/posts/${postId}/like`, {});
      setPosts((ps) =>
        ps.map((p) =>
          p._id === postId
            ? { ...p, isLiked: data.liked, likesCount: data.likesCount }
            : p
        )
      );
    } catch {}
  };

  const deletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((ps) => ps.filter((p) => p._id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 py-6">
        {/* Feed */}
        <div className="flex flex-col gap-4">
          {user && <WelcomeBanner user={user} />}

          {user && (
            <PostComposer
              user={user}
              onPost={(p) => setPosts((ps) => [p, ...ps])}
              toast={toast}
            />
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner large />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-ink-3">
              <div className="text-4xl mb-3">📭</div>
              <div>No posts yet. Be the first to share something!</div>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                user={user}
                onLike={toggleLike}
                onDelete={deletePost}
                toast={toast}
              />
            ))
          )}

          {hasMore && !loading && (
            <button
              onClick={() => { const np = page + 1; setPage(np); load(np); }}
              className="w-full py-2.5 border border-paper-3 rounded-xl text-sm font-medium text-ink-2 hover:border-accent hover:text-accent hover:bg-accent-pale transition-colors"
            >
              Load more
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar user={user} toast={toast} />
        </div>
      </div>
    </div>
  );
}
