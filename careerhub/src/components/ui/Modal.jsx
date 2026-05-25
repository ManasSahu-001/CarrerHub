export default function Modal({ title, onClose, children, size }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-ch-navy/60 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-lg w-full max-h-[90vh] overflow-y-auto modal-in ${
          size === "sm" ? "max-w-sm" : "max-w-lg"
        }`}
      >
        <div className="px-6 pt-5 flex items-center justify-between border-b border-paper-2 pb-4">
          <h2 className="font-display font-semibold text-lg text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-paper-2 hover:bg-paper-3 flex items-center justify-center text-ink-2 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
