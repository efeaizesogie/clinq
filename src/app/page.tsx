"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import PulseField from "@/components/landing/PulseField";
import {
  BTN_ON_DARK, BTN_OUTLINE, BTN_OUTLINE_ON_DARK, BTN_PRIMARY, CheckItem, ClosingBand, H2, LABEL, MaskIcon, Portrait,
} from "@/components/landing/ui";
import { usePlatformData } from "@/lib/hooks/usePlatformData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ───────────────────────── Content ───────────────────────── */

const INSURERS = ["Aetna", "BlueCross", "UnitedHealthcare", "Cigna", "Axa", "Medicare"];

const CAMPUSES = [
  { name: "Clinq Main Hospital HQ", city: "London", lat: 51.5212, lng: -0.1302 },
  { name: "Clinq Lagos Medical Center", city: "Lagos", lat: 6.5182, lng: 3.3842 },
  { name: "Clinq New York Hospital", city: "New York", lat: 40.7306, lng: -73.9975 },
  { name: "Clinq Tokyo Health Clinic", city: "Tokyo", lat: 35.6895, lng: 139.6917 },
  { name: "Clinq Intl. Medical HQ", city: "Cape Town", lat: -33.9249, lng: 18.4241 },
];

const TESTIMONIALS = [
  {
    quote: "The digital check-in saved me so much time. I was seen by Dr. Sharma within 5 minutes of arriving.",
    name: "Marcus Sharma",
    role: "Patient",
    initials: "MS",
  },
  {
    quote: "The portal makes managing my family's appointments so simple. Everything is in one place.",
    name: "Lisa Chen",
    role: "Patient",
    initials: "LC",
  },
  {
    quote: "Expert care and a very clean facility. The cardiology team at Clinq is truly world-class.",
    name: "James Miller",
    role: "Patient",
    initials: "JM",
  },
];

const FAQS = [
  {
    q: "How do I book an appointment?",
    a: 'Select "Book appointment", choose your preferred clinician, pick a date and slot, and confirm. Your records sync immediately.',
  },
  {
    q: "Can I manage my family's records?",
    a: "Yes. After creating a patient profile, you can register dependents under one account and track their health records, vitals and consultation logs.",
  },
  {
    q: "Is my medical data secure?",
    a: "Clinq complies fully with HIPAA standards. All medical charts, diagnostic history and patient–doctor messages are protected with 256-bit encryption.",
  },
  {
    q: "Can I consult a doctor remotely?",
    a: "Yes. Our integrated telehealth platform supports remote consultations, so you can speak with a specialist without travelling.",
  },
  {
    q: "Which insurance providers do you accept?",
    a: "We work with leading providers including Aetna, BlueCross, UnitedHealthcare, Cigna, Axa and Medicare.",
  },
];

/* ───────────────────────── Building blocks ───────────────────────── */

/** Real app screen in a quiet window frame (Column-style product card). Swaps to `darkSrc` in dark mode. */
function AppWindow({
  src,
  darkSrc,
  alt,
  width,
  height,
  label,
  sizes = "(min-width: 1024px) 680px, 100vw",
  priority = false,
  float = false,
}: {
  src: string;
  darkSrc?: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  sizes?: string;
  priority?: boolean;
  float?: boolean;
}) {
  return (
    <figure
      className={`rounded-[12px] overflow-hidden bg-surface border border-line ${
        float ? "shadow-[var(--shadow-float)]" : "shadow-[var(--shadow-product)]"
      }`}
    >
      <div className="h-9 px-4 flex items-center gap-3 border-b border-line bg-canvas">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
        </span>
        <figcaption className="flex-1 text-center text-[12px] font-[500] text-fog truncate">{label}</figcaption>
        <span className="w-[42px]" aria-hidden="true" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={`block w-full h-auto ${darkSrc ? "dark:hidden" : ""}`}
      />
      {darkSrc && (
        // display:none keeps the lazy image from loading until dark mode is actually on
        <Image src={darkSrc} alt={alt} width={width} height={height} sizes={sizes} className="hidden dark:block w-full h-auto" />
      )}
    </figure>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function LandingPage() {
  const { data, isLoading, error } = usePlatformData();
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [campusIdx, setCampusIdx] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  // Only load the map iframe once the campus section approaches
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One authored scroll moment: the dashboard opens up as it rises into view
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        // Dashboard showcase opens up to full size as it rises into view
        gsap.fromTo(
          ".showcase",
          { scale: 0.94, y: 40 },
          {
            scale: 1,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: ".showcase", start: "top bottom", end: "top 30%", scrub: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
    }
  }, [isLoading]);

  const departments = data?.departments ?? [];
  const specialists = data?.specialists ?? [];
  const blogPosts = data?.blogPosts ?? [];
  const stats = data?.stats;

  const filteredDoctors = specialists.filter((doc) => {
    const deptName = doc.department_name || "";
    const matchesDept = selectedDept === "all" || deptName.toLowerCase().includes(selectedDept.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesSearch = doc.full_name.toLowerCase().includes(q) || doc.specialty.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });
  const visibleDoctors = filteredDoctors.slice(0, 6);
  const campus = CAMPUSES[campusIdx];

  return (
    <div ref={rootRef} className="relative w-full bg-canvas font-sans antialiased text-steel transition-colors duration-300">
      <PublicNavbar />

      <main>
        {/* ═════════════════ HERO ═════════════════ */}
        <section className="relative overflow-hidden bg-canvas pt-16">
          <div className="absolute inset-x-0 top-[48%] bottom-0 lg:inset-0 pointer-events-none">
            <PulseField baseline={0.56} fadeFrom={0.3} />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas" />
          </div>

          <div className="relative w-full max-w-[1200px] mx-auto px-5 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center pt-14 pb-20 md:pt-20 lg:pt-0 lg:pb-0 lg:min-h-[min(780px,calc(100svh-64px-96px))]">
              {/* Copy */}
              <div className="lg:col-span-5 flex flex-col items-start">
                <h1 className="text-navy font-[600] tracking-[-0.035em] leading-[1.02] text-[44px] sm:text-[56px] lg:text-[64px] text-balance">
                  Healthcare that fits your life.
                </h1>
                <p className="mt-6 max-w-[440px] text-[17px] md:text-[18px] leading-[1.55] text-steel">
                  Instantly book consultations with top medical specialists, secure your lab reports, check pharmacy supplies, and message doctors through one clean, secure portal.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/patient/appointments/book" className={BTN_PRIMARY}>
                    Book appointment
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/about" className={BTN_OUTLINE}>
                    Learn more
                  </Link>
                </div>
                <ul className="mt-8 flex flex-col gap-2 text-[14px] text-steel">
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                    Accepting new patients
                    {stats?.totalDepartments ? ` across ${stats.totalDepartments} departments` : ""}
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-ink shrink-0" />
                    HIPAA compliant, with 256-bit encryption
                  </li>
                </ul>
              </div>

              {/* Product widget */}
              <div className="lg:col-span-7 relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[460px] lg:mr-6">
                  <div className="relative rounded-[12px] bg-surface shadow-[var(--shadow-float)] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
                      <span className="text-[13px] font-[600] text-ink">Upcoming visit</span>
                      <span className="font-mono text-[11px] text-fog">CLQ-20931</span>
                    </div>

                    <div className="px-5 pt-5 flex items-center gap-3.5">
                      <span className="w-10 h-10 rounded-full bg-[#0F4C81] text-white text-[12px] font-[600] flex items-center justify-center shrink-0">
                        AS
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] font-[600] text-ink">Dr. Arya Sharma</span>
                        <span className="block text-[13px] text-steel">Senior Cardiologist</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-[15px] font-[600] text-ink tabular-nums">10:30</span>
                        <span className="block text-[12px] text-steel">Tue, 14 Oct</span>
                      </span>
                    </div>

                    <div className="px-5 pt-4 flex flex-wrap gap-1.5">
                      {["Confirmed", "Insurance verified", "Records synced"].map((chip) => (
                        <span
                          key={chip}
                          className="h-6 pl-1.5 pr-2.5 rounded-full border border-line text-[11px] font-[500] text-ink flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-teal-ink" strokeWidth={2.5} />
                          {chip}
                        </span>
                      ))}
                    </div>

                    <dl className="mt-5 border-t border-line divide-y divide-line text-[13px]">
                      {[
                        ["Location", "Main Hospital HQ, Cardiology"],
                        ["Visit", "In person · 30 minutes"],
                        ["Reminder", "SMS, 24 hours before"],
                      ].map(([k, v]) => (
                        <div key={k} className="px-5 h-11 flex items-center justify-between gap-4">
                          <dt className="text-steel">{k}</dt>
                          <dd className="text-ink font-[500] text-right">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Message notification */}
                  <div
                    className="hidden sm:flex absolute -left-10 lg:-left-24 top-full mt-3 w-[270px] items-start gap-3 rounded-[12px] bg-surface shadow-[var(--shadow-product)] border border-line p-4"
                  >
                    <span className="w-8 h-8 rounded-[8px] bg-canvas text-teal-ink flex items-center justify-center shrink-0">
                      <MaskIcon src="/messages.svg" className="w-4 h-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-[600] text-ink">Dr. Arya Sharma</span>
                        <time className="font-mono text-[12px] text-steel">09:14</time>
                      </span>
                      <span className="block text-[12px] leading-[1.45] text-steel mt-0.5">
                        Your results look great. See you on Tuesday.
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurer bar */}
          <div className="relative border-t border-line/70">
            <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
              <span className="text-[13px] text-steel shrink-0">Accepted insurers</span>
              <div className="flex flex-wrap items-center gap-x-10 gap-y-3 md:justify-between md:flex-1">
                {INSURERS.map((name) => (
                  <span key={name} className="text-[17px] font-[700] tracking-[-0.03em] text-steel">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ PRODUCT SHOWCASE + STATS ═════════════════ */}
        <section className="bg-surface border-y border-line overflow-hidden">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
              <div className="lg:col-span-7">
                <h2 className={H2}>Everything you need, the moment you sign in.</h2>
              </div>
              <p className="lg:col-span-5 text-[17px] leading-[1.55] text-steel max-w-[440px]">
                Vitals, upcoming visits, prescriptions and lab results on one calm dashboard, with booking, messaging and refills a single click away.
              </p>
            </div>

            <div className="showcase mt-12 md:mt-16 origin-top">
              <AppWindow
                src="/screens/dashboard.webp"
                darkSrc="/screens/dashboard-dark.webp"
                width={3840}
                height={2480}
                label="Patient portal · Dashboard"
                alt="Clinq patient dashboard with a personal greeting, latest vitals and quick actions"
                sizes="(min-width: 1200px) 1136px, 100vw"
                priority
              />
            </div>
            <p className="mt-10 max-w-[720px] text-[15px] leading-[1.6] text-steel">
              Trusted by{" "}
              <span className="text-ink font-[600]">{stats?.totalPatients ? `${Math.round(stats.totalPatients / 1000)}k` : "10k"}+ patients</span> and{" "}
              <span className="text-ink font-[600]">{stats?.totalSpecialists || 50}+ board-certified specialists</span>, with a 99.4% patient
              satisfaction rating and support around the clock.
            </p>
          </div>
        </section>

        {/* ═════════════════ FEATURE · SCHEDULING ═════════════════ */}
        <section className="bg-canvas">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <h2 className={H2}>Real-time availability, without the phone queue.</h2>
              <p className="text-[17px] leading-[1.55] text-steel max-w-[440px]">
                See exactly when your preferred specialists are free and secure your slot instantly.
              </p>
              <ul className="mt-2 flex flex-col gap-3.5">
                <CheckItem>Digital registration and check-in that cut paperwork and wait times.</CheckItem>
                <CheckItem>Integrated telehealth for remote consultations.</CheckItem>
                <CheckItem>Confirmation and reminders sent the moment you book.</CheckItem>
              </ul>
              <Link href="/patient/appointments/book" className="mt-3 self-start text-[15px] font-[600] text-navy inline-flex items-center gap-1 group">
                Find a time
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="lg:col-span-7 lg:pl-8">
              <div className="relative">
                <AppWindow
                  src="/screens/appointment-time.webp"
                  darkSrc="/screens/appointment-time-dark.webp"
                  width={3840}
                  height={3120}
                  label="Patient portal · Book appointment"
                  alt="Clinq booking flow, step 3 of 4: choosing an appointment time with a booking summary"
                />
                {/* Confirmation toast */}
                <div className="absolute -right-3 sm:-right-6 -top-6 rounded-[12px] bg-surface shadow-[var(--shadow-float)] px-4 py-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-teal/15 text-teal-ink flex items-center justify-center">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-[600] text-ink">Slot reserved</span>
                    <span className="block text-[12px] text-steel">SMS and email sent</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ FEATURE · RECORDS ═════════════════ */}
        <section className="bg-surface border-y border-line">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <h2 className={H2}>Your health history, in one secure portal.</h2>
              <p className="text-[17px] leading-[1.55] text-steel max-w-[440px]">
                Manage your health history and upcoming visits in one secure, easy-to-access place, long after you leave the clinic.
              </p>
              <ul className="mt-2 flex flex-col gap-3.5">
                <CheckItem>Comprehensive digital medical records, available instantly.</CheckItem>
                <CheckItem>Lab results from state-of-the-art diagnostic equipment.</CheckItem>
                <CheckItem>Prescriptions, messages and billing alongside your chart.</CheckItem>
              </ul>
              <Link href="/login" className="mt-3 self-start text-[15px] font-[600] text-navy inline-flex items-center gap-1 group">
                Open the patient portal
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="lg:col-span-7 lg:pl-8">
              <div className="relative pb-10 sm:pb-16">
                <AppWindow
                  src="/screens/health-records.webp"
                  darkSrc="/screens/health-records-dark.webp"
                  width={3840}
                  height={2940}
                  label="Patient portal · My Health Records"
                  alt="Clinq My Health Records screen showing allergies, immunizations and a clinical timeline"
                />
                <div className="absolute right-0 sm:-right-6 bottom-0 w-[72%] sm:w-[62%]">
                  <AppWindow
                    src="/screens/lab-results.webp"
                    darkSrc="/screens/lab-results-dark.webp"
                    width={3840}
                    height={3000}
                    label="Lab Results"
                    alt="Clinq Diagnostic Reports screen listing recent lab results and their review status"
                    sizes="(min-width: 1024px) 440px, 62vw"
                    float
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ HOW IT WORKS ═════════════════ */}
        <section className="bg-canvas">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32">
            <h2 className={`${H2} max-w-[600px]`}>Your journey to better health.</h2>

            <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 border-t border-line">
              <li className="pt-8 pb-2 md:pr-8 flex flex-col">
                <h3 className="text-[22px] font-[600] tracking-[-0.02em] text-navy">Expert matching</h3>
                <p className="mt-2 text-[15px] leading-[1.55] text-steel">Search verified specialists by name, specialty or department.</p>
                <div className="mt-8 flex flex-col gap-3">
                  <div className="h-10 rounded-[8px] bg-surface border border-line px-3 flex items-center gap-2 text-[13px] text-steel">
                    <Search className="w-3.5 h-3.5" /> Cardiology
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Cardiology", "Pediatrics", "Orthopedics"].map((d, i) => (
                      <span
                        key={d}
                        className={`h-6 px-2.5 rounded-full text-[11px] font-[500] flex items-center border ${
                          i === 0 ? "border-navy/70 text-navy" : "border-line text-steel"
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </li>

              <li className="pt-8 pb-2 md:px-8 md:border-l md:border-line flex flex-col">
                <h3 className="text-[22px] font-[600] tracking-[-0.02em] text-navy">Instant confirmation</h3>
                <p className="mt-2 text-[15px] leading-[1.55] text-steel">Pick a time that works for you. Your slot is confirmed immediately.</p>
                <div className="mt-8 rounded-[8px] bg-canvas border border-line p-4">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i} className="text-[11px] font-[500] text-fog">{d}</span>
                    ))}
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-7 rounded-[6px] text-[12px] tabular-nums flex items-center justify-center ${
                          i === 8 ? "bg-action text-action-fg font-[600]" : i % 7 > 4 ? "text-fog" : "text-ink"
                        }`}
                      >
                        {6 + i}
                      </span>
                    ))}
                  </div>
                </div>
              </li>

              <li className="pt-8 pb-2 md:px-8 md:border-l md:border-line flex flex-col">
                <h3 className="text-[22px] font-[600] tracking-[-0.02em] text-navy">24/7 access</h3>
                <p className="mt-2 text-[15px] leading-[1.55] text-steel">Results, prescriptions, messages and billing in your portal, any hour.</p>
                <ul className="mt-8 rounded-[8px] bg-canvas border border-line divide-y divide-line">
                  {[
                    { icon: "/lab-result.svg", label: "Lab results", meta: "1 new" },
                    { icon: "/prescription.svg", label: "Prescriptions", meta: "2 active" },
                    { icon: "/messages.svg", label: "Messages", meta: "Today" },
                    { icon: "/billing.svg", label: "Billing", meta: "Paid" },
                  ].map((r) => (
                    <li key={r.label} className="h-10 px-3.5 flex items-center gap-3 text-[13px]">
                      <MaskIcon src={r.icon} className="w-3.5 h-3.5 text-teal-ink" />
                      <span className="flex-1 text-ink font-[500]">{r.label}</span>
                      <span className="text-[12px] text-steel">{r.meta}</span>
                    </li>
                  ))}
                </ul>
              </li>
            </ol>
          </div>
        </section>

        {/* ═════════════════ SPECIALISTS ═════════════════ */}
        <section id="specialists-section" className="bg-surface border-y border-line">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="flex flex-col gap-4 max-w-[560px]">
                <h2 className={H2}>Find your specialist.</h2>
                <p className="text-[17px] leading-[1.55] text-steel">
                  Search our verified practitioner directory by clinical specialty or medical unit.
                </p>
              </div>
              <div className="relative w-full lg:w-[360px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or specialty"
                  aria-label="Search specialists"
                  className="w-full h-11 rounded-[8px] bg-canvas border border-line pl-10 pr-4 text-[14px] text-ink placeholder:text-fog focus:outline-none focus:border-navy/40 focus:ring-4 focus:ring-teal/15 transition"
                />
              </div>
            </div>

            {/* Department filter — dot-separated */}
            {departments.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-y-2 text-[14px]">
                {[{ id: "all", name: "All specialties" }, ...departments.map((d) => ({ id: d.name, name: d.name }))].map((d, i) => (
                  <React.Fragment key={d.id}>
                    {i > 0 && <span aria-hidden="true" className="px-3 text-teal">·</span>}
                    <button
                      onClick={() => setSelectedDept(d.id)}
                      aria-pressed={selectedDept === d.id}
                      className={`py-1 border-b transition-colors ${
                        selectedDept === d.id
                          ? "text-navy font-[600] border-navy"
                          : "text-steel border-transparent hover:text-navy"
                      }`}
                    >
                      {d.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="mt-8 rounded-[12px] border border-line bg-surface shadow-[var(--shadow-hair)] overflow-hidden">
              <div className={`hidden md:grid grid-cols-12 gap-4 px-6 h-10 items-center bg-canvas border-b border-line ${LABEL}`}>
                <span className="col-span-4">Specialist</span>
                <span className="col-span-3">Department</span>
                <span className="col-span-3">Availability</span>
                <span className="col-span-2 text-right">Rating</span>
              </div>

              {isLoading ? (
                <div className="divide-y divide-line">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[76px] px-6 flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-canvas animate-pulse" />
                      <span className="h-3 w-48 rounded bg-canvas animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : visibleDoctors.length > 0 ? (
                <ul className="divide-y divide-line">
                  {visibleDoctors.map((doc) => (
                    <li key={doc.id}>
                      <Link
                        href="/patient/appointments/book"
                        className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center transition-colors hover:bg-canvas"
                      >
                        <span className="md:col-span-4 flex items-center gap-3.5 min-w-0">
                          <Portrait src={doc.image_url} alt={doc.full_name} initials={doc.initials || "MD"} className="w-10 h-10 rounded-full shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-[15px] font-[600] text-ink truncate">{doc.full_name}</span>
                            <span className="block text-[13px] text-steel truncate">{doc.specialty}</span>
                          </span>
                        </span>
                        <span className="md:col-span-3">
                          <span className="inline-flex h-6 px-2.5 rounded-full border border-line text-[12px] text-steel items-center">
                            {doc.department_name || "Specialist"}
                          </span>
                        </span>
                        <span className="md:col-span-3 flex items-center gap-2 text-[13px] text-ink">
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.is_available ? "bg-teal" : "bg-fog"}`} />
                          {doc.availability_text || (doc.is_available ? "Available" : "Fully booked")}
                        </span>
                        <span className="md:col-span-2 flex items-center md:justify-end gap-4">
                          {doc.rating ? (
                            <span className="flex items-center gap-1 text-[13px] font-[600] text-ink tabular-nums">
                              <Star className="w-3.5 h-3.5 fill-teal text-teal" />
                              {Number(doc.rating).toFixed(1)}
                            </span>
                          ) : null}
                          <span className="w-8 h-8 rounded-[8px] border border-line flex items-center justify-center text-navy transition-colors group-hover:bg-action group-hover:text-action-fg group-hover:border-transparent">
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-14 flex flex-col items-center text-center gap-2">
                  <p className="text-[15px] font-[600] text-ink">
                    {error ? "The directory is unavailable right now." : "No specialists match that search."}
                  </p>
                  <p className="text-[14px] text-steel max-w-[380px]">
                    {error
                      ? "You can still browse every specialist on the full directory page."
                      : "Try a different name, specialty or department."}
                  </p>
                </div>
              )}

              <Link
                href="/specialists"
                className="flex items-center justify-between px-6 h-12 border-t border-line bg-canvas text-[14px] font-[600] text-navy group"
              >
                View the full directory
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═════════════════ VOICES ═════════════════ */}
        <section className="bg-canvas">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32">
            <figure className="max-w-[920px]">
              <blockquote className="text-navy font-[500] tracking-[-0.025em] leading-[1.2] text-[28px] md:text-[40px] text-balance">
                “Clinq has unified our hospital&apos;s operations. We&apos;ve seen a{" "}
                <span className="text-teal-ink">40% reduction in surgical delays</span> and total inventory transparency across all wards.”
              </blockquote>
              <figcaption className="mt-6 text-[14px]">
                <span className="font-[600] text-ink">Chief Medical Officer</span>
                <span className="text-steel"> · Clinq Medical Systems</span>
              </figcaption>
            </figure>

            <div className="mt-16 md:mt-20 pt-10 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
              {TESTIMONIALS.map((t, i) => (
                <figure
                  key={t.name}
                  className={`flex flex-col gap-6 ${i > 0 ? "md:pl-10 md:border-l md:border-line" : ""} ${i < 2 ? "md:pr-10" : ""}`}
                >
                  <blockquote className="text-[17px] leading-[1.55] text-ink">“{t.quote}”</blockquote>
                  <figcaption className="mt-auto flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-surface border border-line text-navy text-[12px] font-[700] flex items-center justify-center">
                      {t.initials}
                    </span>
                    <span>
                      <span className="block text-[14px] font-[600] text-ink">{t.name}</span>
                      <span className="block text-[13px] text-steel">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════ RESOURCES ═════════════════ */}
        {(isLoading || blogPosts.length > 0) && (
          <section className="bg-surface border-y border-line">
            <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="flex flex-col gap-4">
                  <h2 className={H2}>Latest from Clinq.</h2>
                  <p className="text-[17px] text-steel">Stay informed with expert health tips and hospital updates.</p>
                </div>
                <Link href="/resources" className={`${BTN_OUTLINE} self-start sm:self-auto`}>
                  View all resources
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-[16/10] rounded-[12px] bg-canvas animate-pulse" />
                    ))
                  : blogPosts.slice(0, 3).map((blog) => {
                      const date = blog.published_at ? new Date(blog.published_at) : null;
                      return (
                        <Link key={blog.id} href={`/resources/${blog.id}`} className="group flex flex-col gap-4">
                          <div className="relative aspect-[16/10] rounded-[12px] overflow-hidden bg-canvas border border-line">
                            {blog.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={blog.image_url}
                                alt={blog.title}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-teal/50">
                                <MaskIcon src="/lab-result.svg" className="w-8 h-10" />
                              </div>
                            )}
                          </div>
                          <p className="text-[13px] text-steel">
                            {blog.category}
                            {date && !isNaN(date.getTime()) && (
                              <>
                                {" · "}
                                <time dateTime={date.toISOString()}>{format(date, "MMM d, yyyy")}</time>
                              </>
                            )}
                          </p>
                          <h3 className="text-[20px] font-[600] tracking-[-0.02em] leading-[1.3] text-navy group-hover:text-navy-2 transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-[15px] leading-[1.55] text-steel line-clamp-2">{blog.description}</p>
                        </Link>
                      );
                    })}
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════ FAQ ═════════════════ */}
        <section className="bg-canvas">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24 self-start">
              <h2 className={H2}>Frequently asked questions.</h2>
              <p className="text-[16px] leading-[1.55] text-steel">
                Quick answers to the most common questions.{" "}
                <a href="mailto:info@clinq.healthcare" className="text-navy font-[600] underline decoration-navy/25 underline-offset-4 hover:decoration-navy">
                  Email us
                </a>{" "}
                for anything else.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 border-t border-line">
              {FAQS.map((faq, idx) => {
                const open = activeFaq === idx;
                return (
                  <div key={faq.q} className="border-b border-line">
                    <button
                      onClick={() => setActiveFaq(open ? null : idx)}
                      aria-expanded={open}
                      aria-controls={`faq-${idx}`}
                      className="w-full min-h-16 py-5 flex items-center justify-between gap-6 text-left"
                    >
                      <span className="text-[16px] md:text-[17px] font-[600] tracking-[-0.01em] text-navy">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-steel transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      id={`faq-${idx}`}
                      className={`grid transition-[grid-template-rows] duration-400 ease-[var(--ease-out-soft)] ${
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-6 pr-10 text-[15px] leading-[1.65] text-steel">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═════════════════ CAMPUSES ═════════════════ */}
        <section className="bg-surface border-t border-line">
          <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <h2 className={H2}>Visit our campus.</h2>
              <p className="text-[17px] leading-[1.55] text-steel max-w-[440px]">
                Centrally located in the medical district, with 24/7 emergency access and ample parking for patients and visitors.
              </p>

              <ul className="mt-2 rounded-[12px] border border-line overflow-hidden divide-y divide-line">
                {CAMPUSES.map((c, i) => (
                  <li key={c.name}>
                    <button
                      onClick={() => setCampusIdx(i)}
                      aria-pressed={campusIdx === i}
                      className={`w-full h-12 px-4 flex items-center justify-between gap-4 text-left transition-colors ${
                        campusIdx === i ? "bg-canvas" : "hover:bg-canvas/60"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${campusIdx === i ? "bg-teal" : "bg-line"}`} />
                        <span className={`text-[14px] ${campusIdx === i ? "font-[600] text-navy" : "text-ink"}`}>{c.name}</span>
                      </span>
                      <span className="text-[13px] text-steel">{c.city}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <dl className="mt-2 flex flex-col gap-3 text-[14px]">
                {[
                  { icon: <MapPin className="w-4 h-4" />, label: "Address", value: "123 Healthcare Blvd, Medical District" },
                  { icon: <Phone className="w-4 h-4" />, label: "Telephone", value: "+1 (555) 019-2834" },
                  { icon: <Mail className="w-4 h-4" />, label: "Email", value: "info@clinq.healthcare" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-teal-ink">{row.icon}</span>
                    <dt className="sr-only">{row.label}</dt>
                    <dd className="text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-7">
              <div ref={mapRef} className="relative h-[360px] sm:h-[480px] rounded-[12px] overflow-hidden border border-line bg-canvas shadow-[var(--shadow-product)]">
                {mapReady && (
                  <iframe
                    key={campus.name}
                    title={`Map of ${campus.name}`}
                    src={`https://maps.google.com/maps?q=${campus.lat},${campus.lng}&z=14&ie=UTF8&iwloc=&output=embed`}
                    loading="lazy"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0 grayscale-[0.3] dark:invert dark:hue-rotate-180 dark:grayscale"
                  />
                )}
                <div className="absolute left-4 bottom-4 rounded-[8px] bg-surface border border-line px-4 py-3 shadow-[var(--shadow-hair)]">
                  <p className="text-[13px] font-[600] text-ink">{campus.name}</p>
                  <p className="mt-0.5 text-[12px] text-steel">
                    Open 24/7 · <span className="font-mono tabular-nums">{campus.lat.toFixed(4)}, {campus.lng.toFixed(4)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ CLOSING CTA ═════════════════ */}
        <ClosingBand
          title="Better care, every time."
          body="Book an appointment in just a few clicks. Choose your doctor, pick a time that works for you, and we'll take care of the rest."
        >
          <Link href="/patient/appointments/book" className={BTN_ON_DARK}>
            Book appointment
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/login" className={BTN_OUTLINE_ON_DARK}>
            Sign in
          </Link>
        </ClosingBand>
      </main>

      <PublicFooter />
    </div>
  );
}
