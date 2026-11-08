type Props = {
  label: string;
  count: number;
  /** Small status dot color. */
  dot: string;
};

/** Glass card that heads a board column: status label and item count. */
export function GlassColumnHeader({ label, count, dot }: Props) {
  return (
    <div className="glass-chip mb-3 flex items-center justify-between gap-3 overflow-hidden rounded-xl px-3.5 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: dot, boxShadow: `0 0 10px ${dot}` }}
        />
        <h3 className="truncate text-[11px] font-medium tracking-[0.12em] text-[#D8D9E2] uppercase">
          {label}
        </h3>
      </div>
      <span
        className="min-w-7 rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-center text-xs font-medium text-[#F5F5F7] tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        aria-label={`${count} ${count === 1 ? "item" : "itens"}`}
      >
        {count}
      </span>
    </div>
  );
}
