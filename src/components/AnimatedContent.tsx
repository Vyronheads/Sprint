"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export type AnimatedContentProps = {
  children: ReactNode;
  /** Travel distance in px. */
  distance?: number;
  direction?: "vertical" | "horizontal";
  /** Come from above/left instead of below/right. */
  reverse?: boolean;
  duration?: number;
  ease?: string;
  /** Initial blur in px (0 = none). */
  blur?: number;
  /** Delay between children, in seconds. Each direct child animates in turn. */
  stagger?: number;
  /** Share of the element that must be in view before it plays (0–1). */
  threshold?: number;
  initialOpacity?: number;
  scale?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
};

export default function AnimatedContent({
  children,
  distance = 100,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  ease = "power3.out",
  blur = 0,
  stagger = 0,
  threshold = 0.1,
  initialOpacity = 0,
  scale = 1,
  delay = 0,
  onComplete,
  className,
  style,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(el.children) as HTMLElement[];
    if (targets.length === 0) return;

    const axis = direction === "horizontal" ? "x" : "y";
    const offset = reverse ? -distance : distance;

    const ctx = gsap.context(() => {
      gsap.set(targets, {
        [axis]: offset,
        scale,
        opacity: initialOpacity,
        ...(blur > 0 ? { filter: `blur(${blur}px)` } : {}),
      });
      gsap.to(targets, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        ...(blur > 0 ? { filter: "blur(0px)" } : {}),
        duration,
        ease,
        delay,
        stagger,
        // Leave no transform/filter behind: they would trap popovers in a stacking
        // context and disable backdrop blur on the glass surfaces inside.
        clearProps: "transform,filter,opacity",
        scrollTrigger: {
          trigger: el,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
        },
        onComplete: () => onCompleteRef.current?.(),
      });
    }, el);

    return () => ctx.revert();
    // Plays once per mount; remount (e.g. via `key`) to replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
