"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pill, Moon, Sun, ChevronRight, SlidersHorizontal, X, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { jsPDF } from "jspdf";
import DownloadPDFButton, { drawPDFHeader, PDF_COLORS } from "@/components/DownloadPDFButton";

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  expires: string;
  refills_remaining: string;
  action_label: string;
  status: string;
  prescriber: string;
  prescribed_date: string;
  form: string | null;
}

type FilterStatus = "All" | "Active" | "Completed" | "Expired";

function buildRxPDF(rx: Prescription) {
  return (doc: jsPDF) => {
    const margin = 18;
    const W = 210;
    const contentW = W - margin * 2;
    let y = drawPDFHeader(doc, "Clinq Medical — Prescription Record");

    // Section header
    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text("Prescription Details", margin + 8, y + 7);
    y += 18;

    const row = (label: string, value: string) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.dark);
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...PDF_COLORS.text);
      const lines = doc.splitTextToSize(value, contentW - 52);
      doc.text(lines, margin + 52, y);
      y += lines.length * 5 + 3;
    };

    row("Medication:", rx.medication_name);
    row("Form:", rx.form ?? "—");
    row("Dosage:", rx.dosage);
    row("Frequency:", rx.frequency);
    row("Prescriber:", rx.prescriber);
    row("Prescribed:", rx.prescribed_date);
    row("Expires:", rx.expires);
    row("Refills:", rx.refills_remaining);
    row("Status:", rx.status);
  };
}

export default function PrescriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [refillTarget, setRefillTarget] = useState<Prescription | null>(null);
  const [refillNote, setRefillNote] = useState("");
  const [refillSubmitting, setRefillSubmitting] = useState(false);
  const [refillSuccess, setRefillSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("patient_prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("prescribed_date", { ascending: false });
      if (data) setPrescriptions(data as Prescription[]);
      setLoading(false);
    }
    load();
  }, []);

  const active = prescriptions.filter((p) => p.status === "Active");
  const history = prescriptions.filter((p) => p.status !== "Active");

  const filteredHistory = history.filter((p) => {
    if (filterStatus === "All") return true;
    return p.status === filterStatus;
  });

  // Priority card = first active prescription
  const priority = active[0] ?? null;
  const secondaryActive = active.slice(1);

  // Today's schedule: morning = first active, evening = second active
  const morningMed = active[0];
  const eveningMed = active[1];

  async function handleRefillSubmit() {
    if (!refillTarget) return;
    setRefillSubmitting(true);
    // Simulate a short async operation (replace with real API call if needed)
    await new Promise((r) => setTimeout(r, 800));
    setRefillSubmitting(false);
    setRefillSuccess(true);
  }

  function closeRefillModal() {
    setRefillTarget(null);
    setRefillNote("");
    setRefillSuccess(false);
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F8F9FF] dark:bg-[#080F18] transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00355F] dark:border-[#1B6CA8] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-[600] text-[#00355F] dark:text-[#5F9EA0]">Loading prescriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 px-6 py-6 bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <h2 className="text-[24px] font-[600] leading-[40px] tracking-[-0.8px] text-[#00355F] dark:text-white transition-colors">
            Active Medications
          </h2>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] transition-colors">
            Manage your ongoing treatments, view dosage instructions, and request refills from your primary care physician.
          </p>
        </div>
        <button
          onClick={() => {
            if (active.length > 0) { setRefillTarget(active[0]); setRefillSuccess(false); }
          }}
          className="flex items-center gap-4 px-8 py-3 bg-[#00355F] dark:bg-[#1B6CA8] hover:bg-[#002645] dark:hover:bg-[#2582C7] rounded-[12px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none text-white shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-[14px] h-[14px] shrink-0" />
          <span className="text-[16px] font-[700] leading-6 whitespace-nowrap">New Refill Request</span>
        </button>
      </div>

      {/* ── Active Prescriptions Bento Grid ── */}
      {active.length === 0 ? (
        <div className="w-full bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-10 text-center text-[#42474F] dark:text-[#A5AAB5] transition-colors">
          No active prescriptions on record.
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Priority Card */}
          {priority && (
            <div className="lg:col-span-2 relative bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-8 flex flex-col gap-6 overflow-hidden transition-colors">
              <div className="absolute w-32 h-32 -right-8 -top-8 bg-[rgba(0,53,95,0.05)] dark:bg-[rgba(27,108,168,0.05)] rounded-bl-[12px] pointer-events-none" />
              <div className="flex items-start justify-between gap-4 z-10">
                <div className="flex flex-col gap-1">
                  <div className="mb-2">
                    <span className="px-3 py-1 bg-[#D4E6E5] dark:bg-[#1E2E2D] rounded-[12px] text-[12px] font-[700] tracking-[0.6px] text-[#576867] dark:text-[#5F9EA0] transition-colors">
                      REFILL READY
                    </span>
                  </div>
                  <h3 className="text-[18px] font-[600] leading-8 text-[#00355F] dark:text-white transition-colors">{priority.medication_name}</h3>
                  <p className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{priority.form ?? priority.dosage}</p>
                </div>
                <Pill className="w-[27px] h-[27px] text-[#0F4C81] dark:text-[#5F9EA0] shrink-0 mt-1 transition-colors" />
              </div>

              <div className="border-t border-[#C2C7D1] dark:border-[#22354A] pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 z-10 transition-colors">
                {[
                  { label: "DOSAGE", value: priority.dosage },
                  { label: "FREQUENCY", value: priority.frequency },
                  { label: "DOCTOR", value: priority.prescriber },
                  { label: "REFILLS", value: priority.refills_remaining, color: "text-[#00355F] dark:text-[#5F9EA0]" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors">{item.label}</span>
                    <span className={`text-[16px] font-[700] leading-6 ${item.color ?? "text-[#0D1C2E] dark:text-white"} transition-colors`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 z-10">
                <button
                  onClick={() => { setRefillTarget(priority); setRefillSuccess(false); }}
                  className="px-6 py-2 bg-[#00355F] dark:bg-[#1B6CA8] hover:bg-[#002645] dark:hover:bg-[#2582C7] rounded-[4px] text-[14px] font-[700] text-white transition-colors cursor-pointer"
                >
                  Request Refill
                </button>
                <button className="px-6 py-2 border border-[#727780] dark:border-[#22354A] rounded-[4px] text-[14px] font-[700] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer">
                  View History
                </button>
              </div>
            </div>
          )}

          {/* Today's Schedule Sidebar */}
          <div className="bg-[#CCDBF3] dark:bg-[#1C2C3E] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-8 flex flex-col gap-6 transition-colors">
            <h4 className="text-[18px] font-[700] leading-7 text-[#00355F] dark:text-white transition-colors">Today&apos;s Schedule</h4>
            <div className="flex flex-col gap-4">
              {morningMed && (
                <div className="flex items-center gap-4 bg-white dark:bg-[#121E2C] border border-[rgba(194,199,209,0.3)] dark:border-[#22354A] rounded-[4px] p-4 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 bg-[rgba(0,53,95,0.1)] dark:bg-[#1E2D4A] rounded-[12px] shrink-0 transition-colors">
                    <Sun className="w-[22px] h-[22px] text-[#00355F] dark:text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-[700] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">MORNING</span>
                    <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E] dark:text-white transition-colors">{morningMed.medication_name} {morningMed.dosage}</span>
                  </div>
                </div>
              )}
              {eveningMed && (
                <div className="flex items-center gap-4 bg-white dark:bg-[#121E2C] border border-[rgba(194,199,209,0.3)] dark:border-[#22354A] rounded-[4px] p-4 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 bg-[rgba(81,97,97,0.1)] dark:bg-gray-700 rounded-[12px] shrink-0 transition-colors">
                    <Moon className="w-[18px] h-[18px] text-[#516161] dark:text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-[700] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">EVENING</span>
                    <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E] dark:text-white transition-colors">{eveningMed.medication_name} {eveningMed.dosage}</span>
                  </div>
                </div>
              )}
              {!morningMed && !eveningMed && (
                <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5]">No medications scheduled today.</p>
              )}
            </div>

            <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[#121E2C]/50 border border-[rgba(194,199,209,0.2)] dark:border-[#22354A] rounded-[8px] p-4 flex flex-col gap-2 transition-colors">
              <span className="text-[12px] font-[700] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors">PHARMACY ON FILE</span>
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-[16px] font-[700] leading-6 text-[#00355F] dark:text-white transition-colors">Walgreens #1204</span>
                <span className="text-[14px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] transition-colors">4522 Medical Center Blvd</span>
              </div>
              <button className="flex items-center gap-1 pt-1 text-[14px] font-[700] text-[#00355F] dark:text-[#1B6CA8] hover:underline cursor-pointer">
                Change Pharmacy <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Secondary Active Medications ── */}
      {secondaryActive.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {secondaryActive.map((med) => (
            <div key={med.id} className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-6 flex flex-col gap-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E] dark:text-white transition-colors">{med.medication_name}</span>
                <span className="px-2 py-0.5 bg-[#D5E3FC] dark:bg-[#1C2C3E] rounded-[2px] text-[10px] font-[700] text-[#42474F] dark:text-[#A5AAB5] transition-colors">ACTIVE</span>
              </div>
              <p className="text-[14px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{med.dosage} • {med.frequency}</p>
              <div className="h-px bg-[rgba(194,199,209,0.3)] dark:bg-[#22354A] transition-colors" />
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{med.expires}</span>
                <span className="text-[14px] font-[700] leading-5 text-[#0D1C2E] dark:text-white transition-colors">{med.refills_remaining}</span>
              </div>
              <button
                onClick={() => {
                  if (med.action_label === "Request Refill") { setRefillTarget(med); setRefillSuccess(false); }
                }}
                className="w-full py-2 border border-[rgba(0,53,95,0.2)] dark:border-[#22354A] rounded-[4px] text-[14px] font-[700] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer"
              >
                {med.action_label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Prescription History ── */}
      <div className="flex flex-col gap-6 w-full pt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-[600] leading-8 text-[#00355F] dark:text-white transition-colors">Prescription History</h3>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 text-[16px] font-[700] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] rounded-[4px] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-[18px] h-3 shrink-0" />
              Filter Records
              {filterStatus !== "All" && (
                <span className="ml-1 px-2 py-0.5 bg-[#00355F] dark:bg-[#1B6CA8] text-white rounded-full text-[10px] font-[700]">
                  {filterStatus}
                </span>
              )}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] shadow-lg z-20 min-w-[160px] overflow-hidden transition-colors">
                {(["All", "Active", "Completed", "Expired"] as FilterStatus[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilterStatus(f); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[14px] font-[600] transition-colors cursor-pointer ${
                      filterStatus === f ? "bg-[#EFF4FF] dark:bg-[#1E2D4A] text-[#00355F] dark:text-white" : "text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A]/50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none overflow-x-auto transition-colors">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-[#DCE9FF] dark:bg-[#1E2D4A]/50 transition-colors">
                {["Medication", "Prescribed By", "Date", "Status", "Action"].map((label, i) => (
                  <th
                    key={label}
                    className={`px-6 py-4 text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors ${i === 4 ? "text-right" : "text-left"}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[14px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                    No prescription history found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((row, idx) => (
                  <tr key={row.id} className={idx > 0 ? "border-t border-[#C2C7D1] dark:border-[#22354A] transition-colors" : ""}>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E] dark:text-white transition-colors">{row.medication_name}</span>
                        <span className="text-[14px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{row.form ?? row.dosage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 pl-12 text-[14px] font-[400] text-[#0D1C2E] dark:text-white transition-colors">{row.prescriber}</td>
                    <td className="px-6 py-5 text-[14px] font-[400] text-[#0D1C2E] dark:text-white transition-colors">{row.prescribed_date}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-[12px] text-[12px] font-[600] tracking-[0.6px] transition-colors ${
                        row.status === "Completed" ? "bg-[#DCFCE7] dark:bg-[#133020] text-[#15803D] dark:text-[#4ADE80]"
                        : row.status === "Expired" ? "bg-[#FFDAD6] dark:bg-[#451B1B] text-[#93000A] dark:text-[#FF8989]"
                        : "bg-[#D5E3FC] dark:bg-[#1C2C3E] text-[#42474F] dark:text-[#A5AAB5]"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <DownloadPDFButton
                        filename={`clinq-rx-${row.medication_name.toLowerCase().replace(/\s+/g, "-")}`}
                        label={`Download ${row.medication_name} prescription`}
                        buildDoc={buildRxPDF(row)}
                        iconOnly
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Refill Request Modal ── */}
      {refillTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white dark:bg-[#121E2C] border dark:border-[#22354A] rounded-[12px] shadow-2xl w-full max-w-[480px] flex flex-col gap-6 p-8 transition-colors">
            {refillSuccess ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle2 className="w-14 h-14 text-[#15803D]" />
                <h3 className="text-[20px] font-[700] text-[#0D1C2E] dark:text-white text-center transition-colors">Refill Request Sent</h3>
                <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] text-center transition-colors">
                  Your refill request for <strong>{refillTarget.medication_name}</strong> has been submitted. Your doctor will review it shortly.
                </p>
                <button
                  onClick={closeRefillModal}
                  className="mt-2 px-8 py-2.5 bg-[#00355F] dark:bg-[#1B6CA8] rounded-[8px] text-white text-[14px] font-[700] hover:bg-[#002645] dark:hover:bg-[#2582C7] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[20px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">Request Refill</h3>
                    <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{refillTarget.medication_name} — {refillTarget.dosage}</p>
                  </div>
                  <button onClick={closeRefillModal} className="p-1 rounded hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-[#42474F] dark:text-[#A5AAB5]" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 bg-[#F8F9FF] dark:bg-[#1E2D4A] rounded-[8px] p-4 transition-colors">
                  {[
                    { label: "Prescriber", value: refillTarget.prescriber },
                    { label: "Frequency", value: refillTarget.frequency },
                    { label: "Refills Remaining", value: refillTarget.refills_remaining },
                    { label: "Expires", value: refillTarget.expires },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-[14px]">
                      <span className="font-[600] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{label}</span>
                      <span className="text-[#0D1C2E] dark:text-white transition-colors">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    value={refillNote}
                    onChange={(e) => setRefillNote(e.target.value)}
                    rows={3}
                    placeholder="Any notes for your doctor..."
                    className="w-full border border-[#C2C7D1] dark:border-[#22354A] bg-white dark:bg-[#121E2C] rounded-[8px] px-4 py-3 text-[14px] text-[#0D1C2E] dark:text-white resize-none focus:outline-none focus:border-[#00355F] dark:focus:border-[#1B6CA8] transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeRefillModal}
                    className="flex-1 py-2.5 border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] text-[14px] font-[700] text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRefillSubmit}
                    disabled={refillSubmitting}
                    className="flex-1 py-2.5 bg-[#00355F] dark:bg-[#1B6CA8] rounded-[8px] text-[14px] font-[700] text-white hover:bg-[#002645] dark:hover:bg-[#2582C7] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {refillSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
