"use client";

import React from "react";
import Image from "next/image";
import { SlidersHorizontal, Download, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, FlaskConical, Activity, FileText, HelpCircle } from "lucide-react";

const highlights = [
  {
    icon: <FlaskConical className="w-4 h-5 text-[#00355F]" />,
    meta: "Last Result: 2 days ago",
    title: "Metabolic Panel",
    desc: "Comprehensive screening for vital organ function.",
  },
  {
    icon: <FileText className="w-[18px] h-5 text-[#00355F]" />,
    meta: "Reviewed: 05 Oct",
    title: "Chest X-Ray",
    desc: "High-resolution thoracic diagnostic imaging.",
  },
];

const rows = [
  {
    icon: <FlaskConical className="w-[18px] h-[18px] text-[#00355F] opacity-40" />,
    name: "CBC with Differential",
    date: "08 Oct 2023",
    provider: "Dr. Aris Thorne",
    status: "Reviewed",
    statusBg: "bg-[#D4E6E5]",
    statusText: "text-[#576867]",
    dimActions: false,
  },
  {
    icon: <Activity className="w-[22px] h-4 text-[#00355F] opacity-40" />,
    name: "Urinalysis, Routine",
    date: "05 Oct 2023",
    provider: "Lab Diagnostics Inc",
    status: "Pending",
    statusBg: "bg-[#DCE9FF]",
    statusText: "text-[#42474F]",
    dimActions: true,
  },
  {
    icon: <FileText className="w-5 h-5 text-[#00355F] opacity-40" />,
    name: "MRI Lumbar Spine",
    date: "22 Sep 2023",
    provider: "Radiology Dept.",
    status: "Reviewed",
    statusBg: "bg-[#D4E6E5]",
    statusText: "text-[#576867]",
    dimActions: false,
  },
];

export default function LabResultsPage() {
  return (
    <div className="w-full flex flex-col gap-12 px-6 py-6 bg-[#F8F9FF] font-[Manrope,sans-serif] text-[#42474F]">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <div className="flex flex-col gap-2 max-w-[576px]">
          <h2 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-[#00355F]">
            Diagnostic Reports
          </h2>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
            Access your recent blood work, imaging, and clinical diagnostics. All results are verified by the Clinq laboratory team.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[#C2C7D1] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:bg-[#EFF4FF] transition-colors">
            <SlidersHorizontal className="w-[18px] h-3 shrink-0" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] text-[#8EBDF9] hover:bg-[#0a3d6b] transition-colors">
            <Download className="w-4 h-4 shrink-0" />
            Export All
          </button>
        </div>
      </div>

      {/* ── Bento Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        {highlights.map((h) => (
          <div key={h.title} className="bg-[#F8F9FF] border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-6 flex flex-col justify-between gap-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-center w-10 h-[50px] bg-[rgba(15,76,129,0.1)] rounded-[8px] shrink-0">
                {h.icon}
              </div>
              <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">{h.meta}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[18px] font-[600] leading-8 text-[#0D1C2E]">{h.title}</h3>
              <p className="text-[14px] font-[400] leading-5 text-[#42474F]">{h.desc}</p>
            </div>
          </div>
        ))}

        {/* Laboratory Alert Card */}
        <div className="bg-[#00355F] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-6 flex flex-col gap-3">
          <span className="text-[12px] font-[600] tracking-[1.2px] uppercase text-white/70">LABORATORY ALERT</span>
          <h3 className="text-[18px] font-[600] leading-8 text-white">1 Pending Review</h3>
          <p className="text-[14px] font-[400] leading-5 text-white/80">
            Full Lipid Profile results are being processed and will be available within 24 hours.
          </p>
          <div className="pt-3">
            <button className="px-4 py-2 bg-white rounded-[12px] text-[12px] font-[700] tracking-[0.6px] text-[#00355F] hover:bg-[#EFF4FF] transition-colors">
              Track Status
            </button>
          </div>
        </div>
      </div>

      {/* ── Results Table ── */}
      <div className="w-full bg-white border border-[#C2C7D1] rounded-[8px] overflow-x-auto">
        {/* Table Header */}
        <div className="bg-[#EFF4FF] border-b border-[#C2C7D1]">
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] min-w-[640px] px-6 py-4 gap-4">
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">Diagnostic Name</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">Date</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">Provider</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] text-center">Status</span>
            <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] text-right pr-2">Actions</span>
          </div>
        </div>

        {/* Table Body */}
        {rows.map((row, idx) => (
          <div
            key={row.name}
            className={`grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] min-w-[640px] px-6 py-6 gap-4 items-center ${idx > 0 ? "border-t border-[#C2C7D1]" : ""}`}
          >
            <div className="flex items-center gap-4">
              {row.icon}
              <span className="text-[18px] font-[700] leading-7 text-[#0D1C2E]">{row.name}</span>
            </div>
            <span className="text-[16px] font-[400] leading-6 text-[#42474F]">{row.date}</span>
            <span className="text-[16px] font-[400] leading-6 text-[#42474F]">{row.provider}</span>
            <div className="flex justify-center">
              <span className={`px-3 py-1 ${row.statusBg} rounded-[12px] text-[12px] font-[600] tracking-[0.6px] ${row.statusText}`}>
                {row.status}
              </span>
            </div>
            <div className={`flex items-center gap-3 justify-end ${row.dimActions ? "opacity-30" : ""}`}>
              <button className="p-2 rounded-[12px] hover:bg-[#EFF4FF] transition-colors">
                <Download className="w-4 h-4 text-[#00355F]" />
              </button>
              <button className="p-2 rounded-[12px] hover:bg-[#EFF4FF] transition-colors">
                <ChevronDown className="w-3 h-[7px] text-[#42474F]" />
              </button>
            </div>
          </div>
        ))}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#EFF4FF]">
          <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">Showing 3 of 24 results</span>
          <div className="flex gap-2">
            <button className="flex items-center justify-center w-[25px] h-9 border border-[#C2C7D1] rounded-[12px] opacity-30" disabled>
              <ChevronLeft className="w-[7px] h-3 text-[#0D1C2E]" />
            </button>
            <button className="flex items-center justify-center w-[25px] h-9 border border-[#C2C7D1] rounded-[12px] hover:bg-white transition-colors">
              <ChevronRight className="w-[7px] h-3 text-[#0D1C2E]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Understanding Your Results ── */}
      <div className="w-full bg-[#E6EEFF] rounded-[16px] px-8 pt-12 pb-8 flex flex-col sm:flex-row items-start gap-8">
        <div className="flex items-center justify-center w-24 h-24 bg-[#00355F] rounded-[12px] shrink-0">
          <HelpCircle className="w-9 h-9 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[18px] font-[600] leading-8 text-[#00355F]">Understanding Your Results</h4>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F] max-w-[669px]">
            Clinical results can be complex. Our reference guide helps you interpret common laboratory ranges and terminology used in your reports. If you have concerns, please schedule a consultation.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <button className="flex items-center gap-1 text-[12px] font-[700] tracking-[0.6px] text-[#00355F] hover:underline">
              Reference Range Guide
              <ExternalLink className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 text-[12px] font-[700] tracking-[0.6px] text-[#00355F] hover:underline">
              Glossary of Terms
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
