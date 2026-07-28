"use client";

import React from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  Search,
  Bell,
  HelpCircle,
  Download,
  AlertTriangle,
  Syringe,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export default function HealthRecordsPage() {
  return (
    <div className="w-full flex flex-col gap-16 px-6 py-6 bg-[#F8F9FF] font-[Manrope,sans-serif] text-[#42474F]">

      {/* ── Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        {/* Left: Title + Description */}
        <div className="flex flex-col gap-2 max-w-[672px]">
          <h2 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-[#00355F]">
            My Health Records
          </h2>
          <p className="text-[16px] font-[400] leading-[24px] text-[#42474F]">
            A centralized view of your medical history, clinical documentation, and health summaries managed by Clinq Medical.
          </p>
        </div>

        {/* Right: Download Button */}
        <button className="flex items-center gap-4 px-6 py-3 bg-[#00355F] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] text-white shrink-0 hover:bg-[#002645] transition-colors">
          <Download className="w-4 h-4 shrink-0" />
          <span className="text-[12px] font-[600] leading-4 tracking-[0.6px] uppercase whitespace-nowrap">
            Download Health Summary (PDF)
          </span>
        </button>
      </div>

      {/* ── Bento Grid: Allergies + Immunizations | Clinical Timeline ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[304px_1fr] gap-6 items-start">

        {/* Left Column: Allergies + Immunizations */}
        <div className="flex flex-col gap-6">

          {/* Allergies Card */}
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-6">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-[22px] h-[19px] text-[#BA1A1A] shrink-0" />
                <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E]">Allergies</span>
              </div>
              <span className="px-3 py-1 bg-[#FFDAD6] rounded-[12px] text-[12px] font-[600] leading-4 tracking-[0.6px] text-[#93000A]">
                3 Active
              </span>
            </div>

            {/* Allergy List */}
            <div className="flex flex-col gap-4">
              {[
                { name: "Penicillin", reaction: "Severe Reaction (Anaphylaxis)", border: true },
                { name: "Latex", reaction: "Skin irritation and rashes", border: true },
                { name: "Peanuts", reaction: "Mild respiratory distress", border: false },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`flex flex-col gap-1 pb-4 ${item.border ? "border-b border-[#C2C7D1]" : ""}`}
                >
                  <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#00355F]">
                    {item.name}
                  </span>
                  <span className="text-[14px] font-[400] leading-5 text-[#42474F]">
                    {item.reaction}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Immunizations Card */}
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-4">
            {/* Card Header */}
            <div className="flex items-center gap-2">
              <Syringe className="w-[19px] h-[20px] text-[#516161] shrink-0" />
              <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E]">Immunizations</span>
            </div>

            {/* Immunization Items */}
            <div className="flex flex-col gap-3">
              {[
                { name: "COVID-19 (Pfizer)", date: "Oct 12, 2023" },
                { name: "Influenza (Annual)", date: "Sep 05, 2023" },
                { name: "Tetanus Booster", date: "Jun 20, 2021" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-3 bg-[#EFF4FF] rounded-[4px]"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#0D1C2E]">
                      {item.name}
                    </span>
                    <span className="text-[14px] font-[400] leading-5 text-[#42474F]">
                      {item.date}
                    </span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#00355F] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Timeline */}
        <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[18px] font-[600] leading-8 text-[#0D1C2E]">Clinical Timeline</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-[#C2C7D1] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] text-[#42474F] hover:bg-[#EFF4FF] transition-colors">
                All Events
              </button>
              <button className="px-3 py-1 border border-[#C2C7D1] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] text-[#42474F] hover:bg-[#EFF4FF] transition-colors">
                Procedures
              </button>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="relative flex flex-col gap-8">
            {/* Vertical line */}
            <div
              className="absolute left-[19px] top-0 bottom-0 w-[2px] pointer-events-none"
              style={{ background: "linear-gradient(180deg, #00355F 0%, #C2C7D1 50%, rgba(194,199,209,0) 100%)" }}
            />

            {/* Item 1 – Laparoscopic Appendectomy */}
            <div className="relative flex items-center gap-6 z-10">
              <div className="flex items-center justify-center w-10 h-10 bg-[#00355F] rounded-[12px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] shrink-0">
                <ClipboardList className="w-[15px] h-[15px] text-white" />
              </div>
              <div className="flex-1 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[18px] font-[700] leading-7 text-[#00355F]">Laparoscopic Appendectomy</span>
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] shrink-0">March 14, 2024</span>
                </div>
                <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
                  Post-operative recovery successful. No complications noted during the 2-week follow-up. Wound healing is optimal.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#00355F]" />
                    <span className="text-[12px] font-[700] tracking-[0.6px] text-[#00355F]">surgical_summary.pdf</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#D4E6E5] rounded-[2px] text-[10px] font-[700] tracking-[0.5px] uppercase text-[#576867]">
                    Surgical
                  </span>
                </div>
              </div>
            </div>

            {/* Item 2 – Annual Physical & Blood Panel */}
            <div className="relative flex items-center gap-6 z-10">
              <div className="flex items-center justify-center w-10 h-10 bg-[#F8F9FF] border-2 border-[#00355F] rounded-[12px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] shrink-0">
                <FlaskConical className="w-[13px] h-[13px] text-[#00355F]" />
              </div>
              <div className="flex-1 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[18px] font-[700] leading-7 text-[#00355F]">Annual Physical &amp; Blood Panel</span>
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] shrink-0">January 08, 2024</span>
                </div>
                <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
                  Comprehensive metabolic panel and lipid profile. All values within normal clinical range except slight vitamin D deficiency.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2 py-0.5 bg-[#DCE9FF] rounded-[2px] text-[10px] font-[700] tracking-[0.5px] uppercase text-[#42474F]">
                    Diagnostic
                  </span>
                  <span className="px-2 py-0.5 bg-[#0F4C81] rounded-[2px] text-[10px] font-[700] tracking-[0.5px] uppercase text-[#EFF4FF]">
                    Normal
                  </span>
                </div>
              </div>
            </div>

            {/* Item 3 – Chronic Back Pain Management (dimmed) */}
            <div className="relative flex items-center gap-6 z-10">
              <div className="flex items-center justify-center w-10 h-10 bg-[#F8F9FF] border-2 border-[#727780] rounded-[12px] shrink-0">
                <Settings className="w-[13px] h-[13px] text-[#42474F]" />
              </div>
              <div className="flex-1 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-2 opacity-60">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[18px] font-[700] leading-7 text-[#0D1C2E]">Chronic Back Pain Management</span>
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] shrink-0">November 22, 2023</span>
                </div>
                <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
                  Referred to Physical Therapy. Prescribed ergonomic adjustments for workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Secure Export Hub ── */}
      <div className="w-full bg-[#00355F] rounded-[16px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: Text */}
          <div className="flex flex-col gap-2 max-w-[576px]">
            <h3 className="text-[24px] font-[600] leading-[40px] tracking-[-0.32px] text-white">
              Secure Export Hub
            </h3>
            <p className="text-[18px] font-[400] leading-7 text-white/80">
              Need your full history for a specialist or personal backup? Generate a secure, encrypted export of your Clinq Health Records instantly.
            </p>
          </div>

          {/* Right: Export Buttons */}
          <div className="flex gap-4 shrink-0">
            {/* Comprehensive PDF */}
            <button className="relative flex flex-col items-center justify-center gap-3 w-[215px] h-[130px] bg-white rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),_0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:shadow-lg transition-shadow">
              <FileText className="w-4 h-5 text-[#00355F]" />
              <span className="text-[16px] font-[700] leading-6 text-[#00355F] text-center">
                Comprehensive PDF
              </span>
            </button>

            {/* FHIR / JSON */}
            <button className="flex flex-col items-center justify-center gap-3 w-[140px] h-[130px] bg-[#0F4C81] border border-white/20 rounded-[8px] hover:bg-[#0a3d6b] transition-colors">
              <FileText className="w-5 h-5 text-[#EFF4FF]" />
              <span className="text-[16px] font-[700] leading-6 text-[#EFF4FF] text-center">
                FHIR / JSON Data
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
