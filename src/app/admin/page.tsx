"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Settings,
  Users,
  BedDouble,
  Calendar,
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  UserX,
  TrendingUp,
  Download,
  ChevronDown,
} from "lucide-react";
import type {
  AdminDashboardData,
  Patient,
  StaffMember,
} from "@/app/api/admin/dashboard/route";

const deptWorkload = [
  { name: "Emergency Department", pct: 94, overflow: false },
  { name: "Pediatrics", pct: 62, overflow: false },
  { name: "Intensive Care Unit", pct: 88, overflow: false },
  { name: "Radiology", pct: 45, overflow: false },
  { name: "Outpatient Clinic", pct: 112, overflow: true },
];

function statusColor(status: string) {
  if (status === "Critical") return { dot: "#BA1A1A", text: "#BA1A1A" };
  if (status === "Observation") return { dot: "#516161", text: "#576867" };
  return { dot: "#00355F", text: "#00355F" };
}

function deptBadgeColor(dept: string) {
  const map: Record<string, string> = {
    Cardiology: "#DCE9FF",
    Emergency: "#DCE9FF",
    Neurology: "#DCE9FF",
    Pediatrics: "#DCE9FF",
    Orthopedics: "#DCE9FF",
  };
  return map[dept] ?? "#DCE9FF";
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const kpis = data?.kpis;
  const admissions: Patient[] = data?.recentAdmissions ?? [];
  const staff: StaffMember[] = data?.onDutyStaff ?? [];
  const onDutyCount = data?.onDutyCount ?? 42;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8F9FF]">
      {/* ── Top Nav Bar ── */}
      <header className="w-full h-16 bg-[#F8F9FF] border-b border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
        {/* Search */}
        <div className="relative w-[384px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#727780]" />
          <input
            type="text"
            placeholder="Search analytics, patients, or reports..."
            className="w-full h-[42px] pl-10 pr-4 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[4px] text-[16px] text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Help Center */}
          <button className="px-4 py-2 rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#00355F] uppercase">
            Help Center
          </button>

          {/* Notification bell */}
          <div className="relative flex items-center justify-center w-8 h-[42px] rounded-[12px] cursor-pointer">
            <Bell className="w-4 h-5 text-[#0D1C2E]" />
            <span className="absolute top-2 right-[7px] w-2 h-2 bg-[#BA1A1A] border-2 border-[#F8F9FF] rounded-full" />
          </div>

          {/* Settings */}
          <div className="flex items-center justify-center w-9 h-[42px] rounded-[12px] cursor-pointer">
            <Settings className="w-5 h-5 text-[#0D1C2E]" />
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[#C2C7D1]" />

          {/* Admin profile */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#0D1C2E]">
                Dr. Sarah Chen
              </span>
              <span className="text-[10px] font-[400] leading-[15px] tracking-[0.5px] uppercase text-[#0D1C2E]">
                Hospital Admin
              </span>
            </div>
            <div className="w-10 h-10 rounded-[12px] bg-[#D2E4FF] border border-[#C2C7D1] flex items-center justify-center text-[#00355F] font-[700] text-sm">
              SC
            </div>
          </div>
        </div>
      </header>

      {/* ── Dashboard Canvas ── */}
      <main className="flex flex-col gap-6 p-6 w-full">
        {/* Section Header */}
        <div className="flex items-end justify-between w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-[600] leading-8 text-[#00355F]">
              Administrative Overview
            </h1>
            <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
              Real-time clinical throughput and facility operational metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Date filter */}
            <button className="flex items-center gap-2 px-3 py-2 h-[42px] bg-[#DCE9FF] border border-[#C2C7D1] rounded-[2px] text-[16px] text-[#00355F]">
              <Calendar className="w-[13.5px] h-[15px] text-[#00355F] shrink-0" />
              <span>Last 24 Hours</span>
              <ChevronDown className="w-[9px] h-[5.55px] text-[#00355F] shrink-0" />
            </button>
            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-[9px] h-[42px] bg-[#00355F] rounded-[4px] text-[16px] text-white">
              <Download className="w-4 h-4 text-white shrink-0" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-4 gap-6 w-full">
          {/* Total Patients */}
          <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <span className="text-[16px] font-[400] leading-6 tracking-[0.8px] uppercase text-[#42474F]">
                Total Patients
              </span>
              <div className="w-8 h-8 bg-[#0F4C81]/10 rounded-[2px] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#0F4C81]" />
              </div>
            </div>
            <div className="flex flex-col gap-[3.5px] pt-2">
              <span className="text-[16px] font-[400] leading-6 text-[#00355F]">
                {isLoading
                  ? "—"
                  : (kpis?.totalPatients ?? 1284).toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-[7px] text-[#00355F]" />
                <span className="text-[12px] font-[700] leading-[18px] text-[#00355F]">
                  +{kpis?.patientGrowth ?? 4.2}% vs last month
                </span>
              </div>
            </div>
          </div>

          {/* Bed Occupancy */}
          <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <span className="text-[16px] font-[400] leading-6 tracking-[0.8px] uppercase text-[#42474F]">
                Bed Occupancy
              </span>
              <div className="w-9 h-8 bg-[#0F4C81]/10 rounded-[2px] flex items-center justify-center">
                <BedDouble className="w-5 h-[14px] text-[#0F4C81]" />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[16px] font-[400] leading-6 text-[#00355F]">
                {kpis?.bedOccupancy ?? 82}%
              </span>
              <div className="relative w-full h-[6px] bg-[#E6EEFF] rounded-[12px]">
                <div
                  className="absolute left-0 top-0 h-full bg-[#00355F] rounded-[12px]"
                  style={{ width: `${kpis?.bedOccupancy ?? 82}%` }}
                />
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <span className="text-[16px] font-[400] leading-6 tracking-[0.8px] uppercase text-[#42474F]">
                Appointments
              </span>
              <div className="w-[34px] h-[38px] bg-[#0F4C81]/10 rounded-[2px] flex items-center justify-center">
                <Calendar className="w-[18px] h-5 text-[#0F4C81]" />
              </div>
            </div>
            <div className="flex flex-col gap-[3.5px] pt-2">
              <span className="text-[16px] font-[400] leading-6 text-[#00355F]">
                {isLoading ? "—" : kpis?.appointments ?? 142}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-[700] leading-[18px] text-[#00355F]">
                  {kpis?.pendingCheckIn ?? 12}
                </span>
                <span className="text-[12px] font-[400] leading-[18px] text-[#42474F]">
                  pending check-in
                </span>
              </div>
            </div>
          </div>

          {/* Daily Revenue */}
          <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <span className="text-[16px] font-[400] leading-6 tracking-[0.8px] uppercase text-[#42474F]">
                Daily Revenue
              </span>
              <div className="w-[35px] h-[36px] bg-[#0F4C81]/10 rounded-[2px] flex items-center justify-center">
                <CreditCard className="w-[19px] h-[18px] text-[#0F4C81]" />
              </div>
            </div>
            <div className="flex flex-col gap-[3.5px] pt-2">
              <span className="text-[16px] font-[400] leading-6 text-[#00355F]">
                ${((kpis?.dailyRevenue ?? 42800) / 1000).toFixed(1)}k
              </span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-[7px] text-[#00355F]" />
                <span className="text-[12px] font-[700] leading-[18px] text-[#00355F]">
                  +{kpis?.revenueGrowth ?? 12.1}% spike today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Layout Grid ── */}
        <div className="flex gap-6 w-full items-start">
          {/* ── Left Column ── */}
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            {/* Hospital Operational Status */}
            <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-5 text-[#00355F]" />
                  <span className="text-[16px] font-[400] leading-6 text-[#0D1C2E]">
                    Hospital Operational Status
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#BA1A1A]" />
                  <span className="text-[16px] font-[700] leading-6 text-[#BA1A1A]">
                    3 Critical Alerts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* ER Capacity — critical */}
                <div className="flex flex-col gap-1 p-4 bg-[rgba(255,218,214,0.2)] border border-[rgba(186,26,26,0.2)] rounded-[4px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-[400] leading-6 text-[#BA1A1A]">
                      ER Capacity
                    </span>
                    <AlertTriangle className="w-[22px] h-[19px] text-[#BA1A1A]" />
                  </div>
                  <span className="text-[16px] font-[400] leading-6 text-[#BA1A1A] pt-1">
                    94%
                  </span>
                  <span className="text-[16px] font-[400] leading-6 text-[rgba(186,26,26,0.8)]">
                    Diversion protocol active in 20m
                  </span>
                </div>

                {/* O2 Supply — ok */}
                <div className="flex flex-col gap-1 p-4 bg-[#E6EEFF] border border-[#C2C7D1] rounded-[4px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-[400] leading-6 text-[#42474F]">
                      O2 Supply
                    </span>
                    <CheckCircle className="w-5 h-5 text-[#00355F]" />
                  </div>
                  <span className="text-[16px] font-[400] leading-6 text-[#00355F] pt-1">
                    78%
                  </span>
                  <span className="text-[16px] font-[400] leading-6 text-[#42474F]">
                    Sufficient for 72 hours
                  </span>
                </div>

                {/* Staff Ratio — critical */}
                <div className="flex flex-col gap-1 p-4 bg-[rgba(255,218,214,0.2)] border border-[rgba(186,26,26,0.2)] rounded-[4px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-[400] leading-6 text-[#BA1A1A]">
                      Staff Ratio
                    </span>
                    <UserX className="w-[19.83px] h-[19.83px] text-[#BA1A1A]" />
                  </div>
                  <span className="text-[16px] font-[400] leading-6 text-[#BA1A1A] pt-1">
                    1:12
                  </span>
                  <span className="text-[16px] font-[400] leading-6 text-[rgba(186,26,26,0.8)]">
                    ICU understaffed (Zone B)
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Admissions Table */}
            <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#C2C7D1]">
                <span className="text-[16px] font-[400] leading-6 text-[#0D1C2E]">
                  Recent Admissions
                </span>
                <Link
                  href="/admin/patients"
                  className="text-[16px] font-[400] leading-6 text-[#00355F]"
                >
                  View All Patients
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#EFF4FF]">
                      <th className="text-left px-6 py-[19.25px] text-[11px] font-[600] leading-4 tracking-[0.55px] uppercase text-[#42474F] whitespace-nowrap">
                        Patient Name
                      </th>
                      <th className="text-left px-6 py-3 text-[11px] font-[600] leading-4 tracking-[0.55px] uppercase text-[#42474F] whitespace-nowrap">
                        Admission ID
                      </th>
                      <th className="text-left px-6 py-[19.25px] text-[11px] font-[600] leading-4 tracking-[0.55px] uppercase text-[#42474F]">
                        Department
                      </th>
                      <th className="text-left px-6 py-[19.25px] text-[11px] font-[600] leading-4 tracking-[0.55px] uppercase text-[#42474F]">
                        Status
                      </th>
                      <th className="text-left px-6 py-[19.25px] text-[11px] font-[600] leading-4 tracking-[0.55px] uppercase text-[#42474F]">
                        Vitals
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map((p, i) => {
                      const sc = statusColor(p.status);
                      return (
                        <tr
                          key={p.id}
                          className={`${
                            i > 0 ? "border-t border-[#C2C7D1]" : ""
                          }`}
                        >
                          {/* Patient Name */}
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-[20px] h-8 rounded-[12px] bg-[#D2E4FF] flex items-center justify-center text-[12px] font-[700] text-[#00355F] shrink-0 px-3">
                                {p.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">
                                  {p.full_name}
                                </span>
                                <span className="text-[12px] font-[400] leading-[18px] text-[#42474F]">
                                  {p.age} yrs • {p.gender}
                                </span>
                              </div>
                            </div>
                          </td>
                          {/* Admission ID */}
                          <td className="px-6 py-6 pl-12">
                            <span className="text-[16px] font-[400] leading-6 text-[#42474F]">
                              {p.admission_id}
                            </span>
                          </td>
                          {/* Department */}
                          <td className="px-6 py-[38px]">
                            <span
                              className="inline-flex items-center px-2 py-[3px] text-[11px] font-[700] leading-4 uppercase text-[#00355F] border border-[#C2C7D1] rounded-[2px]"
                              style={{
                                background: deptBadgeColor(p.department),
                              }}
                            >
                              {p.department}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-6 pl-6">
                            <div className="flex items-center gap-[6px]">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: sc.dot }}
                              />
                              <span
                                className="text-[16px] font-[600] leading-6"
                                style={{ color: sc.text }}
                              >
                                {p.status}
                              </span>
                            </div>
                          </td>
                          {/* Vitals */}
                          <td className="px-6 py-6 pl-12">
                            <div className="flex items-start gap-2">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-[700] leading-[15px] uppercase text-[#42474F]">
                                  BPM
                                </span>
                                <span
                                  className="text-[16px] font-[700] leading-6 text-[#00355F]"
                                  style={{
                                    color: p.bpm > 100 ? "#BA1A1A" : "#00355F",
                                  }}
                                >
                                  {p.bpm}
                                </span>
                              </div>
                              <div className="w-px h-6 bg-[#C2C7D1] self-end mb-[0px]" />
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-[700] leading-[15px] uppercase text-[#42474F]">
                                  SPO2
                                </span>
                                <span
                                  className="text-[16px] font-[700] leading-6"
                                  style={{
                                    color: p.spo2 < 95 ? "#BA1A1A" : "#00355F",
                                  }}
                                >
                                  {p.spo2}%
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-6 w-[309px] shrink-0">
            {/* Departmental Workload */}
            <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] p-6 flex flex-col gap-6">
              <span className="text-[16px] font-[400] leading-6 text-[#0D1C2E]">
                Departmental Workload
              </span>

              <div className="flex flex-col gap-6 pb-2">
                {deptWorkload.map((dept) => {
                  const isOver = dept.pct > 100;
                  const barColor = isOver ? "#BA1A1A" : "#00355F";
                  const barWidth = Math.min(dept.pct, 100);
                  return (
                    <div key={dept.name} className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <span className="text-[11px] font-[400] leading-4 uppercase text-[#42474F]">
                          {dept.name}
                        </span>
                        <span className="text-[11px] font-[400] leading-4 uppercase text-[#00355F]">
                          {dept.pct}% Capacity
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-[#E6EEFF] rounded-[12px]">
                        <div
                          className="absolute left-0 top-0 h-full rounded-[12px]"
                          style={{
                            width: `${barWidth}%`,
                            background: barColor,
                          }}
                        />
                      </div>
                      {isOver && (
                        <span className="text-[10px] font-[700] leading-[15px] text-[#BA1A1A]">
                          Overflow Active: 12 patients in waiting
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#C2C7D1] pt-6">
                <button className="w-full h-[50px] bg-[#DCE9FF] border border-[#C2C7D1] rounded-[4px] text-[16px] font-[700] text-[#00355F]">
                  View Capacity Forecast
                </button>
              </div>
            </div>

            {/* On-Duty Doctors */}
            <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-[8px] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-[400] leading-6 text-[#0D1C2E]">
                  On-Duty Doctors
                </span>
                <span className="px-2 py-[2px] bg-[#D4E6E5] rounded-[12px] text-[10px] font-[700] leading-[15px] text-[#576867]">
                  {isLoading ? "—" : onDutyCount} ACTIVE
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {staff.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-2 rounded-[4px] ${
                      !s.is_on_duty ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className="w-10 h-10 border border-[#C2C7D1] rounded-[4px] flex items-center justify-center shrink-0"
                      style={{ background: s.color_bg }}
                    >
                      <span
                        className="text-[12px] font-[700]"
                        style={{ color: s.color_text }}
                      >
                        {s.initials}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E] truncate">
                        {s.full_name}
                      </span>
                      <span className="text-[11px] font-[600] leading-4 tracking-[0.275px] uppercase text-[#42474F]">
                        {s.role}
                      </span>
                    </div>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: s.is_on_duty ? "#00355F" : "#C2C7D1",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
