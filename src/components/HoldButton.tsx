"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type HoldButtonProps = {
  children: ReactNode;
  /** Label shown once the hold completes. */
  doneLabel?: ReactNode;
  backgroundColor?: string;
  fillColor?: string;
  textColor?: string;
  fillTextColor?: string;
  size?: "sm" | "md" | "lg";
  radius?: number;
  fillDirection?: "right" | "left" | "up" | "down";
  /** ms the button must be held to confirm. */
  holdTime?: number;
  /** ms the fill takes to drain after an early release. */
  releaseTime?: number;
  pressScale?: number;
  /** Wavy leading edge on the fill. */
  wave?: boolean;
  waveAmplitude?: number;
  glow?: boolean;
  /** ms before the button returns to its idle state after confirming (0 = stay done). */
  resetAfter?: number;
  onHold?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  title?: string;
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
} as const;

export default function HoldButton({
  children,
  doneLabel = "Feito",
  backgroundColor = "#27272a",
  fillColor = "#5227FF",
  textColor = "#f5f5f5",
  fillTextColor = "#ffffff",
  size = "md",
  radius = 14,
  fillDirection = "right",
  holdTime = 2000,
  releaseTime = 200,
  pressScale = 0.97,
  wave = false,
  waveAmplitude = 6,
  glow = false,
  resetAfter = 1200,
  onHold,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
  title,
}: HoldButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const holding = useRef(false);
  const doneRef = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const phase = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onHoldRef = useRef(onHold);
  onHoldRef.current = onHold;

  const [pressed, setPressed] = useState(false);
  const [done, setDone] = useState(false);

  const paint = useCallback(() => {
    const btn = btnRef.current;
    const fill = fillRef.current;
    if (!btn || !fill) return;
    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    const p = progress.current;
    const horizontal = fillDirection === "left" || fillDirection === "right";
    const len = horizontal ? w : h;
    const cross = horizontal ? h : w;
    const amp = wave && p > 0 && p < 1 ? waveAmplitude : 0;
    // Leading edge travels from -amp to len + amp so the wave fully clears both ends.
    const edge = p * (len + amp * 2) - amp;
    const steps = amp ? 14 : 1;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const c = (i / steps) * cross;
      const e = edge + (amp ? Math.sin((c / cross) * Math.PI * 2 + phase.current) * amp : 0);
      pts.push(
        fillDirection === "right"
          ? `${e}px ${c}px`
          : fillDirection === "left"
            ? `${w - e}px ${c}px`
            : fillDirection === "down"
              ? `${c}px ${e}px`
              : `${c}px ${h - e}px`,
      );
    }
    const base =
      fillDirection === "right"
        ? [`0px ${h}px`, `0px 0px`]
        : fillDirection === "left"
          ? [`${w}px ${h}px`, `${w}px 0px`]
          : fillDirection === "down"
            ? [`${w}px 0px`, `0px 0px`]
            : [`${w}px ${h}px`, `0px ${h}px`];
    fill.style.clipPath = p <= 0 ? "inset(0 100% 0 0)" : `polygon(${[...pts, ...base].join(",")})`;
    if (glow)
      btn.style.boxShadow =
        p > 0
          ? `0 0 ${8 + p * 26}px ${fillColor}${Math.round(p * 0x66)
              .toString(16)
              .padStart(2, "0")}`
          : "";
  }, [fillDirection, wave, waveAmplitude, glow, fillColor]);

  const tick = useCallback(
    (now: number) => {
      const dt = now - last.current;
      last.current = now;
      phase.current += dt * 0.012;
      if (doneRef.current) {
        paint();
        return;
      }
      if (holding.current) {
        progress.current = Math.min(1, progress.current + dt / holdTime);
        if (progress.current >= 1) {
          doneRef.current = true;
          holding.current = false;
          setPressed(false);
          setDone(true);
          paint();
          onHoldRef.current?.();
          if (resetAfter > 0) {
            resetTimer.current = setTimeout(() => {
              doneRef.current = false;
              setDone(false);
              last.current = performance.now();
              raf.current = requestAnimationFrame(tick);
            }, resetAfter);
          }
          return;
        }
      } else {
        progress.current = Math.max(0, progress.current - dt / Math.max(releaseTime, 1));
      }
      paint();
      if (holding.current || progress.current > 0) raf.current = requestAnimationFrame(tick);
    },
    [holdTime, releaseTime, resetAfter, paint],
  );

  const begin = () => {
    if (disabled || doneRef.current || holding.current) return;
    holding.current = true;
    setPressed(true);
    cancelAnimationFrame(raf.current);
    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };
  const release = () => {
    if (!holding.current) return;
    holding.current = false;
    setPressed(false);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(resetTimer.current);
    },
    [],
  );

  const label = done ? doneLabel : children;

  return (
    <button
      ref={btnRef}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      draggable={false}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.focus();
        e.currentTarget.setPointerCapture(e.pointerId);
        begin();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          begin();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") release();
      }}
      onBlur={release}
      className={cn(
        "relative isolate inline-flex shrink-0 cursor-pointer touch-none items-center justify-center overflow-hidden font-medium whitespace-nowrap select-none",
        "transition-[transform,box-shadow] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        SIZES[size],
        className,
      )}
      style={{
        background: backgroundColor,
        color: textColor,
        borderRadius: radius,
        transform: pressed ? `scale(${pressScale})` : undefined,
        ...style,
      }}
    >
      <span className="relative z-0 inline-flex items-center gap-[inherit]">{label}</span>
      <span
        ref={fillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 inline-flex items-center justify-center gap-[inherit]"
        style={{ background: fillColor, color: fillTextColor, clipPath: "inset(0 100% 0 0)" }}
      >
        {label}
      </span>
      <span className="sr-only" aria-live="polite">
        {done ? doneLabel : ""}
      </span>
    </button>
  );
}
