"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeftIcon, CornerDownLeft } from "lucide-react";
import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/core/morphing-popover";
import { cn } from "@/lib/utils";

type Props = {
  /** Trigger text; it morphs into the field placeholder when the popover opens. */
  label: string;
  /** Placeholder shown inside the panel (defaults to `label`). */
  placeholder?: string;
  icon?: ReactNode;
  /** Value loaded into the field every time the panel opens. */
  initialValue?: string;
  submitLabel?: string;
  /** Enter submits (Shift+Enter breaks a line). Ctrl/⌘+Enter always submits. */
  submitOnEnter?: boolean;
  /** Return false to keep the panel open (e.g. empty value). */
  onSubmit: (value: string) => boolean | void;
  className?: string;
  triggerClassName?: string;
  triggerWrapperClassName?: string;
  /** Size and anchor of the open panel, e.g. "right-0 top-0 w-[364px]". */
  contentClassName?: string;
  fieldHeight?: number;
};

export function MorphingTextPopover({
  label,
  placeholder,
  icon,
  initialValue = "",
  submitLabel = "Salvar",
  submitOnEnter = false,
  onSubmit,
  className,
  triggerClassName,
  triggerWrapperClassName,
  contentClassName,
  fieldHeight = 140,
}: Props) {
  const uniqueId = useId();
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  // Reload the field only when the panel opens, never while the user types.
  const handleOpenChange = (open: boolean) => {
    if (open) setValue(initialValue);
    setIsOpen(open);
  };

  const close = () => setIsOpen(false);
  const submit = () => {
    if (onSubmit(value) === false) return;
    close();
  };

  return (
    <MorphingPopover
      transition={{ type: "spring", bounce: 0.05, duration: 0.3 }}
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={className}
    >
      <MorphingPopoverTrigger
        wrapperClassName={triggerWrapperClassName}
        className={cn(
          "group/trigger flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          triggerClassName,
        )}
      >
        {icon}
        <motion.span layoutId={`popover-label-${uniqueId}`} className="whitespace-nowrap">
          {label}
        </motion.span>
      </MorphingPopoverTrigger>

      <MorphingPopoverContent className={cn("glass-panel p-0", contentClassName)}>
        <form
          className="relative flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <motion.span
            layoutId={`popover-label-${uniqueId}`}
            aria-hidden="true"
            style={{ opacity: value ? 0 : 1 }}
            className="pointer-events-none absolute top-3 left-4 text-sm text-muted-foreground select-none"
          >
            {placeholder ?? label}
          </motion.span>
          <textarea
            aria-label={placeholder ?? label}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-foreground outline-none"
            style={{ height: fieldHeight }}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (e.metaKey || e.ctrlKey || (submitOnEnter && !e.shiftKey)) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div className="flex items-center justify-between border-t border-white/[0.06] py-2.5 pr-3 pl-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={close}
              aria-label="Fechar"
            >
              <ArrowLeftIcon size={16} />
            </button>
            <button
              type="submit"
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#F5F5F7] px-3 text-xs font-medium text-[#0B0C0F] transition-[transform,background-color] select-none hover:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.97]"
            >
              {submitLabel}
              <CornerDownLeft size={12} className="opacity-60" />
            </button>
          </div>
        </form>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}
