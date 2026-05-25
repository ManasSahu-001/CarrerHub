import { useState } from "react";
import api from "../../lib/api";
import Spinner from "./Spinner";

export default function FollowBtn({ targetId, toast, size = "xs" }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const data = await api.post(`/users/${targetId}/follow`, {});
      setFollowing(data.following);
      toast.info(data.following ? "Following" : "Unfollowed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sizeClass = size === "xs" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full font-semibold transition-all disabled:opacity-50 flex items-center gap-1 ${sizeClass} ${
        following
          ? "border border-paper-3 text-ink-2 hover:border-ink-2 hover:text-ink bg-paper-2"
          : "gradient-bg text-white hover:opacity-90"
      }`}
    >
      {loading ? <Spinner /> : following ? "Following" : "Follow"}
    </button>
  );
}
