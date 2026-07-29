"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  AlertTriangle,
  Syringe,
  CheckCircle2,
  Calendar,
  MapPin,
  Video,
  FileText,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { jsPDF } from "jspdf";

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
  specialists?: { full_name: string };
}

function fmtDate(raw: string | undefined | null) {
  if (!raw) return "—";
  try {
    const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

function fmtShortDate(raw: string | undefined | null) {
  if (!raw) return "—";
  try {
    const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return raw ?? "—";
  }
}

function getApptDateStr(appt: Appointment) {
  return appt.date ?? appt.scheduled_at?.split("T")[0] ?? null;
}

function getTimeDisplay(appt: Appointment) {
  if (appt.time_start) return appt.time_start;
  if (appt.scheduled_at) {
    return new Date(appt.scheduled_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  return "";
}

function getStatusStyle(status: string | undefined, isPast: boolean) {
  if (!isPast) {
    if (status === "Confirmed")
      return { label: "CONFIRMED", bg: "bg-[#D4E6E5]", text: "text-[#576867]" };
    return { label: "PENDING", bg: "bg-[#E6EEFF]", text: "text-[#00355F]" };
  }
  switch (status) {
    case "Confirmed":
    case "Completed":
      return { label: "ATTENDED", bg: "bg-[#DCFCE7]", text: "text-[#15803D]" };
    case "Cancelled":
      return { label: "CANCELLED", bg: "bg-[#FFDAD6]", text: "text-[#93000A]" };
    case "Pending":
      return { label: "MISSED", bg: "bg-[#FEF3C7]", text: "text-[#B45309]" };
    default:
      return { label: "EXPIRED", bg: "bg-[#E0E3E5]", text: "text-[#42474F]" };
  }
}

export default function HealthRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeFilter, setActiveFilter] = useState<"All" | "Upcoming" | "Past">(
    "All"
  );

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [allergyRes, immunRes, apptRes] = await Promise.all([
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
          .order("scheduled_at", { ascending: false }),
      ]);

      if (allergyRes.data) setAllergies(allergyRes.data);
      if (immunRes.data) setImmunizations(immunRes.data);
      // Log for debugging
      console.log("appointments query:", apptRes.data, apptRes.error);
      if (apptRes.data) setAppointments(apptRes.data as Appointment[]);
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = (appt: Appointment) => {
    const ds = getApptDateStr(appt);
    if (!ds) return false;
    return new Date(ds + "T00:00:00") < today;
  };

  const filtered = appointments.filter((a) => {
    if (activeFilter === "Upcoming") return !isPast(a);
    if (activeFilter === "Past") return isPast(a);
    return true;
  });

  // ── PDF Generation ──────────────────────────────────────────────
  function handleDownloadPDF() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const margin = 18;
    const contentW = W - margin * 2;
    let y = 0;

    const colors = {
      navy: [0, 53, 95] as [number, number, number],
      blue: [15, 76, 129] as [number, number, number],
      light: [239, 244, 255] as [number, number, number],
      border: [194, 199, 209] as [number, number, number],
      text: [66, 71, 79] as [number, number, number],
      dark: [13, 28, 46] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
      green: [21, 128, 61] as [number, number, number],
      red: [186, 26, 26] as [number, number, number],
      amber: [180, 83, 9] as [number, number, number],
    };

    // ── Header Banner ──
    doc.setFillColor(...colors.navy);
    doc.rect(0, 0, W, 42, "F");

    // Logo wordmark
    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("Clinq", margin, 20);

    // Tagline
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(217, 230, 248);
    doc.text("Clinq Medical — Patient Health Summary", margin, 28);

    // Generated date (right-aligned)
    const genDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    doc.setFontSize(8);
    doc.text(`Generated: ${genDate}`, W - margin, 28, { align: "right" });

    // Accent bar
    doc.setFillColor(...colors.blue);
    doc.rect(0, 42, W, 3, "F");

    y = 56;

    // ── Section helper ──
    const section = (title: string, iconChar: string) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(...colors.light);
      doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
      doc.setFillColor(...colors.navy);
      doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colors.navy);
      doc.text(`${iconChar}  ${title}`, margin + 8, y + 7);
      y += 16;
    };

    const row = (label: string, value: string, indent = 0) => {
      if (y > 272) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.dark);
      doc.text(label, margin + indent, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.text);
      const lines = doc.splitTextToSize(value, contentW - 52 - indent);
      doc.text(lines, margin + 52 + indent, y);
      y += lines.length * 5 + 2;
    };

    const divider = () => {
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.3);
      doc.line(margin, y, W - margin, y);
      y += 4;
    };

    // ── Allergies ──
    section("Allergies", ""); // Removed the icon character or symbol
    if (allergies.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.text);
      doc.text("No allergies on record.", margin + 4, y);
      y += 8;
    } else {
      allergies.forEach((a, i) => {
        row("Allergen:", a.allergy_name);
        row("Reaction:", a.reaction);
        row("Severity:", a.severity);
        if (i < allergies.length - 1) divider();
      });
    }
    y += 6;

    // ── Immunizations ──
    section("Immunizations", "");
    if (immunizations.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.text);
      doc.text("No immunization records found.", margin + 4, y);
      y += 8;
    } else {
      immunizations.forEach((im, i) => {
        row("Vaccine:", im.name);
        row("Date:", fmtShortDate(im.date_administered));
        if (i < immunizations.length - 1) divider();
      });
    }
    y += 6;

    // ── Appointment History ──
    section("Appointment History", "");
    if (appointments.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.text);
      doc.text("No appointment history found.", margin + 4, y);
      y += 8;
    } else {
      appointments.forEach((appt, i) => {
        if (y > 255) {
          doc.addPage();
          y = 20;
        }

        const past = isPast(appt);
        const st = getStatusStyle(appt.status, past);
        const doctor =
          appt.specialists?.full_name ?? appt.assigned_doctor ?? "—";
        const dateStr = fmtDate(getApptDateStr(appt));
        const time = getTimeDisplay(appt);
        const dept = appt.department ?? "Consultation";
        const loc = appt.location ?? "Virtual";

        // Card background
        doc.setFillColor(248, 249, 255);
        doc.roundedRect(margin, y, contentW, 32, 2, 2, "F");
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, 32, 2, 2, "S");

        // Left accent stripe by status
        const stripeColor: [number, number, number] =
          st.label === "ATTENDED"
            ? colors.green
            : st.label === "CANCELLED"
            ? colors.red
            : st.label === "MISSED"
            ? colors.amber
            : colors.navy;
        doc.setFillColor(...stripeColor);
        doc.roundedRect(margin, y, 3, 32, 1, 1, "F");

        // Date + time
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...colors.navy);
        doc.text(dateStr, margin + 7, y + 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...colors.text);
        doc.text(time, margin + 7, y + 14);

        // Doctor
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colors.dark);
        doc.text(doctor, margin + 7, y + 22);

        // Dept + location
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...colors.text);
        doc.text(`${dept}  •  ${loc}`, margin + 7, y + 28);

        // Status badge (right side)
        const badgeX = W - margin - 28;
        const badgeColors: Record<string, [number, number, number]> = {
          ATTENDED: [212, 230, 229],
          CANCELLED: [255, 218, 214],
          MISSED: [254, 243, 199],
          CONFIRMED: [212, 230, 229],
          PENDING: [220, 233, 255],
          EXPIRED: [224, 227, 229],
        };
        const badgeTextColors: Record<string, [number, number, number]> = {
          ATTENDED: [87, 104, 103],
          CANCELLED: [147, 0, 10],
          MISSED: [180, 83, 9],
          CONFIRMED: [87, 104, 103],
          PENDING: [0, 53, 95],
          EXPIRED: [66, 71, 79],
        };
        doc.setFillColor(...(badgeColors[st.label] ?? colors.light));
        doc.roundedRect(badgeX, y + 10, 24, 8, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...(badgeTextColors[st.label] ?? colors.text));
        doc.text(st.label, badgeX + 12, y + 15.5, { align: "center" });

        y += 36;
        if (i < appointments.length - 1 && y < 255) y += 2;
      });
    }
    y += 6;

    // ── Footer on every page ──
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(...colors.navy);
      doc.rect(0, 287, W, 10, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...colors.white);
      doc.text("Clinq Medical — Confidential Patient Record", margin, 293);
      doc.text(`Page ${p} of ${pageCount}`, W - margin, 293, {
        align: "right",
      });
    }

    doc.save("clinq-health-summary.pdf");
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F8F9FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00355F] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-[600] text-[#00355F]">
            Loading health records...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-16 px-6 py-6 bg-[#F8F9FF] font-[Manrope,sans-serif] text-[#42474F]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <h2 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-[#00355F]">
            My Health Records
          </h2>
          <p className="text-[16px] font-[400] leading-[24px] text-[#42474F]">
            A centralized view of your medical history, clinical documentation,
            and health summaries managed by Clinq Medical.
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-3 px-6 py-3 bg-[#00355F] rounded-[8px] text-white shrink-0 hover:bg-[#002645] transition-colors"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="text-[12px] font-[600] leading-4 tracking-[0.6px] uppercase whitespace-nowrap">
            Download Health Summary (PDF)
          </span>
        </button>
      </div>

      {/* ── Bento Grid ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[304px_1fr] gap-6 items-start">
        {/* Left: Allergies + Immunizations */}
        <div className="flex flex-col gap-6">
          {/* Allergies */}
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-[22px] h-[19px] text-[#BA1A1A] shrink-0" />
                <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E]">
                  Allergies
                </span>
              </div>
              <span className="px-3 py-1 bg-[#FFDAD6] rounded-[12px] text-[12px] font-[600] leading-4 tracking-[0.6px] text-[#93000A]">
                {allergies.length} Active
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {allergies.length === 0 ? (
                <p className="text-[14px] text-[#42474F]">
                  No allergies on record.
                </p>
              ) : (
                allergies.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-1 pb-4 ${
                      idx < allergies.length - 1
                        ? "border-b border-[#C2C7D1]"
                        : ""
                    }`}
                  >
                    <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#00355F]">
                      {item.allergy_name}
                    </span>
                    <span className="text-[14px] font-[400] leading-5 text-[#42474F]">
                      {item.reaction}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Immunizations */}
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Syringe className="w-[19px] h-[20px] text-[#516161] shrink-0" />
              <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E]">
                Immunizations
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {immunizations.length === 0 ? (
                <p className="text-[14px] text-[#42474F]">
                  No immunization records found.
                </p>
              ) : (
                immunizations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-3 bg-[#EFF4FF] rounded-[4px]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#0D1C2E]">
                        {item.name}
                      </span>
                      <span className="text-[14px] font-[400] leading-5 text-[#42474F]">
                        {fmtShortDate(item.date_administered)}
                      </span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#00355F] shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Clinical Timeline from Appointments */}
        <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00355F]" />
              <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E]">
                Clinical Timeline
              </span>
              <span className="px-2 py-0.5 bg-[#D2E4FF] rounded-full text-[12px] font-[700] tracking-[0.6px] text-[#001C37]">
                {appointments.length}
              </span>
            </div>
            <div className="flex gap-2">
              {(["All", "Upcoming", "Past"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 border border-[#C2C7D1] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] transition-colors ${
                    activeFilter === f
                      ? "bg-[#00355F] text-white border-[#00355F]"
                      : "text-[#42474F] hover:bg-[#EFF4FF]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline list */}
          <div className="relative flex flex-col gap-6">
            {/* Vertical line */}
            <div
              className="absolute left-[19px] top-0 bottom-0 w-[2px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, #00355F 0%, #C2C7D1 60%, rgba(194,199,209,0) 100%)",
              }}
            />

            {filtered.length === 0 ? (
              <p className="pl-14 text-[14px] text-[#42474F]">
                No appointments found.
              </p>
            ) : (
              filtered.map((appt) => {
                const past = isPast(appt);
                const st = getStatusStyle(appt.status, past);
                const doctor =
                  appt.specialists?.full_name ??
                  appt.assigned_doctor ??
                  "Unknown Provider";
                const dateStr = getApptDateStr(appt);
                const time = getTimeDisplay(appt);
                const dept = appt.department ?? "Consultation";
                const isTelehealth =
                  !appt.location ||
                  appt.location.toLowerCase().includes("telehealth") ||
                  appt.location.toLowerCase().includes("virtual");

                const dotColor =
                  st.label === "ATTENDED"
                    ? "bg-[#15803D]"
                    : st.label === "CANCELLED"
                    ? "bg-[#BA1A1A]"
                    : st.label === "MISSED"
                    ? "bg-[#B45309]"
                    : st.label === "CONFIRMED"
                    ? "bg-[#00355F]"
                    : "bg-[#8EBDF9]";

                return (
                  <div
                    key={appt.id}
                    className="relative flex items-start gap-5 z-10"
                  >
                    {/* Dot */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 ${dotColor} rounded-[10px] shadow-sm shrink-0`}
                    >
                      <Calendar className="w-[15px] h-[15px] text-white" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[8px] p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-[16px] font-[700] leading-6 text-[#00355F]">
                            {doctor}
                          </span>
                          <span className="text-[13px] font-[500] text-[#42474F]">
                            {dept}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`px-2 py-0.5 ${st.bg} ${st.text} rounded-[2px] text-[10px] font-[700] tracking-[0.6px] uppercase`}
                          >
                            {st.label}
                          </span>
                          <span className="text-[11px] font-[600] text-[#42474F]">
                            {fmtDate(dateStr)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        {time && (
                          <div className="flex items-center gap-1 text-[12px] text-[#42474F]">
                            <Clock className="w-3 h-3" />
                            <span>{time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[12px] text-[#42474F]">
                          {isTelehealth ? (
                            <>
                              <Video className="w-3 h-3" />
                              <span>Virtual Consultation</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>{appt.location}</span>
                            </>
                          )}
                        </div>
                        {appt.is_urgent && (
                          <span className="px-2 py-0.5 bg-[#FFDAD6] text-[#93000A] rounded-[2px] text-[10px] font-[700] tracking-[0.6px] uppercase">
                            Urgent
                          </span>
                        )}
                      </div>

                      {appt.notes && (
                        <p className="text-[13px] text-[#42474F] leading-5 pt-1 border-t border-[#C2C7D1]">
                          {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Export Hub ── */}
      <div className="w-full bg-[#00355F] rounded-[16px] px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col gap-2 max-w-[576px]">
            <h3 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-white">
              Secure Export Hub
            </h3>
            <p className="text-[18px] font-[400] leading-7 text-white/80">
              Generate a secure export of your Clinq Health Records for
              specialists or personal backup.
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="relative flex flex-col items-center justify-center gap-3 w-[215px] h-[130px] bg-white rounded-[8px] shadow-lg hover:shadow-xl transition-shadow"
          >
            <FileText className="w-4 h-5 text-[#00355F]" />
            <span className="text-[16px] font-[700] leading-6 text-[#00355F] text-center">
              Comprehensive PDF
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
