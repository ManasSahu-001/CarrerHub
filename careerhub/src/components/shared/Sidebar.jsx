import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import FollowBtn from "../ui/FollowBtn";
import api from "../../lib/api";

function ProfileSideCard({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api
      .get("/profile/me/profile")
      .then((d) => setProfile(d.profile))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-paper-3 shadow-sm overflow-hidden">
      {/* Banner */}
      <div
        className="h-24 relative"
        style={{
          background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #e11d74 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="px-5 pb-5 relative">
        {/* Avatar */}
        <div className="flex justify-center -mt-10 mb-3">
          <div className="bg-white p-[4px] rounded-full shadow-md">
            <Avatar
              user={user}
              size="lg"
              onClick={() => navigate(`/profile/${user.username}`)}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="text-center">
          <div
            className="font-semibold text-base text-ink cursor-pointer hover:text-accent transition-colors"
            onClick={() => navigate(`/profile/${user.username}`)}
          >
            {user.fullName || user.username}
          </div>

          <div className="text-sm text-ink-3 mt-1">
            {profile?.headline || `@${user.username}`}
          </div>
        </div>

        {/* Stats */}
        {profile && (
          <div className="flex justify-around mt-5 pt-4 border-t border-paper-2">
            {[
              ["Followers", profile.followersCount],
              ["Following", profile.followingCount],
              ["Connections", profile.connectionsCount],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="font-bold text-base text-ink">
                  {v ?? 0}
                </div>

                <div className="text-xs text-ink-3 mt-0.5">
                  {k}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestedUsers({ user, toast }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    api
      .get("/profile/search?limit=5")
      .then((d) => setProfiles(d.profiles?.slice(0, 4) || []))
      .catch(() => {});
  }, []);

  if (!profiles.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-paper-3 shadow-sm p-5">
      {/* Heading */}
      <div className="font-display font-semibold text-base text-ink mb-4">
        People to follow
      </div>

      {/* Users */}
      <div className="space-y-4">
        {profiles.map((p) => {
          const u = p.userId;

          if (!u || u._id === user?._id) return null;

          return (
            <div
              key={p._id}
              className="flex items-center gap-3"
            >
              {/* Avatar */}
              <Avatar
                user={u}
                size="md"
                onClick={() =>
                  navigate(`/profile/${u.username}`)
                }
              />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="font-semibold text-sm text-ink truncate cursor-pointer hover:text-accent transition-colors"
                  onClick={() =>
                    navigate(`/profile/${u.username}`)
                  }
                >
                  {u.fullName || u.username}
                </div>

                <div className="text-xs text-ink-3 truncate">
                  @{u.username}
                </div>
              </div>

              {/* Follow Button */}
              {user && (
                <FollowBtn
                  targetId={u._id}
                  toast={toast}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({ user, toast }) {
  return (
    <div className="flex flex-col gap-4 sticky top-[80px]">
      {/* Profile Card */}
      {user && <ProfileSideCard user={user} />}

      {/* Suggested Users */}
      <SuggestedUsers user={user} toast={toast} />
    </div>
  );
}