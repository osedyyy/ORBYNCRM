const toneMap = {
  success: {
    accent: "border-emerald-400 bg-emerald-500/10 text-emerald-50",
    dot: "bg-emerald-300",
  },
  error: {
    accent: "border-rose-400 bg-rose-500/10 text-rose-50",
    dot: "bg-rose-300",
  },
  info: {
    accent: "border-sky-400 bg-sky-500/10 text-sky-50",
    dot: "bg-sky-300",
  },
};

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 w-80">
      {toasts.map((toast) => {
        const tone = toneMap[toast.type] ?? toneMap.info;
        return (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl flex items-start gap-3 ${tone.accent}`}
          >
            <span className={`mt-1 h-2 w-2 rounded-full ${tone.dot}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight">{toast.title}</p>
              {toast.message && <p className="text-xs opacity-90 mt-1 leading-snug">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-xs text-white/80 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
