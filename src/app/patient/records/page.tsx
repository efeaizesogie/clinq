"use client";

import React, { useEffect, useState } from "react";
import {
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
  specialists?: { full_name: string };
}

function fmtDate(raw: string | undefined | null) {
  if (!raw) return "—";
  try {
    const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return raw; }
}

function fmtShortDate(raw: string | undefined | null) {
  if (!raw) return "—";
  try {
    const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
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

function getStatusStyle(status: string | undefined, isPast: boolean) {
  if (!isPast) {
    if (status === "Confirmed") return { label: "CONFIRMED", bg: "bg-[#D4E6E5] dark:bg-[#1E2E2D]", text: "text-[#576867] dark:text-[#A3B3B2]" };
    return { label: "PENDING", bg: "bg-[#E6EEFF] dark:bg-[#1B2F45]", text: "text-[#00355F] dark:text-[#8EBDF9]" };
  }
  switch (status) {
    case "Confirmed":
    case "Completed": return { label: "ATTENDED", bg: "bg-[#DCFCE7] dark:bg-[#183525]", text: "text-[#15803D] dark:text-[#4ADE80]" };
    case "Cancelled": return { label: "CANCELLED", bg: "bg-[#FFDAD6] dark:bg-[#451B1B]", text: "text-[#93000A] dark:text-[#FF8989]" };
    case "Pending":   return { label: "MISSED", bg: "bg-[#FEF3C7] dark:bg-[#3C2E1B]", text: "text-[#B45309] dark:text-[#FBBF24]" };
    default:          return { label: "EXPIRED", bg: "bg-[#E0E3E5] dark:bg-[#2A2B2D]", text: "text-[#42474F] dark:text-[#A5AAB5]" };
  }
}

export default function HealthRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeFilter, setActiveFilter] = useState<"All" | "Upcoming" | "Past">("All");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [allergyRes, immunRes, apptRes] = await Promise.all([
        supabase.from("patient_allergies").select("id, allergy_name, reaction, severity")
          .eq("patient_id", user.id).order("created_at", { ascending: true }),
        supabase.from("patient_immunizations").select("id, name, date_administered")
          .eq("patient_id", user.id).order("date_administered", { ascending: false }),
        supabase.from("appointments").select("*, specialists(full_name)")
          .eq("patient_id", user.id).order("scheduled_at", { ascending: false }),
      ]);

      if (allergyRes.data) setAllergies(allergyRes.data);
      if (immunRes.data) setImmunizations(immunRes.data);
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

  function buildHealthSummaryPDF(doc: jsPDF) {
    const W = 210;
    const margin = 18;
    const contentW = W - margin * 2;
    let y = drawPDFHeader(doc, "Clinq Medical — Patient Health Summary");

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

    section("Appointment History");
    if (appointments.length === 0) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.text);
      doc.text("No appointment history found.", margin + 4, y); y += 8;
    } else {
      appointments.forEach((appt, i) => {
        if (y > 255) { doc.addPage(); y = 20; }
        const past = isPast(appt);
        const st = getStatusStyle(appt.status, past);
        const doctor = appt.specialists?.full_name ?? appt.assigned_doctor ?? "—";
        const dateStr = fmtDate(getApptDateStr(appt));
        const time = getTimeDisplay(appt);
        const dept = appt.department ?? "Consultation";
        const loc = appt.location ?? "Virtual";

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
          <span className="text-sm font-[600] text-[#00355F] dark:text-[#5F9EA0]">Loading health records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-16 px-6 py-6 bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <h2 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-[#00355F] dark:text-[#5F9EA0]">
            My Health Records
          </h2>
          <p className="text-[16px] font-[400] leading-[24px] text-[#42474F] dark:text-[#A5AAB5]">
            A centralized view of your medical history, clinical documentation, and health summaries managed by Clinq Medical.
          </p>
        </div>
        <DownloadPDFButton
          filename="clinq-health-summary"
          label="Download Health Summary (PDF)"
          buildDoc={buildHealthSummaryPDF}
        />
      </div>

      {/* ── Bento Grid ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[304px_1fr] gap-6 items-start">
        {/* Left: Allergies + Immunizations */}
        <div className="flex flex-col gap-6">
          {/* Allergies */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-6 flex flex-col gap-6 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-[22px] h-[19px] text-[#BA1A1A] dark:text-[#FF8989] shrink-0" />
                <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E] dark:text-white transition-colors">Allergies</span>
              </div>
              <span className="px-3 py-1 bg-[#FFDAD6] dark:bg-[#451B1B] rounded-[12px] text-[12px] font-[600] leading-4 tracking-[0.6px] text-[#93000A] dark:text-[#FF8989] transition-colors">
                {allergies.length} Active
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {allergies.length === 0 ? (
                <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5]">No allergies on record.</p>
              ) : (
                allergies.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-1 pb-4 ${idx < allergies.length - 1 ? "border-b border-[#C2C7D1] dark:border-[#22354A]" : ""}`}
                  >
                    <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#00355F] dark:text-[#5F9EA0] transition-colors">{item.allergy_name}</span>
                    <span className="text-[14px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{item.reaction}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Immunizations */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-6 flex flex-col gap-4 transition-colors">
            <div className="flex items-center gap-2">
              <Syringe className="w-[19px] h-[20px] text-[#516161] dark:text-[#A5AAB5] shrink-0 transition-colors" />
              <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E] dark:text-white transition-colors">Immunizations</span>
            </div>
            <div className="flex flex-col gap-3">
              {immunizations.length === 0 ? (
                <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5]">No immunization records found.</p>
              ) : (
                immunizations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-3 bg-[#EFF4FF] dark:bg-[#1E2D4A] rounded-[4px] transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#0D1C2E] dark:text-white transition-colors">{item.name}</span>
                      <span className="text-[14px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{fmtShortDate(item.date_administered)}</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#00355F] dark:text-[#5F9EA0] shrink-0 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Clinical Timeline */}
        <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-6 flex flex-col gap-6 transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00355F] dark:text-[#5F9EA0]" />
              <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E] dark:text-white transition-colors">Clinical Timeline</span>
              <span className="px-2 py-0.5 bg-[#D2E4FF] dark:bg-[#1C2C3E] rounded-full text-[12px] font-[700] tracking-[0.6px] text-[#001C37] dark:text-[#8EBDF9] transition-colors">
                {appointments.length}
              </span>
            </div>
            <div className="flex gap-2">
              {(["All", "Upcoming", "Past"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] transition-colors cursor-pointer ${
                    activeFilter === f ? "bg-[#00355F] dark:bg-[#1B6CA8] text-white border-[#00355F] dark:border-[#1B6CA8]" : "text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-6">
            <div
              className="absolute left-[19px] top-0 bottom-0 w-[2px] pointer-events-none bg-gradient-to-b from-[#00355F] via-[#C2C7D1] dark:via-[#22354A] to-transparent"
            />
            {filtered.length === 0 ? (
              <p className="pl-14 text-[14px] text-[#42474F] dark:text-[#A5AAB5]">No appointments found.</p>
            ) : (
              filtered.map((appt) => {
                const past = isPast(appt);
                const st = getStatusStyle(appt.status, past);
                const doctor = appt.specialists?.full_name ?? appt.assigned_doctor ?? "Unknown Provider";
                const dateStr = getApptDateStr(appt);
                const time = getTimeDisplay(appt);
                const dept = appt.department ?? "Consultation";
                const isTelehealth = !appt.location || appt.location.toLowerCase().includes("telehealth") || appt.location.toLowerCase().includes("virtual");
                const dotColor =
                  st.label === "ATTENDED" ? "bg-[#15803D]"
                  : st.label === "CANCELLED" ? "bg-[#BA1A1A]"
                  : st.label === "MISSED" ? "bg-[#B45309]"
                  : st.label === "CONFIRMED" ? "bg-[#00355F]"
                  : "bg-[#8EBDF9]";

                return (
                  <div key={appt.id} className="relative flex items-start gap-5 z-10">
                    <div className={`flex items-center justify-center w-10 h-10 ${dotColor} rounded-[10px] shadow-sm shrink-0`}>
                      <Calendar className="w-[15px] h-[15px] text-white" />
                    </div>
                    <div className="flex-1 bg-[#EFF4FF] dark:bg-[#1E2D4A] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-4 flex flex-col gap-2 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-[16px] font-[700] leading-6 text-[#00355F] dark:text-white transition-colors">{doctor}</span>
                          <span className="text-[13px] font-[500] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{dept}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 ${st.bg} ${st.text} rounded-[2px] text-[10px] font-[700] tracking-[0.6px] uppercase transition-colors`}>
                            {st.label}
                          </span>
                          <span className="text-[11px] font-[600] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{fmtDate(dateStr)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        {time && (
                          <div className="flex items-center gap-1 text-[12px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                            <Clock className="w-3 h-3" /><span>{time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[12px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                          {isTelehealth ? (
                            <><Video className="w-3 h-3" /><span>Virtual Consultation</span></>
                          ) : (
                            <><MapPin className="w-3 h-3" /><span>{appt.location}</span></>
                          )}
                        </div>
                        {appt.is_urgent && (
                          <span className="px-2 py-0.5 bg-[#FFDAD6] text-[#93000A] rounded-[2px] text-[10px] font-[700] tracking-[0.6px] uppercase">
                            Urgent
                          </span>
                        )}
                      </div>
                      {appt.notes && (
                        <p className="text-[13px] text-[#42474F] dark:text-[#A5AAB5] leading-5 pt-1 border-t border-[#C2C7D1] dark:border-[#22354A] transition-colors">{appt.notes}</p>
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
      <div className="w-full bg-[#00355F] dark:bg-[#121E2C] border dark:border-[#22354A] rounded-[16px] px-8 py-12 transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col gap-2 max-w-[576px]">
            <h3 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-white">Secure Export Hub</h3>
            <p className="text-[18px] font-[400] leading-7 text-white/80 dark:text-[#A5AAB5] transition-colors">
              Generate a secure export of your Clinq Health Records for specialists or personal backup.
            </p>
          </div>
          <DownloadPDFButton
            filename="clinq-health-summary"
            label="Comprehensive PDF"
            buildDoc={buildHealthSummaryPDF}
            className="relative flex flex-col items-center justify-center gap-3 w-[215px] h-[130px] bg-white dark:bg-[#1B6CA8] text-[#00355F] dark:text-white rounded-[8px] shadow-lg hover:shadow-xl transition-all cursor-pointer border dark:border-[#2582C7]/30"
          >
            <FileText className="w-4 h-5 text-[#00355F] dark:text-white" />
          </DownloadPDFButton>
        </div>
      </div>
    </div>
  );
}
