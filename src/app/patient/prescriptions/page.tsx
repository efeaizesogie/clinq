"use client";

import React from "react";
import { Plus, Pill, Moon, Sun, ChevronRight, Download, SlidersHorizontal } from "lucide-react";

const secondaryMeds = [
  { name: "Lisinopril", dosage: "10mg Tablet • Twice Daily", expires: "Expires Oct 12, 2024", refills: "0 Refills", action: "Schedule Consultation" },
  { name: "Metformin HCL", dosage: "500mg Extended Release", expires: "Expires Jan 05, 2025", refills: "4 Refills", action: "Refill History" },
  { name: "Ventolin HFA", dosage: "Inhaler • As needed", expires: "Expires Mar 20, 2025", refills: "1 Refill", action: "Request Refill" },
];

const historyRows = [
  { name: "Amoxicillin", form: "500mg Oral Capsule", prescriber: "Dr. Sarah Jenkins", date: "Feb 12, 2024", status: "Completed" },
  { name: "Prednisone", form: "5mg Oral Tablet", prescriber: "Dr. Aris Thorne", date: "Dec 05, 2023", status: "Expired" },
  { name: "Ibuprofen 800mg", form: "Tablet • Acute Pain", prescriber: "Urgent Care Specialist", date: "Nov 18, 2023", status: "Completed" },
];

export default function PrescriptionsPage() {
  return (
    <div className="w-full flex flex-col gap-10 px-6 py-6 bg-[#F8F9FF] font-[Manrope,sans-serif] text-[#42474F]">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <h2 className="text-[24px] font-[600] leading-[40px] tracking-[-0.8px] text-[#00355F]">
            Active Medications
          </h2>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
            Manage your ongoing treatments, view dosage instructions, and request refills from your primary care physician.
          </p>
        </div>
        <button className="flex items-center gap-4 px-8 py-3 bg-[#00355F] rounded-[12px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] text-white shrink-0 hover:bg-[#002645] transition-colors">
          <Plus className="w-[14px] h-[14px] shrink-0" />
          <span className="text-[16px] font-[700] leading-6 whitespace-nowrap">New Refill Request</span>
        </button>
      </div>

      {/* ── Active Prescriptions Bento Grid ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Priority Card – Atorvastatin Calcium (spans 2 cols) */}
        <div className="lg:col-span-2 relative bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-8 flex flex-col gap-6 overflow-hidden">
          <div className="absolute w-32 h-32 -right-8 -top-8 bg-[rgba(0,53,95,0.05)] rounded-bl-[12px] pointer-events-none" />

          <div className="flex items-start justify-between gap-4 z-10">
            <div className="flex flex-col gap-1">
              <div className="mb-2">
                <span className="px-3 py-1 bg-[#D4E6E5] rounded-[12px] text-[12px] font-[700] tracking-[0.6px] text-[#576867]">
                  REFILL READY
                </span>
              </div>
              <h3 className="text-[18px] font-[600] leading-8 text-[#00355F]">Atorvastatin Calcium</h3>
              <p className="text-[16px] font-[400] leading-6 text-[#42474F]">20mg Oral Tablet</p>
            </div>
            <Pill className="w-[27px] h-[27px] text-[#0F4C81] shrink-0 mt-1" />
          </div>

          <div className="border-t border-[#C2C7D1] pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 z-10">
            {[
              { label: "DOSAGE", value: "1 Tablet Daily", color: "text-[#0D1C2E]" },
              { label: "FREQUENCY", value: "Nightly", color: "text-[#0D1C2E]" },
              { label: "DOCTOR", value: "Dr. Aris Thorne", color: "text-[#0D1C2E]" },
              { label: "REFILLS", value: "2 Remaining", color: "text-[#00355F]" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">{item.label}</span>
                <span className={`text-[16px] font-[700] leading-6 ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 z-10">
            <button className="px-6 py-2 bg-[#00355F] rounded-[4px] text-[14px] font-[700] text-white hover:bg-[#002645] transition-colors">
              Request Refill
            </button>
            <button className="px-6 py-2 border border-[#727780] rounded-[4px] text-[14px] font-[700] text-[#00355F] hover:bg-[#EFF4FF] transition-colors">
              View History
            </button>
          </div>
        </div>

        {/* Today's Schedule Sidebar */}
        <div className="bg-[#CCDBF3] border border-[#C2C7D1] rounded-[8px] p-8 flex flex-col gap-6">
          <h4 className="text-[18px] font-[700] leading-7 text-[#00355F]">Today's Schedule</h4>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white border border-[rgba(194,199,209,0.3)] rounded-[4px] p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-[rgba(0,53,95,0.1)] rounded-[12px] shrink-0">
                <Sun className="w-[22px] h-[22px] text-[#00355F]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-[700] tracking-[0.6px] text-[#42474F]">MORNING</span>
                <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">Lisinopril 10mg</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white border border-[rgba(194,199,209,0.3)] rounded-[4px] p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-[rgba(81,97,97,0.1)] rounded-[12px] shrink-0">
                <Moon className="w-[18px] h-[18px] text-[#516161]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-[700] tracking-[0.6px] text-[#42474F]">EVENING</span>
                <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">Atorvastatin 20mg</span>
              </div>
            </div>
          </div>

          {/* Pharmacy on File */}
          <div className="bg-[rgba(255,255,255,0.5)] border border-[rgba(194,199,209,0.2)] rounded-[8px] p-4 flex flex-col gap-2">
            <span className="text-[12px] font-[700] tracking-[0.6px] uppercase text-[#42474F]">PHARMACY ON FILE</span>
            <div className="flex flex-col gap-1 pt-2">
              <span className="text-[16px] font-[700] leading-6 text-[#00355F]">Walgreens #1204</span>
              <span className="text-[14px] font-[400] leading-5 text-[#42474F]">4522 Medical Center Blvd</span>
            </div>
            <button className="flex items-center gap-1 pt-1 text-[14px] font-[700] text-[#00355F] hover:underline">
              Change Pharmacy
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Secondary Active Medications ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {secondaryMeds.map((med) => (
          <div key={med.name} className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">{med.name}</span>
              <span className="px-2 py-0.5 bg-[#D5E3FC] rounded-[2px] text-[10px] font-[700] text-[#42474F]">ACTIVE</span>
            </div>
            <p className="text-[14px] font-[400] leading-5 text-[#42474F]">{med.dosage}</p>
            <div className="h-px bg-[rgba(194,199,209,0.3)]" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-[400] leading-5 text-[#42474F]">{med.expires}</span>
              <span className="text-[14px] font-[700] leading-5 text-[#0D1C2E]">{med.refills}</span>
            </div>
            <button className="w-full py-2 border border-[rgba(0,53,95,0.2)] rounded-[4px] text-[14px] font-[700] text-[#00355F] hover:bg-[#EFF4FF] transition-colors">
              {med.action}
            </button>
          </div>
        ))}
      </div>

      {/* ── Prescription History ── */}
      <div className="flex flex-col gap-6 w-full pt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-[600] leading-8 text-[#00355F]">Prescription History</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-[16px] font-[700] text-[#00355F] hover:bg-[#EFF4FF] rounded-[4px] transition-colors">
            <SlidersHorizontal className="w-[18px] h-3 shrink-0" />
            Filter Records
          </button>
        </div>

        <div className="w-full bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-[#DCE9FF]">
                {[
                  { label: "Medication", align: "text-left" },
                  { label: "Prescribed By", align: "text-left" },
                  { label: "Date", align: "text-left" },
                  { label: "Status", align: "text-left" },
                  { label: "Action", align: "text-right" },
                ].map(({ label, align }) => (
                  <th key={label} className={`px-6 py-4 text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] ${align}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row, idx) => (
                <tr key={row.name} className={idx > 0 ? "border-t border-[#C2C7D1]" : ""}>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">{row.name}</span>
                      <span className="text-[14px] font-[400] leading-5 text-[#42474F]">{row.form}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 pl-12 text-[14px] font-[400] text-[#0D1C2E]">{row.prescriber}</td>
                  <td className="px-6 py-5 text-[14px] font-[400] text-[#0D1C2E]">{row.date}</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-[#D5E3FC] rounded-[12px] text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 rounded-[12px] hover:bg-[#EFF4FF] transition-colors">
                      <Download className="w-4 h-4 text-[#00355F]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
