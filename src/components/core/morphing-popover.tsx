"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "motion/react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

const TRANSITION: Transition = { type: "spring", bounce: 0.1, duration: 0.4 };

type MorphingPopoverContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  uniqueId: string;
  variants: Variants | undefined;
};

const MorphingPopoverContext = createContext<MorphingPopoverContextValue | null>(null);

function useMorphingPopover() {
  const ctx = useContext(MorphingPopoverContext);
  if (!ctx) throw new Error("MorphingPopover subcomponents must be used inside <MorphingPopover>");
  return ctx;
}

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}) {
  const uniqueId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const open = useCallback(() => {
    if (controlledOpen === undefined) setUncontrolledOpen(true);
    onOpenChange?.(true);
  }, [controlledOpen, onOpenChange]);

  const close = useCallback(() => {
    if (controlledOpen === undefined) setUncontrolledOpen(false);
    onOpenChange?.(false);
  }, [controlledOpen, onOpenChange]);

  return { isOpen, open, close, uniqueId };
}

export type MorphingPopoverProps = {
  children: ReactNode;
  transition?: Transition | undefined;
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  variants?: Variants | undefined;
  className?: string | undefined;
};

export function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
}: MorphingPopoverProps) {
  const logic = usePopoverLogic({ defaultOpen, open, onOpenChange });

  return (
    <MorphingPopoverContext.Provider value={{ ...logic, variants }}>
      <MotionConfig transition={transition}>
        <div className={cn("relative flex items-center justify-center", className)}>{children}</div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  );
}

export type MorphingPopoverTriggerProps = Omit<HTMLMotionProps<"button">, "layoutId"> & {
  children: ReactNode;
  wrapperClassName?: string | undefined;
};

export function MorphingPopoverTrigger({
  children,
  className,
  wrapperClassName,
  ...props
}: MorphingPopoverTriggerProps) {
  const ctx = useMorphingPopover();

  return (
    <motion.div
      layoutId={`popover-trigger-${ctx.uniqueId}`}
      className={wrapperClassName}
      style={{ borderRadius: 12 }}
    >
      <motion.button
        type="button"
        {...props}
        layoutId={`popover-label-${ctx.uniqueId}`}
        className={className}
        onClick={ctx.open}
        aria-haspopup="dialog"
        aria-expanded={ctx.isOpen}
        aria-controls={`popover-content-${ctx.uniqueId}`}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

export type MorphingPopoverContentProps = Omit<HTMLMotionProps<"div">, "layoutId"> & {
  children: ReactNode;
};

export function MorphingPopoverContent({
  children,
  className,
  ...props
}: MorphingPopoverContentProps) {
  const ctx = useMorphingPopover();
  const { isOpen, close } = ctx;
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, close, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {ctx.isOpen && (
        <motion.div
          {...props}
          ref={ref}
          layoutId={`popover-trigger-${ctx.uniqueId}`}
          id={`popover-content-${ctx.uniqueId}`}
          role="dialog"
          aria-modal="false"
          className={cn("absolute z-50 overflow-hidden", className)}
          style={{ borderRadius: 16, ...props.style }}
          initial="initial"
          animate="animate"
          exit="exit"
          {...(ctx.variants ? { variants: ctx.variants } : {})}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
