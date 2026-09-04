"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Syringe,
  CheckCircle2,
  Calendar,
  MapPin,
  Video,
  FileText,
  Clock,
  Activity,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { jsPDF } from "jspdf";
import DownloadPDFButton, { drawPDFHeader, PDF_COLORS } from "@/components/DownloadPDFButton";

interface Allergy {
  id: string;
  allergy_name: string;
  reaction: string;
  severity: string;
}

interface Immunization {
  id: string;
  name: string;
  date_administered: string;
}

interface Appointment {
  id: string;
  date?: string;
  scheduled_at?: string;
  time_start?: string;
  department?: string;
  location?: string;
  status?: string;
  is_urgent?: boolean;
  assigned_doctor?: string;
  notes?: string;
  specialist_id?: string;
  specialists?: { full_name: string };
}

interface TimelineEvent {
  id: string;
  title: string;
  event_date: string;
  category: string;
  description: string;
}

function fmtDate(raw: string | undefined | null) {
  if (!raw) return "—";
  try {
    const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return raw; }
}

function fmtShortDate(raw: string | undefined | null) {
  if (!raw) return "—";
  try {
    const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch { return raw ?? "—"; }
}

function getApptDateStr(appt: Appointment) {
  return appt.date ?? appt.scheduled_at?.split("T")[0] ?? null;
}

function getTimeDisplay(appt: Appointment) {
  if (appt.time_start) return appt.time_start;
  if (appt.scheduled_at) {
    return new Date(appt.scheduled_at).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  }
  return "";
}

function parseToMins(t?: string | null) {
  if (!t) return 0;
  const m = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = Number(m[1]);
  const mins = Number(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + mins;
}

function isAppointmentPast(appt: Appointment): boolean {
  const rawDate = getApptDateStr(appt);
  if (!rawDate) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const todayStr = `${y}-${m}-${d}`;

  if (rawDate < todayStr) return true;
  if (rawDate > todayStr) return false;

  // Same day: check if time has already passed
  const timeStr = appt.time_start;
  if (!timeStr) return false;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return parseToMins(timeStr) <= nowMins;
}

function getStatusStyle(status: string | undefined, isPast: boolean) {
  if (!isPast) {
    if (status === "Confirmed") {
      return { label: "CONFIRMED", bg: "bg-[#D4E6E5] dark:bg-[#1E2E2D]", text: "text-[#576867] dark:text-[#A3B3B2]" };
    }
    return { label: "PENDING", bg: "bg-[#E6EEFF] dark:bg-[#1B2F45]", text: "text-[#00355F] dark:text-[#8EBDF9]" };
  }
  switch (status) {
    case "Confirmed":
    case "Completed":
      return { label: "ATTENDED", bg: "bg-[#DCFCE7] dark:bg-[#183525]", text: "text-[#15803D] dark:text-[#4ADE80]" };
    case "Cancelled":
      return { label: "CANCELLED", bg: "bg-[#FFDAD6] dark:bg-[#451B1B]", text: "text-[#93000A] dark:text-[#FF8989]" };
    case "Pending":
      return { label: "MISSED", bg: "bg-[#FEF3C7] dark:bg-[#3C2E1B]", text: "text-[#B45309] dark:text-[#FBBF24]" };
    default:
      return { label: "EXPIRED", bg: "bg-[#E0E3E5] dark:bg-[#2A2B2D]", text: "text-[#42474F] dark:text-[#A5AAB5]" };
  }
}

export default function HealthRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [patientName, setPatientName] = useState<string>("Patient Health Summary");
  const [activeFilter, setActiveFilter] = useState<"All" | "Upcoming" | "Past">("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  const handleFilterChange = (f: "All" | "Upcoming" | "Past") => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch patient profile name if available
        const { data: profile } = await supabase
          .from("patient_profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.full_name) {
          setPatientName(profile.full_name);
        }

        // Concurrently query live database records
        const [allergyRes, immunRes, apptRes, timelineRes] = await Promise.all([
          supabase
            .from("patient_allergies")
            .select("id, allergy_name, reaction, severity")
            .eq("patient_id", user.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("patient_immunizations")
            .select("id, name, date_administered")
            .eq("patient_id", user.id)
            .order("date_administered", { ascending: false }),
          supabase
            .from("appointments")
            .select("*, specialists(full_name)")
            .eq("patient_id", user.id)
            .order("date", { ascending: false })
            .order("time_start", { ascending: false }),
          supabase
            .from("patient_timeline_events")
            .select("id, title, event_date, category, description")
            .eq("patient_id", user.id)
            .order("event_date", { ascending: false }),
        ]);

        // Allergies (reflect exact DB data)
        if (allergyRes.data) {
          setAllergies(allergyRes.data);
        }

        // Immunizations (reflect exact DB data)
        if (immunRes.data) {
          setImmunizations(immunRes.data);
        }

        // Appointments (strictly deduplicated by ID)
        if (apptRes.data) {
          const seen = new Set<string>();
          const deduped: Appointment[] = [];
          for (const appt of apptRes.data as Appointment[]) {
            if (appt.id && !seen.has(appt.id)) {
              seen.add(appt.id);
              deduped.push(appt);
            }
          }
          setAppointments(deduped);
        }

        // Timeline Events (strictly deduplicated by ID)
        if (timelineRes.data) {
          const seenEvents = new Set<string>();
          const dedupedEvents: TimelineEvent[] = [];
          for (const ev of timelineRes.data as TimelineEvent[]) {
            if (ev.id && !seenEvents.has(ev.id)) {
              seenEvents.add(ev.id);
              dedupedEvents.push(ev);
            }
          }
          setTimelineEvents(dedupedEvents);
        }
      } catch (err) {
        console.error("Error loading clinical records:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = appointments.filter((a) => {
    const past = isAppointmentPast(a);
    if (activeFilter === "Upcoming") return !past;
    if (activeFilter === "Past") return past;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedAppointments = filtered.slice(startIndex, startIndex + itemsPerPage);

  function buildHealthSummaryPDF(doc: jsPDF) {
    const W = 210;
    const margin = 18;
    const contentW = W - margin * 2;
    let y = drawPDFHeader(doc, `Clinq Medical — ${patientName} Health Summary`);

    const section = (title: string) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFillColor(...PDF_COLORS.light);
      doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
      doc.setFillColor(...PDF_COLORS.navy);
      doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...PDF_COLORS.navy);
      doc.text(title, margin + 8, y + 7);
      y += 16;
    };

    const row = (label: string, value: string, indent = 0) => {
      if (y > 272) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.dark);
      doc.text(label, margin + indent, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...PDF_COLORS.text);
      const lines = doc.splitTextToSize(value, contentW - 52 - indent);
      doc.text(lines, margin + 52 + indent, y);
      y += lines.length * 5 + 2;
    };

    const divider = () => {
      doc.setDrawColor(...PDF_COLORS.border); doc.setLineWidth(0.3);
      doc.line(margin, y, W - margin, y); y += 4;
    };

    section("Allergies");
    if (allergies.length === 0) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.text);
      doc.text("No allergies on record.", margin + 4, y); y += 8;
    } else {
      allergies.forEach((a, i) => {
        row("Allergen:", a.allergy_name); row("Reaction:", a.reaction); row("Severity:", a.severity);
        if (i < allergies.length - 1) divider();
      });
    }
    y += 6;

    section("Immunizations");
    if (immunizations.length === 0) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.text);
      doc.text("No immunization records found.", margin + 4, y); y += 8;
    } else {
      immunizations.forEach((im, i) => {
        row("Vaccine:", im.name); row("Date:", fmtShortDate(im.date_administered));
        if (i < immunizations.length - 1) divider();
      });
    }
    y += 6;

    // Timeline Events Section in PDF if present
    if (timelineEvents.length > 0) {
      section("Clinical Activity Log");
      timelineEvents.forEach((ev, i) => {
        row("Date:", fmtShortDate(ev.event_date));
        row("Event:", `${ev.title} (${ev.category})`);
        row("Notes:", ev.description);
        if (i < timelineEvents.length - 1) divider();
      });
      y += 6;
    }

    section("Appointment History");
    if (appointments.length === 0) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.text);
      doc.text("No appointment history found.", margin + 4, y); y += 8;
    } else {
      appointments.forEach((appt, i) => {
        if (y > 255) { doc.addPage(); y = 20; }
        const past = isAppointmentPast(appt);
        const st = getStatusStyle(appt.status, past);
        const doctor = appt.specialists?.full_name ?? appt.assigned_doctor ?? "—";
        const dateStr = fmtDate(getApptDateStr(appt));
        const time = getTimeDisplay(appt);
        const dept = appt.department ?? "Consultation";
        const loc = appt.location ?? "Virtual Consultation";

        doc.setFillColor(248, 249, 255);
        doc.roundedRect(margin, y, contentW, 32, 2, 2, "F");
        doc.setDrawColor(...PDF_COLORS.border); doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, 32, 2, 2, "S");

        const stripeColor: [number, number, number] =
          st.label === "ATTENDED" ? PDF_COLORS.green
          : st.label === "CANCELLED" ? PDF_COLORS.red
          : st.label === "MISSED" ? PDF_COLORS.amber
          : PDF_COLORS.navy;
        doc.setFillColor(...stripeColor);
        doc.roundedRect(margin, y, 3, 32, 1, 1, "F");

        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...PDF_COLORS.navy);
        doc.text(dateStr, margin + 7, y + 8);
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...PDF_COLORS.text);
        doc.text(time, margin + 7, y + 14);
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...PDF_COLORS.dark);
        doc.text(doctor, margin + 7, y + 22);
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...PDF_COLORS.text);
        doc.text(`${dept}  •  ${loc}`, margin + 7, y + 28);

        const badgeX = W - margin - 28;
        const badgeColors: Record<string, [number, number, number]> = {
          ATTENDED: [212, 230, 229], CANCELLED: [255, 218, 214], MISSED: [254, 243, 199],
          CONFIRMED: [212, 230, 229], PENDING: [220, 233, 255], EXPIRED: [224, 227, 229],
        };
        const badgeTextColors: Record<string, [number, number, number]> = {
          ATTENDED: [87, 104, 103], CANCELLED: [147, 0, 10], MISSED: [180, 83, 9],
          CONFIRMED: [87, 104, 103], PENDING: [0, 53, 95], EXPIRED: [66, 71, 79],
        };
        doc.setFillColor(...(badgeColors[st.label] ?? PDF_COLORS.light));
        doc.roundedRect(badgeX, y + 10, 24, 8, 2, 2, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
        doc.setTextColor(...(badgeTextColors[st.label] ?? PDF_COLORS.text));
        doc.text(st.label, badgeX + 12, y + 15.5, { align: "center" });

        y += 36;
        if (i < appointments.length - 1 && y < 255) y += 2;
      });
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00355F] dark:border-[#1B6CA8] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-[600] text-[#00355F] dark:text-[#5F9EA0]">Loading clinical records from database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 md:gap-16 px-4 md:px-8 py-6 bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[700] uppercase tracking-wider bg-[#D2E4FF] dark:bg-[#1E2D4A] text-[#00355F] dark:text-[#5F9EA0]">
              Synchronized Medical Records
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-[700] leading-tight tracking-[-0.5px] text-[#00355F] dark:text-[#5F9EA0]">
            My Health & Clinical Records
          </h2>
          <p className="text-[15px] md:text-[16px] font-[400] leading-[24px] text-[#42474F] dark:text-[#A5AAB5]">
            A centralized, real-time view of your clinical timeline, active allergies, immunizations, and doctor consultations stored in the database.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/patient/appointments/book"
            className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#00355F] dark:bg-[#1B6CA8] text-white text-[14px] font-[700] hover:bg-[#002645] dark:hover:bg-[#2582C7] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>
          <DownloadPDFButton
            filename="clinq-health-summary"
            label="Download Health Summary (PDF)"
            buildDoc={buildHealthSummaryPDF}
          />
        </div>
      </div>

      {/* ── Bento Grid ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        
        {/* Left Column: Allergies + Immunizations */}
        <div className="flex flex-col gap-6">
          {/* Allergies */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] p-6 flex flex-col gap-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-[20px] h-[20px] text-[#BA1A1A] dark:text-[#FF8989] shrink-0" />
                <span className="text-[17px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">Allergies</span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#FFDAD6] dark:bg-[#451B1B] rounded-full text-[11px] font-[700] tracking-[0.4px] text-[#93000A] dark:text-[#FF8989] transition-colors">
                {allergies.length} Active
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {allergies.length === 0 ? (
                <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5]">No allergies recorded in database.</p>
              ) : (
                allergies.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-1 pb-3 ${idx < allergies.length - 1 ? "border-b border-[#C2C7D1]/50 dark:border-[#22354A]" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-[700] text-[#00355F] dark:text-[#5F9EA0] transition-colors">{item.allergy_name}</span>
                      <span className="text-[11px] font-[600] px-2 py-0.2 rounded bg-[#EFF4FF] dark:bg-[#1E2D4A] text-[#42474F] dark:text-[#A5AAB5] uppercase">
                        {item.severity}
                      </span>
                    </div>
                    <span className="text-[13px] font-[400] leading-snug text-[#42474F] dark:text-[#A5AAB5] transition-colors">{item.reaction}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Immunizations */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] p-6 flex flex-col gap-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-[19px] h-[19px] text-[#516161] dark:text-[#A5AAB5] shrink-0 transition-colors" />
                <span className="text-[17px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">Immunizations</span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#DCFCE7] dark:bg-[#183525] rounded-full text-[11px] font-[700] tracking-[0.4px] text-[#15803D] dark:text-[#4ADE80] transition-colors">
                Verified
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {immunizations.length === 0 ? (
                <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5]">No immunization records found in database.</p>
              ) : (
                immunizations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3.5 py-2.5 bg-[#EFF4FF] dark:bg-[#1E2D4A] rounded-[8px] transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-[700] leading-tight text-[#0D1C2E] dark:text-white transition-colors">{item.name}</span>
                      <span className="text-[11px] font-[500] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{fmtShortDate(item.date_administered)}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline Events / Hospital Activity */}
          {timelineEvents.length > 0 && (
            <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] p-6 flex flex-col gap-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2">
                <Activity className="w-[18px] h-[18px] text-[#00355F] dark:text-[#5F9EA0]" />
                <span className="text-[17px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">Clinical Activity</span>
              </div>
              <div className="flex flex-col gap-3">
                {timelineEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex flex-col gap-1 pb-3 border-b border-[#C2C7D1]/40 dark:border-[#22354A] last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-[700] text-[#0D1C2E] dark:text-white">{event.title}</span>
                      <span className="text-[11px] text-[#42474F] dark:text-[#A5AAB5]">{fmtShortDate(event.event_date)}</span>
                    </div>
                    <p className="text-[12px] text-[#42474F] dark:text-[#A5AAB5] leading-relaxed">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clinical Timeline & Appointments */}
        <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] p-6 flex flex-col gap-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00355F] dark:text-[#5F9EA0]" />
              <span className="text-[18px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">Clinical Timeline & Visits</span>
              <span className="px-2 py-0.5 bg-[#D2E4FF] dark:bg-[#1C2C3E] rounded-full text-[12px] font-[700] tracking-[0.6px] text-[#001C37] dark:text-[#8EBDF9] transition-colors">
                {appointments.length} Total
              </span>
            </div>
            <div className="flex gap-2">
              {(["All", "Upcoming", "Past"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-3 py-1 border border-[#C2C7D1] dark:border-[#22354A] rounded-[10px] text-[12px] font-[700] tracking-[0.4px] transition-colors cursor-pointer ${
                    activeFilter === f
                      ? "bg-[#00355F] dark:bg-[#1B6CA8] text-white border-[#00355F] dark:border-[#1B6CA8]"
                      : "text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-6">
            <div
              className="absolute left-[19px] top-2 bottom-2 w-[2px] pointer-events-none bg-gradient-to-b from-[#00355F] via-[#C2C7D1] dark:via-[#22354A] to-transparent"
            />
            {filtered.length === 0 ? (
              <div className="p-8 text-center bg-[#EFF4FF]/50 dark:bg-[#1E2D4A]/50 rounded-xl border border-dashed border-[#C2C7D1] dark:border-[#22354A]">
                <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5]">No clinical appointments matching this filter.</p>
                <Link
                  href="/patient/appointments/book"
                  className="inline-block mt-3 px-4 py-2 rounded-lg bg-[#00355F] dark:bg-[#1B6CA8] text-white text-[13px] font-[700]"
                >
                  Book New Appointment
                </Link>
              </div>
            ) : (
              paginatedAppointments.map((appt) => {
                const past = isAppointmentPast(appt);
                const st = getStatusStyle(appt.status, past);
                const doctor = appt.specialists?.full_name ?? appt.assigned_doctor ?? "Care Team Physician";
                const dateStr = getApptDateStr(appt);
                const time = getTimeDisplay(appt);
                const dept = appt.department ?? "General Medicine";
                const isTelehealth = !appt.location || appt.location.toLowerCase().includes("telehealth") || appt.location.toLowerCase().includes("virtual");
                const dotColor =
                  st.label === "ATTENDED" ? "bg-[#15803D]"
                  : st.label === "CANCELLED" ? "bg-[#BA1A1A]"
                  : st.label === "MISSED" ? "bg-[#B45309]"
                  : st.label === "CONFIRMED" ? "bg-[#00355F]"
                  : "bg-[#8EBDF9]";

                const rescheduleUrl = `/patient/appointments/book?reschedule_id=${appt.id}${appt.specialist_id ? `&doctor_id=${appt.specialist_id}` : ''}${appt.department ? `&specialty=${encodeURIComponent(appt.department)}` : ''}`;

                return (
                  <div key={appt.id} className="relative flex items-start gap-4 md:gap-5 z-10">
                    <div className={`flex items-center justify-center w-10 h-10 ${dotColor} rounded-[10px] shadow-sm shrink-0`}>
                      <Calendar className="w-[15px] h-[15px] text-white" />
                    </div>
                    <div className="flex-1 bg-[#EFF4FF] dark:bg-[#1E2D4A] border border-[#C2C7D1] dark:border-[#22354A] rounded-[10px] p-4 flex flex-col gap-2.5 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[16px] font-[700] text-[#00355F] dark:text-white transition-colors">{doctor}</span>
                            {appt.is_urgent && (
                              <span className="px-2 py-0.2 bg-[#FFDAD6] text-[#93000A] dark:bg-[#451B1B] dark:text-[#FF8989] rounded-[4px] text-[10px] font-[700] tracking-wide uppercase">
                                Urgent
                              </span>
                            )}
                          </div>
                          <span className="text-[13px] font-[600] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{dept}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2.5 py-0.5 ${st.bg} ${st.text} rounded-[4px] text-[10px] font-[700] tracking-[0.6px] uppercase transition-colors`}>
                            {st.label}
                          </span>
                          <span className="text-[12px] font-[600] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{fmtDate(dateStr)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-[12px] text-[#42474F] dark:text-[#A5AAB5] pt-1">
                        {time && (
                          <div className="flex items-center gap-1.5 transition-colors">
                            <Clock className="w-3.5 h-3.5 text-[#00355F] dark:text-[#5F9EA0]" />
                            <span>{time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 transition-colors">
                          {isTelehealth ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-[#00355F] dark:text-[#5F9EA0]" />
                              <span>Virtual Telehealth Room</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-[#00355F] dark:text-[#5F9EA0]" />
                              <span>{appt.location}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {appt.notes && (
                        <p className="text-[13px] text-[#42474F] dark:text-[#A5AAB5] leading-relaxed pt-2 border-t border-[#C2C7D1]/50 dark:border-[#22354A] transition-colors">
                          <span className="font-[600] text-[#0D1C2E] dark:text-white">Physician Notes: </span>
                          {appt.notes}
                        </p>
                      )}

                      {/* Action buttons (Reschedule if missed or past) */}
                      {past && st.label === "MISSED" && (
                        <div className="pt-2 flex items-center justify-end gap-3">
                          <Link
                            href={rescheduleUrl}
                            className="px-3.5 py-1.5 rounded-[8px] bg-[#00355F] dark:bg-[#1B6CA8] hover:bg-[#002645] dark:hover:bg-[#2582C7] text-white text-[12px] font-[700] transition-colors"
                          >
                            Reschedule Appointment
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Pagination Controls Bar ── */}
          {filtered.length > itemsPerPage && (
            <div className="pt-4 border-t border-[#C2C7D1]/50 dark:border-[#22354A] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[13px] text-[#42474F] dark:text-[#A5AAB5]">
                Showing <strong className="text-[#0D1C2E] dark:text-white">{startIndex + 1}</strong> to <strong className="text-[#0D1C2E] dark:text-white">{Math.min(startIndex + itemsPerPage, filtered.length)}</strong> of <strong className="text-[#0D1C2E] dark:text-white">{filtered.length}</strong> visits
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={validCurrentPage <= 1}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-[8px] border text-[13px] font-[700] transition-all cursor-pointer ${
                    validCurrentPage <= 1
                      ? "opacity-40 cursor-not-allowed border-[#C2C7D1] dark:border-[#22354A] text-[#727780] dark:text-[#A5AAB5]/60"
                      : "border-[#C2C7D1] dark:border-[#22354A] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]"
                  }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-[8px] text-[13px] font-[700] transition-all cursor-pointer ${
                        validCurrentPage === pageNum
                          ? "bg-[#00355F] dark:bg-[#1B6CA8] text-white"
                          : "text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={validCurrentPage >= totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-[8px] border text-[13px] font-[700] transition-all cursor-pointer ${
                    validCurrentPage >= totalPages
                      ? "opacity-40 cursor-not-allowed border-[#C2C7D1] dark:border-[#22354A] text-[#727780] dark:text-[#A5AAB5]/60"
                      : "border-[#C2C7D1] dark:border-[#22354A] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]"
                  }`}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Export Hub ── */}
      <div className="w-full bg-[#00355F] dark:bg-[#121E2C] border border-[#002645] dark:border-[#22354A] rounded-[16px] px-6 md:px-8 py-10 transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-[620px]">
            <h3 className="text-[22px] md:text-[24px] font-[700] leading-tight tracking-[-0.32px] text-white">
              Official Medical Summary Export
            </h3>
            <p className="text-[15px] md:text-[16px] font-[400] leading-relaxed text-white/80 dark:text-[#A5AAB5] transition-colors">
              Download your complete clinical record including allergies, immunizations, diagnostic activity, and full appointment histories formatted for specialist referrals or personal archive.
            </p>
          </div>
          <DownloadPDFButton
            filename="clinq-health-summary"
            label="Comprehensive PDF"
            buildDoc={buildHealthSummaryPDF}
            className="relative flex flex-col items-center justify-center gap-2.5 w-[200px] h-[110px] bg-white dark:bg-[#1B6CA8] text-[#00355F] dark:text-white rounded-[10px] shadow-lg hover:shadow-xl transition-all cursor-pointer border border-[#C2C7D1] dark:border-[#2582C7]/30 shrink-0"
          >
            <FileText className="w-5 h-5 text-[#00355F] dark:text-white" />
          </DownloadPDFButton>
        </div>
      </div>
    </div>
  );
}
