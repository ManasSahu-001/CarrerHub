export default function Spinner({ large = false }) {
  return (
    <div
      className={`rounded-full animate-spin flex-shrink-0 ${
        large
          ? "w-9 h-9 border-[3.5px]"
          : "w-5 h-5 border-2"
      }`}
      style={{ borderTopColor: "#4f46e5", borderColor: "#d8d8e8" }}
    />
  );
}
