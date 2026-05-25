import { initials } from "../../lib/utils";

const sizes = {
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-20 h-20 text-2xl",
};

const gradients = [
  "from-accent to-ch-violet",
  "from-ch-pink to-accent",
  "from-ch-teal to-accent",
  "from-ch-violet to-ch-pink",
];

function getGradient(name = "") {
  const code = name.charCodeAt(0) % gradients.length;
  return gradients[code];
}

export default function Avatar({
  user,
  size = "sm",
  onClick,
}) {
  const cls = `
    rounded-full
    flex-shrink-0
    flex
    items-center
    justify-center
    font-semibold
    overflow-hidden
    ${sizes[size]}
    ${onClick ? "cursor-pointer" : ""}
  `;

  // Real image avatar
  if (
    user?.avatar?.url &&
    !user.avatar.url.includes("placehold")
  ) {
    return (
      <img
        src={user.avatar.url}
        alt={user?.username || "avatar"}
        onClick={onClick}
        className={`${cls} object-cover`}
      />
    );
  }

  // Gradient fallback avatar
  const grad = getGradient(
    user?.fullName || user?.username || "U"
  );

  return (
    <div
      className={`${cls} bg-gradient-to-br ${grad} text-white`}
      onClick={onClick}
    >
      {initials(
        user?.fullName || user?.username || "U"
      )}
    </div>
  );
}