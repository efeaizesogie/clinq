"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import PulseField from "@/components/landing/PulseField";

/* Shared building blocks for the public site — see DESIGN.md */

export const H1 = "text-navy font-[600] tracking-[-0.035em] leading-[1.04] text-[40px] sm:text-[52px] lg:text-[60px] text-balance";
export const H2 = "text-navy font-[600] tracking-[-0.03em] leading-[1.08] text-[32px] md:text-[44px] text-balance";
export const H3 = "text-navy font-[600] tracking-[-0.02em] leading-[1.2] text-[24px] md:text-[28px] text-balance";
export const LEDE = "text-[17px] md:text-[18px] leading-[1.55] text-steel";
/** Small sans label for table headers and field names (not a heading kicker). */
export const LABEL = "text-[12px] font-[500] text-steel";
export const BTN_PRIMARY =
  "group h-11 pl-5 pr-4 rounded-[8px] bg-action text-action-fg text-[15px] font-[600] inline-flex items-center justify-center gap-1.5 shadow-[var(--shadow-btn)] transition-colors hover:bg-action-hover";
export const BTN_OUTLINE =
  "h-11 px-6 rounded-[8px] border border-navy/80 text-navy text-[15px] font-[600] inline-flex items-center justify-center transition-colors hover:bg-navy/[0.04]";
export const BTN_ON_DARK =
  "group h-11 pl-5 pr-4 rounded-[8px] bg-white text-brand-blue text-[15px] font-[600] inline-flex items-center justify-center gap-1.5 shadow-[var(--shadow-btn)] transition-colors hover:bg-white/90";
export const BTN_OUTLINE_ON_DARK =
  "h-11 px-6 rounded-[8px] border border-white/40 text-white text-[15px] font-[600] inline-flex items-center justify-center transition-colors hover:bg-white/10";
export const INPUT =
  "w-full h-11 rounded-[8px] bg-surface border border-line text-[14px] text-ink placeholder:text-fog focus:outline-none focus:border-navy/40 focus:ring-4 focus:ring-teal/15 transition";
export const CONTAINER = "w-full max-w-[1200px] mx-auto px-5 md:px-8";

/** Recolours one of the single-colour brand SVGs in /public via CSS mask. */
export function MaskIcon({ src, className = "" }: { src: string; className?: string }) {
  const mask: React.CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
  return <span aria-hidden="true" className={`inline-block bg-current ${className}`} style={mask} />;
}

export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-[1.5] text-ink">
      <Check className="mt-1 w-4 h-4 text-teal-ink shrink-0" strokeWidth={2.25} />
      {children}
    </li>
  );
}

/** Compact interior-page header on the canvas, with a quiet heartbeat strip on the right. */
export function PageHeader({
  title,
  lede,
  children,
  aside,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-canvas pt-16 border-b border-line">
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <PulseField baseline={0.62} fadeFrom={0.5} spikeAt={0.78} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-canvas" />
      </div>
      <div className={`relative ${CONTAINER} pt-20 pb-16 md:pt-28 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end`}>
        <div className="lg:col-span-7 flex flex-col items-start gap-5">
          <h1 className={H1}>{title}</h1>
          {lede && <p className={`max-w-[580px] ${LEDE}`}>{lede}</p>}
          {children && <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>}
        </div>
        {aside && <div className="lg:col-span-5 lg:justify-self-end w-full lg:w-auto">{aside}</div>}
      </div>
    </section>
  );
}

/** 8px segmented control (Column pill-button group). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 p-1 rounded-[10px] bg-surface border border-line">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-9 px-3.5 rounded-[8px] text-[13px] font-[500] transition-colors ${
            value === o.value ? "bg-action text-action-fg shadow-[var(--shadow-btn)]" : "text-steel hover:text-navy hover:bg-canvas"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Minimal dropdown select with an 8px trigger. Closes on outside click and Escape. */
export function SelectMenu({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 px-4 rounded-[8px] bg-surface border border-line flex items-center justify-between gap-3 text-[14px] text-ink hover:border-navy/30 transition-colors"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`w-4 h-4 text-steel transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-2 w-full max-h-72 overflow-auto rounded-[10px] bg-surface border border-line shadow-[var(--shadow-product)] p-1"
        >
          {options.map((o) => (
            <li key={o}>
              <button
                role="option"
                aria-selected={o === value}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`w-full h-9 px-3 rounded-[6px] text-left text-[13px] flex items-center justify-between transition-colors ${
                  o === value ? "bg-canvas text-navy font-[600]" : "text-ink hover:bg-canvas"
                }`}
              >
                {o}
                {o === value && <Check className="w-3.5 h-3.5 text-teal-ink" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Person photo that falls back to flat brand-navy initials when the URL is missing or fails to load. */
export function Portrait({
  src,
  alt,
  initials,
  className = "",
  imgClassName = "",
  textClassName = "text-[12px]",
  fill = false,
}: {
  src?: string | null;
  alt: string;
  initials: string;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  /** Stretch to cover the nearest positioned ancestor instead of sizing itself. */
  fill?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const showImage = !!src && !failed;

  // An image can fail before hydration attaches onError — catch that case too
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  return (
    <span
      className={`${fill ? "absolute inset-0" : "relative"} overflow-hidden bg-[#0F4C81] dark:bg-[#1d4f78] text-white font-[600] flex items-center justify-center ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`} />
      ) : (
        <span aria-label={alt} role="img" className={textClassName}>
          {initials}
        </span>
      )}
    </span>
  );
}

/** Navy closing band with the inverted heartbeat. */
export function ClosingBand({
  title,
  body,
  children,
}: {
  title: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-blue dark:bg-[#0D1C2E] dark:border-t dark:border-[#1C2B3D]">
      <div className="absolute inset-0 pointer-events-none">
        <PulseField tone="dark" baseline={0.6} fadeFrom={0.4} />
      </div>
      <div className={`relative ${CONTAINER} py-24 md:py-32`}>
        <div className="max-w-[620px] flex flex-col gap-5">
          <h2 className="text-white font-[600] tracking-[-0.035em] leading-[1.06] text-[34px] md:text-[48px] text-balance">{title}</h2>
          {body && <p className="text-[17px] leading-[1.6] text-[#c9d8e8] max-w-[520px]">{body}</p>}
          {children && <div className="mt-3 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}
