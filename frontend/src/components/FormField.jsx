export default function FormField({ label, helperText, error, required, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-100 flex items-center gap-2">
        {label}
        {required && <span className="text-[11px] text-purple-200">Required</span>}
      </span>
      {children}
      {helperText && <span className="text-xs text-slate-400">{helperText}</span>}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </label>
  );
}
