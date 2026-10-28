"use client";

import { useEffect, useRef } from "react";

type Tone = "light" | "dark";

interface PulseFieldProps {
  tone?: Tone;
  /** Vertical position of the ECG baseline, 0–1 of the canvas height. */
  baseline?: number;
  /** Where the field starts fading in from the left, 0–1 of the width (keeps headlines clean). */
  fadeFrom?: number;
  /** Horizontal position of the first R-wave spike, 0–1 of the width. */
  spikeAt?: number;
  className?: string;
}

const SPACING = 9;

// One beat of a stylised ECG (P, Q, R, S, T waves) as a sum of gaussians, t in [0, 1)
function ecg(t: number) {
  const g = (mu: number, w: number, a: number) => a * Math.exp(-((t - mu) ** 2) / (2 * w * w));
  return g(0.16, 0.03, 0.09) + g(0.3, 0.008, -0.08) + g(0.33, 0.011, 1) + g(0.365, 0.01, -0.24) + g(0.56, 0.045, 0.2);
}

const PALETTES: Record<Tone, { from: [number, number, number]; to: [number, number, number]; floor: number }> = {
  light: { from: [15, 76, 129], to: [95, 158, 160], floor: 0.1 },
  dark: { from: [95, 158, 160], to: [207, 232, 233], floor: 0.08 },
};

interface Dot {
  x: number;
  y: number;
  base: number; // 0–1 closeness to the trace
  mask: number; // 0–1 horizontal fade
  col: string; // "r,g,b"
}

/**
 * Halftone heartbeat — Clinq's signature visual. A dot grid whose dots swell along an ECG trace,
 * with a slow monitor sweep travelling left to right. Static when reduced motion is requested.
 */
export default function PulseField({ tone = "light", baseline = 0.62, fadeFrom = 0.28, spikeAt = 0.47, className = "" }: PulseFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = PALETTES[tone];
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let staticLayer: HTMLCanvasElement | null = null;
    let raf = 0;
    let visible = true;
    let last = 0;
    let head = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const amp = Math.min(height * 0.4, 260);
      const base = height * baseline;
      const sigma = 11;
      // One beat roughly every 45% of the width, with the first spike pinned at `spikeAt`
      const period = Math.max(360, width * 0.45);
      const traceAt = (x: number) => base - amp * ecg(((((x - width * spikeAt) / period + 0.33) % 1) + 1) % 1);

      // Sample the trace finely so dot intensity follows true distance to the curve —
      // otherwise the steep R-wave only lights a single vertical column of dots.
      const STEP = 2;
      const samples: number[] = [];
      for (let sx = 0; sx <= width + STEP; sx += STEP) samples.push(traceAt(sx));
      const reach = Math.ceil((sigma * 2.2) / STEP);

      dots = [];
      for (let x = SPACING / 2; x < width; x += SPACING) {
        const fx = Math.min(1, Math.max(0, (x / width - fadeFrom) / 0.32));
        const mask = fx * fx * (3 - 2 * fx);
        if (mask <= 0.01) continue;
        const k = x / width;
        const col = palette.from.map((c, i) => Math.round(c + (palette.to[i] - c) * k)).join(",");
        const si = Math.round(x / STEP);
        const lo = Math.max(0, si - reach);
        const hi = Math.min(samples.length - 1, si + reach);
        for (let y = SPACING / 2; y < height; y += SPACING) {
          let d2 = Infinity;
          for (let j = lo; j <= hi; j++) {
            const dx = j * STEP - x;
            const dy = samples[j] - y;
            const dd = dx * dx + dy * dy;
            if (dd < d2) d2 = dd;
          }
          const near = Math.exp(-d2 / (sigma * sigma));
          // faint ambient field, strongest around the baseline band
          const ambient = 0.13 * Math.exp(-(((y - base) / (height * 0.4)) ** 2));
          const v = Math.max(near, ambient);
          if (v < 0.04) continue;
          dots.push({ x, y, base: v, mask, col });
        }
      }

      staticLayer = document.createElement("canvas");
      staticLayer.width = canvas.width;
      staticLayer.height = canvas.height;
      const sctx = staticLayer.getContext("2d");
      if (!sctx) return;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const dot of dots) paint(sctx, dot, 0);
      drawFrame();
    };

    const paint = (c: CanvasRenderingContext2D, dot: Dot, boost: number) => {
      const v = Math.min(1, dot.base + boost);
      const r = 0.55 + 1.55 * v;
      const a = (palette.floor + 0.72 * v) * dot.mask;
      c.fillStyle = `rgba(${dot.col},${a})`;
      c.beginPath();
      c.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      c.fill();
    };

    const drawFrame = () => {
      if (!staticLayer) return;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(staticLayer, 0, 0, width, height);
      if (reduced) return;
      // Monitor sweep: dots near the travelling head brighten and grow
      const span = 150;
      for (const dot of dots) {
        const dx = head - dot.x;
        if (dx < -20 || dx > span) continue;
        const trail = dx < 0 ? Math.exp(-((dx / 10) ** 2)) : Math.exp(-dx / (span * 0.45));
        const boost = trail * dot.base * 0.85;
        if (boost > 0.03) paint(ctx, dot, boost);
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      head += dt * 0.16; // px per ms
      if (head > width + 200) head = width * fadeFrom - 40;
      drawFrame();
    };

    build();
    head = width * 0.45;
    if (!reduced) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => build());
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [tone, baseline, fadeFrom, spikeAt]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`block w-full h-full ${className}`} />;
}
