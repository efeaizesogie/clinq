"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown,
  ChevronUp, FlaskConical, Activity, FileText, HelpCircle, ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { jsPDF } from "jspdf";
import DownloadPDFButton, { drawPDFHeader, drawPDFFooter, PDF_COLORS } from "@/components/DownloadPDFButton";
import Link from "next/link";

interface LabResult {
  id: string;
  name: string;
  date: string;
  provider: string;
  status: string;
  file_url: string | null;
}

const PAGE_SIZE = 6;

function resultIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("x-ray") || n.includes("mri") || n.includes("ct") || n.includes("imaging")) {
    return <FileText className="w-[18px] h-5 text-[#00355F] dark:text-white opacity-40 dark:opacity-80 transition-colors" />;
  }
  if (n.includes("urin") || n.includes("ecg") || n.includes("ekg")) {
    return <Activity className="w-[22px] h-4 text-[#00355F] dark:text-white opacity-40 dark:opacity-80 transition-colors" />;
  }
  return <FlaskConical className="w-[18px] h-[18px] text-[#00355F] dark:text-white opacity-40 dark:opacity-80 transition-colors" />;
}

function buildLabPDF(result: LabResult) {
  return (doc: jsPDF) => {
    const margin = 18;
    const W = 210;
    const contentW = W - margin * 2;
    let y = drawPDFHeader(doc, "Clinq Medical — Laboratory Result");

    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text("Lab Result Details", margin + 8, y + 7);
    y += 18;

    const row = (label: string, value: string) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.dark);
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...PDF_COLORS.text);
      const lines = doc.splitTextToSize(value, contentW - 52);
      doc.text(lines, margin + 52, y);
      y += lines.length * 5 + 3;
    };

    row("Test Name:", result.name);
    row("Date:", result.date);
    row("Provider:", result.provider);
    row("Status:", result.status);

    y += 6;
    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text("Clinical Notes", margin + 8, y + 7);
    y += 18;

    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.text);
    const note = result.status === "Pending"
      ? "This result is currently being processed by the laboratory. Please check back within 24–48 hours or contact your care team for updates."
      : "This result has been reviewed by your care team. If you have questions about your results, please schedule a consultation with your physician.";
    const noteLines = doc.splitTextToSize(note, contentW);
    doc.text(noteLines, margin, y);
  };
}

function buildExportAllPDF(results: LabResult[]) {
  return (doc: jsPDF) => {
    const margin = 18;
    const W = 210;
    const contentW = W - margin * 2;
    let y = drawPDFHeader(doc, "Clinq Medical — All Laboratory Results");

    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text(`Complete Lab Results — ${results.length} record${results.length !== 1 ? "s" : ""}`, margin + 8, y + 7);
    y += 18;

    // Table header
    const cols = [margin, margin + 70, margin + 110, margin + 150];
    const headers = ["Test Name", "Date", "Provider", "Status"];
    doc.setFillColor(...PDF_COLORS.navy);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...PDF_COLORS.white);
    headers.forEach((h, i) => doc.text(h, cols[i], y + 5.5));
    y += 10;

    results.forEach((r, idx) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 0) {
        doc.setFillColor(245, 248, 255);
        doc.rect(margin, y, contentW, 8, "F");
      }
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...PDF_COLORS.dark);
      const nameLines = doc.splitTextToSize(r.name, 65);
      doc.text(nameLines[0], cols[0], y + 5.5);
      doc.text(r.date, cols[1], y + 5.5);
      const provLines = doc.splitTextToSize(r.provider, 36);
      doc.text(provLines[0], cols[2], y + 5.5);
      doc.setTextColor(r.status === "Reviewed" ? 87 : 66, r.status === "Reviewed" ? 104 : 71, r.status === "Reviewed" ? 103 : 79);
      doc.text(r.status, cols[3], y + 5.5);
      y += 9;
    });
  };
}

export default function LabResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<LabResult[]>([]);
  const [page, setPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<"All" | "Reviewed" | "Pending">("All");
  const [showFilter, setShowFilter] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pendingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("patient_lab_results")
        .select("*")
        .eq("patient_id", user.id)
        .order("date", { ascending: false });
      if (data) setResults(data as LabResult[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = results.filter((r) => filterStatus === "All" || r.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const highlights = results.slice(0, 2);
  const pendingResults = results.filter((r) => r.status === "Pending");

  function handleTrackStatus() {
    setFilterStatus("Pending");
    setPage(0);
    setTimeout(() => pendingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function handleFilterChange(f: "All" | "Reviewed" | "Pending") {
    setFilterStatus(f);
    setPage(0);
    setShowFilter(false);
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F8F9FF] dark:bg-[#080F18] transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00355F] dark:border-[#1B6CA8] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-[600] text-[#00355F] dark:text-[#5F9EA0]">Loading lab results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden flex flex-col gap-12 px-4 md:px-6 py-4 md:py-6 bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <div className="flex flex-col gap-2 max-w-[576px]">
          <h2 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-[#00355F] dark:text-white transition-colors">
            Diagnostic Reports
          </h2>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] transition-colors">
            Access your recent blood work, imaging, and clinical diagnostics. All results are verified by the Clinq laboratory team.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-[18px] h-3 shrink-0" />
              Filter
              {filterStatus !== "All" && (
                <span className="ml-1 px-2 py-0.5 bg-[#00355F] dark:bg-[#1B6CA8] text-white rounded-full text-[10px] font-[700]">
                  {filterStatus}
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] shadow-lg z-20 min-w-[140px] overflow-hidden transition-colors">
                {(["All", "Reviewed", "Pending"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
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
          {results.length > 0 && (
            <DownloadPDFButton
              filename="clinq-lab-results-all"
              label="Export All"
              buildDoc={buildExportAllPDF(results)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] dark:bg-[#1B6CA8] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] text-[#8EBDF9] dark:text-white hover:bg-[#0a3d6b] dark:hover:bg-[#2582C7] transition-colors cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* ── Bento Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        {highlights.length === 0 ? (
          <div className="sm:col-span-2 bg-[#F8F9FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-6 text-[14px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
            No lab results on record yet.
          </div>
        ) : (
          highlights.map((h) => (
            <div key={h.id} className="bg-[#F8F9FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-6 flex flex-col justify-between gap-8 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center w-10 h-[50px] bg-[rgba(15,76,129,0.1)] dark:bg-[#1E2D4A]/50 rounded-[8px] shrink-0 transition-colors">
                  {resultIcon(h.name)}
                </div>
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{h.date}</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-[600] leading-8 text-[#0D1C2E] dark:text-white transition-colors">{h.name}</h3>
                <p className="text-[14px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{h.provider}</p>
              </div>
            </div>
          ))
        )}

        {/* Laboratory Alert Card */}
        <div className="bg-[#00355F] dark:bg-[#121E2C] border dark:border-[#22354A] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-6 flex flex-col gap-3 transition-colors">
          <span className="text-[12px] font-[600] tracking-[1.2px] uppercase text-white/70 dark:text-[#A5AAB5]/70 transition-colors">LABORATORY ALERT</span>
          {pendingResults.length === 0 ? (
            <>
              <h3 className="text-[18px] font-[600] leading-8 text-white dark:text-white transition-colors">All Results Reviewed</h3>
              <p className="text-[14px] font-[400] leading-5 text-white/80 dark:text-[#A5AAB5] transition-colors">
                No pending lab results at this time. All diagnostics have been reviewed by your care team.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[18px] font-[600] leading-8 text-white dark:text-white transition-colors">
                {pendingResults.length} Pending Review{pendingResults.length > 1 ? "s" : ""}
              </h3>
              <p className="text-[14px] font-[400] leading-5 text-white/80 dark:text-[#A5AAB5] transition-colors">
                {pendingResults.map((r) => r.name).join(", ")} {pendingResults.length === 1 ? "result is" : "results are"} being processed and will be available within 24 hours.
              </p>
              <div className="pt-3">
                <button
                  onClick={handleTrackStatus}
                  className="px-4 py-2 bg-white dark:bg-[#1B6CA8] rounded-[12px] text-[12px] font-[700] tracking-[0.6px] text-[#00355F] dark:text-white hover:bg-[#EFF4FF] dark:hover:bg-[#2582C7] transition-colors cursor-pointer"
                >
                  Track Status
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Results Table ── */}
      <div ref={pendingRef} className="w-full bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] overflow-x-auto transition-colors animate-fade-in">
        {/* Table Header */}
        <div className="bg-[#EFF4FF] dark:bg-[#1E2D4A]/50 border-b border-[#C2C7D1] dark:border-[#22354A] transition-colors">
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] min-w-[640px] px-6 py-4 gap-4">
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors">Diagnostic Name</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors">Date</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors">Provider</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] text-center transition-colors">Status</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] text-right pr-2 transition-colors">Actions</span>
          </div>
        </div>

        {/* Table Body */}
        {pageRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-[14px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
            No results found{filterStatus !== "All" ? ` for status "${filterStatus}"` : ""}.
          </div>
        ) : (
          pageRows.map((row, idx) => {
            const isPending = row.status === "Pending";
            const isExpanded = expanded === row.id;
            return (
              <div key={row.id}>
                <div
                  className={`grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] min-w-[640px] px-6 py-6 gap-4 items-center ${idx > 0 || isExpanded ? "border-t border-[#C2C7D1] dark:border-[#22354A]" : ""} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    {resultIcon(row.name)}
                    <span className="text-[18px] font-[700] leading-7 text-[#0D1C2E] dark:text-white transition-colors">{row.name}</span>
                  </div>
                  <span className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{row.date}</span>
                  <span className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] transition-colors">{row.provider}</span>
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-[12px] text-[12px] font-[600] tracking-[0.6px] transition-colors ${
                      isPending ? "bg-[#DCE9FF] dark:bg-[#1C2C3E] text-[#42474F] dark:text-[#A5AAB5]" : "bg-[#D4E6E5] dark:bg-[#1E2E2D] text-[#576867] dark:text-[#5F9EA0]"
                    }`}>
                      {row.status}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 justify-end ${isPending ? "opacity-30" : ""}`}>
                    <DownloadPDFButton
                      filename={`clinq-lab-${row.name.toLowerCase().replace(/\s+/g, "-")}`}
                      label={`Download ${row.name}`}
                      buildDoc={buildLabPDF(row)}
                      iconOnly
                    />
                    <button
                      onClick={() => setExpanded(isExpanded ? null : row.id)}
                      className="p-2 rounded-[12px] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer"
                      title={isExpanded ? "Collapse" : "Expand details"}
                    >
                      {isExpanded
                        ? <ChevronUp className="w-3 h-[7px] text-[#42474F] dark:text-[#A5AAB5] transition-colors" />
                        : <ChevronDown className="w-3 h-[7px] text-[#42474F] dark:text-[#A5AAB5] transition-colors" />
                      }
                    </button>
                  </div>
                </div>

                {/* Accordion Detail Row */}
                {isExpanded && (
                  <div className="min-w-[640px] px-6 pb-6 border-t border-[#EFF4FF] dark:border-[#22354A] bg-[#F8F9FF] dark:bg-[#1E2D4A] transition-colors">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                      {[
                        { label: "TEST NAME", value: row.name },
                        { label: "DATE", value: row.date },
                        { label: "PROVIDER", value: row.provider },
                        { label: "STATUS", value: row.status },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-1">
                          <span className="text-[11px] font-[600] tracking-[0.6px] uppercase text-[#42474F] dark:text-[#A5AAB5] transition-colors">{item.label}</span>
                          <span className="text-[14px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[13px] font-[400] leading-5 text-[#42474F] dark:text-[#A5AAB5] max-w-[600px] transition-colors">
                      {isPending
                        ? "This result is currently being processed by the laboratory. You will be notified once it is available for review."
                        : "This result has been reviewed and verified by your care team. Download the PDF for a full report or schedule a consultation to discuss your results."}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#EFF4FF] dark:bg-[#1E2D4A]/50 border-t border-[#C2C7D1] dark:border-[#22354A] transition-colors">
          <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
            Showing {pageRows.length} of {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center justify-center w-[25px] h-9 border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] disabled:opacity-30 hover:bg-white dark:hover:bg-[#1C2C3E] text-[#0D1C2E] dark:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-[7px] h-3 text-[#0D1C2E] dark:text-white" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center justify-center w-[25px] h-9 border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] disabled:opacity-30 hover:bg-white dark:hover:bg-[#1C2C3E] text-[#0D1C2E] dark:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-[7px] h-3 text-[#0D1C2E] dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Understanding Your Results ── */}
      <div className="w-full bg-[#E6EEFF] dark:bg-[#121E2C] border dark:border-[#22354A] rounded-[16px] px-8 pt-12 pb-8 flex flex-col sm:flex-row items-start gap-8 transition-colors">
        <div className="flex items-center justify-center w-24 h-24 bg-[#00355F] dark:bg-[#1B6CA8] rounded-[12px] shrink-0 transition-colors">
          <HelpCircle className="w-9 h-9 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[18px] font-[600] leading-8 text-[#00355F] dark:text-[#5F9EA0] transition-colors">Understanding Your Results</h4>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] max-w-[669px] transition-colors">
            Clinical results can be complex. Our reference guide helps you interpret common laboratory ranges and terminology used in your reports. If you have concerns, please schedule a consultation.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/patient/lab-results/reference-guide"
              className="flex items-center gap-1 text-[12px] font-[700] tracking-[0.6px] text-[#00355F] dark:text-[#1B6CA8] hover:underline"
            >
              Reference Range Guide
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/patient/lab-results/glossary"
              className="flex items-center gap-1 text-[12px] font-[700] tracking-[0.6px] text-[#00355F] dark:text-[#1B6CA8] hover:underline"
            >
              Glossary of Terms
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
