interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[200]
        flex items-center gap-2
        bg-[#1E293B] border border-emerald-500 text-emerald-400
        px-5 py-[10px] rounded-xl text-[13px] whitespace-nowrap
        transition-transform duration-300
        ${visible ? "translate-y-0" : "-translate-y-24"}
      `}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}
