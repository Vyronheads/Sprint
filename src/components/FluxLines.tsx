"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export type FluxLinesProps = {
  /** Up to three line colors (hex). */
  colors?: string[];
  /** Halo strength around each line. */
  glow?: number;
  /** Width (0–0.5, share of the viewport) of the soft fade at the canvas edges. */
  rimWidth?: number;
  /** Line core thickness in CSS pixels. */
  lineWidth?: number;
  flowDirection?: "down" | "up" | "left" | "right";
  mouseInteraction?: boolean;
  clickSwirl?: boolean;
  speed?: number;
  /** Zoom of the field; higher = more, thinner bands. */
  scale?: number;
  /** How strongly the lines bend. */
  turbulence?: number;
  /** How fast the bends themselves evolve. */
  fluidity?: number;
  /** Tightness of the glow falloff. */
  sharpness?: number;
  /** Travelling light along the lines. */
  shimmer?: number;
  mouseStrength?: number;
  /** Mouse influence radius, as a share of the viewport height. */
  mouseRadius?: number;
  /** Reveal the lines top-down on mount. */
  intro?: boolean;
  /** Dark lines for light backgrounds. */
  lightMode?: boolean;
  /** Global opacity of the effect. */
  opacity?: number;
  className?: string;
  style?: CSSProperties;
};

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uTime;
uniform float uDpr;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform vec3 uSwirl;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uGlow;
uniform float uRim;
uniform float uLineW;
uniform vec2 uDir;
uniform float uScale;
uniform float uTurb;
uniform float uFluid;
uniform float uSharp;
uniform float uShimmer;
uniform float uMStr;
uniform float uMRad;
uniform float uIntro;
uniform float uLight;
uniform float uOpacity;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y) * 2.0 - 1.0;
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 toField = vec2(aspect, 1.0) * uScale;
  vec2 p = (uv - 0.5) * toField;

  // Mouse: push the field away from the cursor.
  vec2 m = (uMouse - 0.5) * toField;
  vec2 d = p - m;
  float rad = max(uMRad * uScale, 1e-3);
  float infl = exp(-dot(d, d) / (rad * rad)) * uMouseOn * uMStr;
  p += normalize(d + 1e-5) * infl * 0.22;

  // Click: decaying swirl around the click point.
  vec2 s = (uSwirl.xy - 0.5) * toField;
  vec2 ds = p - s;
  p = s + rot(uSwirl.z * 2.6 * exp(-dot(ds, ds) * 2.2)) * ds;

  // Orient so bands run along the flow direction and travel with it.
  vec2 dir = normalize(uDir);
  vec2 side = vec2(-dir.y, dir.x);
  float along = dot(p, -dir) + uTime;
  float across = dot(p, side);
  vec2 q = vec2(across, along);

  float w1 = fbm(q * 0.55 + vec2(0.0, uTime * uFluid));
  float w2 = fbm(q * 0.9 + vec2(4.3, 1.1) - vec2(uTime * uFluid * 0.6, 0.0));
  float f = across * 1.1 + uTurb * (w1 * 1.35 + w2 * 0.55);

  float v = f * 3.2;
  float px = abs(fract(v) - 0.5) / max(fwidth(v), 1e-4);
  px /= uDpr;

  float core = 1.0 - smoothstep(uLineW * 0.5, uLineW * 0.5 + 1.0, px);
  float halo = pow(exp(-px / (3.0 * max(uGlow, 0.01))), max(uSharp * 0.45, 0.2)) * 0.45;
  float line = core + halo;

  // Bands drift in and out so the field never reads as a uniform grid.
  float presence = smoothstep(-0.25, 0.45, fbm(q * 0.28 + vec2(7.0, -uTime * 0.12)));
  float idx = floor(v + 0.5);
  float shimmer = 0.55 + 0.45 * sin(along * 2.2 - idx * 1.7 - uTime * 2.4);
  shimmer = mix(1.0, shimmer, clamp(uShimmer * 0.6, 0.0, 1.0));

  float k = mod(idx, 3.0);
  vec3 col = k < 0.5 ? uC0 : (k < 1.5 ? uC1 : uC2);

  vec2 e2 = min(uv, 1.0 - uv);
  float rim = smoothstep(0.0, max(uRim, 1e-3), min(e2.x, e2.y));

  float reveal = 1.0 - smoothstep(uIntro * 1.25 - 0.25, uIntro * 1.25, 1.0 - uv.y);

  float a = clamp(line * presence * shimmer * rim * reveal * uIntro * uOpacity, 0.0, 1.0);
  vec3 c = mix(col, vec3(0.04), uLight);
  outColor = vec4(c * a, a);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "f");
  const n = Number.parseInt(full.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const DIRS: Record<NonNullable<FluxLinesProps["flowDirection"]>, [number, number]> = {
  down: [0, -1],
  up: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export default function FluxLines({
  colors = ["#ffffff", "#ffffff", "#ffffff"],
  glow = 2,
  rimWidth = 0.2,
  lineWidth = 1,
  flowDirection = "down",
  mouseInteraction = false,
  clickSwirl = false,
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  sharpness = 2.5,
  shimmer = 1.5,
  mouseStrength = 1,
  mouseRadius = 0.35,
  intro = false,
  lightMode = false,
  opacity = 1,
  className,
  style,
}: FluxLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Latest props, read every frame without restarting the GL context.
  const propsRef = useRef({
    colors,
    glow,
    rimWidth,
    lineWidth,
    flowDirection,
    mouseInteraction,
    clickSwirl,
    speed,
    scale,
    turbulence,
    fluidity,
    sharpness,
    shimmer,
    mouseStrength,
    mouseRadius,
    lightMode,
    opacity,
  });
  propsRef.current = {
    colors,
    glow,
    rimWidth,
    lineWidth,
    flowDirection,
    mouseInteraction,
    clickSwirl,
    speed,
    scale,
    turbulence,
    fluidity,
    sharpness,
    shimmer,
    mouseStrength,
    mouseRadius,
    lightMode,
    opacity,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      premultipliedAlpha: true,
      antialias: false,
      alpha: true,
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        console.warn("FluxLines shader:", gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("FluxLines link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (name: string) => gl.getUniformLocation(prog, name);
    const u = {
      res: U("uRes"),
      time: U("uTime"),
      dpr: U("uDpr"),
      mouse: U("uMouse"),
      mouseOn: U("uMouseOn"),
      swirl: U("uSwirl"),
      c0: U("uC0"),
      c1: U("uC1"),
      c2: U("uC2"),
      glow: U("uGlow"),
      rim: U("uRim"),
      lineW: U("uLineW"),
      dir: U("uDir"),
      scale: U("uScale"),
      turb: U("uTurb"),
      fluid: U("uFluid"),
      sharp: U("uSharp"),
      shimmer: U("uShimmer"),
      mStr: U("uMStr"),
      mRad: U("uMRad"),
      intro: U("uIntro"),
      light: U("uLight"),
      opacity: U("uOpacity"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer state in canvas UV space (y up), eased toward the target.
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, ton: 0 };
    const swirl = { x: 0.5, y: 0.5, z: 0 };
    const toUv = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    };
    const onMove = (e: PointerEvent) => {
      if (!propsRef.current.mouseInteraction) return;
      const p = toUv(e);
      mouse.tx = p.x;
      mouse.ty = p.y;
      mouse.ton = 1;
    };
    const onLeave = () => {
      mouse.ton = 0;
    };
    const onDown = (e: PointerEvent) => {
      if (!propsRef.current.clickSwirl || reduced) return;
      const p = toUv(e);
      swirl.x = p.x;
      swirl.y = p.y;
      swirl.z = (Math.random() < 0.5 ? -1 : 1) * 1.0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let last = performance.now();
    let t = Math.random() * 100;
    let introP = intro && !reduced ? 0 : 1;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const P = propsRef.current;
      if (!reduced) t += dt * P.speed;
      if (introP < 1) introP = Math.min(1, introP + dt / 2.2);
      const ease = 1 - Math.pow(1 - introP, 3);

      const k = 1 - Math.exp(-dt * 6);
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      mouse.on += (mouse.ton - mouse.on) * k;
      swirl.z *= Math.exp(-dt * 1.4);

      const [c0, c1, c2] = [0, 1, 2].map((i) => hexToRgb(P.colors[i] ?? P.colors[0] ?? "#ffffff"));
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.mouseOn, P.mouseInteraction ? mouse.on : 0);
      gl.uniform3f(u.swirl, swirl.x, swirl.y, swirl.z);
      gl.uniform3fv(u.c0, c0!);
      gl.uniform3fv(u.c1, c1!);
      gl.uniform3fv(u.c2, c2!);
      gl.uniform1f(u.glow, P.glow);
      gl.uniform1f(u.rim, P.rimWidth);
      gl.uniform1f(u.lineW, P.lineWidth);
      gl.uniform2fv(u.dir, DIRS[P.flowDirection]);
      gl.uniform1f(u.scale, P.scale);
      gl.uniform1f(u.turb, P.turbulence);
      gl.uniform1f(u.fluid, P.fluidity);
      gl.uniform1f(u.sharp, P.sharpness);
      gl.uniform1f(u.shimmer, P.shimmer);
      gl.uniform1f(u.mStr, P.mouseStrength);
      gl.uniform1f(u.mRad, P.mouseRadius);
      gl.uniform1f(u.intro, ease);
      gl.uniform1f(u.light, P.lightMode ? 1 : 0);
      gl.uniform1f(u.opacity, P.opacity);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
    // The GL context is created once; live props are read through propsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
