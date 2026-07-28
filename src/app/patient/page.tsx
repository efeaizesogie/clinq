"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  Activity,
  Tv,
  Calendar,
  MessageSquare,
  FileText,
  Pill,
  ChevronRight,
  MapPin,
  Video,
  FileSpreadsheet,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function PatientDashboardPage() {
  return (
    <div className="w-full px-4 py-8 md:p-12 lg:p-16 flex flex-col gap-10 md:gap-16 bg-[#F8F9FF] font-sans antialiased text-[#42474F]">
      
      {/* ── 1. Section - Welcome Area (Asymmetric Bento) ── */}
      <section className="flex flex-col gap-6 w-full">
        {/* Banner Card */}
        <div className="relative w-full min-h-[240px] md:h-[256px] rounded-lg bg-[#00355F] flex flex-col justify-end p-6 md:p-10 overflow-hidden shrink-0">
          {/* Subtle background overlay placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-blue-500/10 mix-blend-overlay opacity-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-2 max-w-[848px]">
            <h2 className="text-[28px] md:text-[32px] font-[700] leading-tight md:line-height-[56px] tracking-[-0.96px] text-white">
              Good morning, Mr. Henderson
            </h2>
            <p className="text-[16px] md:text-[18px] font-[400] leading-[26px] md:leading-[28px] text-[#8EBDF9] max-w-[576px]">
              You have an upcoming consultation with Dr. Miller in 2 hours. Your latest blood test results are ready for review.
            </p>
          </div>
        </div>

        {/* Vital Signs Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Left card (HR & BP) - takes 2 cols on lg screens */}
          <div className="lg:col-span-2 flex flex-col gap-4 bg-[#DCE9FF] border border-[#C2C7D1] rounded-lg p-6">
            <h3 className="text-[12px] font-[600] leading-4 tracking-[1.2px] text-[#00355F] uppercase select-none">
              LATEST VITALS
            </h3>
            <div className="flex flex-col gap-4">
              {/* Row 1: Heart Rate */}
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00355F] rounded-lg text-white">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <span className="text-[14px] font-[600] text-[#0D1C2E]">HR</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[16px] font-[700] text-[#0D1C2E]">72</span>
                    <span className="text-[10px] text-[#42474F] font-[400]">bpm</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-[700] text-[#16A34A]">
                    <span>+2.1%</span>
                    <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Row 2: Blood Pressure */}
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00355F] rounded-lg text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[14px] font-[600] text-[#0D1C2E]">Blood Pressure</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[16px] font-[700] text-[#0D1C2E]">120/80</span>
                    <span className="text-[10px] text-[#42474F] font-[400]">mmHg</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-[700] text-[#16A34A]">
                    <span>+1.2%</span>
                    <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right card (Weight) - takes 1 col on lg screens */}
          <div className="flex flex-col gap-4 bg-[#DCE9FF] border border-[#C2C7D1] rounded-lg p-6">
            <h3 className="text-[12px] font-[600] leading-4 tracking-[1.2px] text-[#00355F] uppercase select-none">
              WEIGHT
            </h3>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg h-full">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00355F] rounded-lg text-white">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[14px] font-[600] text-[#0D1C2E]">Weight</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[16px] font-[700] text-[#0D1C2E]">185.4</span>
                    <span className="text-[10px] text-[#42474F] font-[400]">lbs</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-[700] text-[#EF4444]">
                    <span>-2.3%</span>
                    <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Section - Quick Actions Grid ── */}
      <section className="flex flex-col gap-4 w-full">
        <h3 className="text-[12px] font-[600] leading-4 tracking-[1.2px] text-[#00355F] uppercase select-none">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {/* Card 1: Book Appointment */}
          <button className="flex flex-col items-center justify-center gap-4 p-6 bg-white border border-[#C2C7D1] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] rounded-xl text-[#00355F] group-hover:scale-105 transition-transform">
              <Calendar className="w-[18px] h-5" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] uppercase text-center max-w-[130px]">
              Book Appointment
            </span>
          </button>
          
          {/* Card 2: Message Doctor */}
          <button className="flex flex-col items-center justify-center gap-4 p-6 bg-white border border-[#C2C7D1] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] rounded-xl text-[#00355F] group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] uppercase text-center max-w-[125px]">
              Message Doctor
            </span>
          </button>

          {/* Card 3: Medical Records */}
          <button className="flex flex-col items-center justify-center gap-4 p-6 bg-white border border-[#C2C7D1] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] rounded-xl text-[#00355F] group-hover:scale-105 transition-transform">
              <FileText className="w-[14px] h-[18px]" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] uppercase text-center max-w-[110px]">
              Medical Records
            </span>
          </button>

          {/* Card 4: Prescriptions */}
          <button className="flex flex-col items-center justify-center gap-4 p-6 bg-white border border-[#C2C7D1] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] rounded-xl text-[#00355F] group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] uppercase text-center max-w-[100px]">
              Prescriptions
            </span>
          </button>
        </div>
      </section>

      {/* ── 3. Two Column Layout: Appointments & Activity ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 w-full">
        
        {/* Left Column: Upcoming Appointments (takes 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between w-full h-10">
            <h3 className="text-[18px] font-[600] leading-10 tracking-[-0.32px] text-[#00355F] font-sans">
              Upcoming Appointments
            </h3>
            <Link href="/patient/appointments" className="text-[12px] font-[700] tracking-[0.6px] text-[#00355F] hover:underline uppercase">
              See All
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            {/* Card 1 */}
            <div className="flex flex-col sm:flex-row bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden shrink-0">
              {/* Date Sidebar */}
              <div className="flex flex-row sm:flex-col justify-center items-center gap-2 sm:gap-0.5 px-6 py-4 sm:py-6 sm:w-[120px] bg-[#DCE9FF] border-b sm:border-b-0 sm:border-r border-[#C2C7D1] justify-around sm:justify-center">
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F]">TUE</span>
                <span className="text-[36px] sm:text-[48px] font-[700] tracking-[-0.96px] text-[#00355F] leading-none my-1">15</span>
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">2:00 PM</span>
              </div>
              
              {/* Info & Action area */}
              <div className="flex flex-col sm:flex-row flex-grow justify-between gap-6 p-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-[600] tracking-[-0.6px] text-[#00355F] uppercase">
                    CLINICAL VISIT
                  </span>
                  <h4 className="text-[16px] font-[600] leading-8 text-[#0D1C2E]">
                    Dr. Sarah Miller, MD
                  </h4>
                  <div className="flex items-center gap-2 text-[#42474F]">
                    <MapPin className="w-4 h-[15px]" />
                    <span className="text-[14px]">Suite 410, Medical Arts center</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <button className="h-[42px] px-6 border border-[#00355F] rounded-xl text-[16px] font-[700] text-[#00355F] hover:bg-[#00355F]/5 transition-colors">
                    Reschedule
                  </button>
                  <button className="flex items-center justify-center w-[52px] h-[38px] bg-[#0F4C81] hover:bg-[#0c3e6a] text-[#8EBDF9] rounded-xl transition-colors">
                    <MessageSquare className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col sm:flex-row bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden shrink-0">
              {/* Date Sidebar */}
              <div className="flex flex-row sm:flex-col justify-center items-center gap-2 sm:gap-0.5 px-6 py-4 sm:py-6 sm:w-[120px] bg-[#DCE9FF] border-b sm:border-b-0 sm:border-r border-[#C2C7D1] justify-around sm:justify-center">
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F]">THU</span>
                <span className="text-[36px] sm:text-[48px] font-[700] tracking-[-0.96px] text-[#00355F] leading-none my-1">22</span>
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">10:00 AM</span>
              </div>
              
              {/* Info & Action area */}
              <div className="flex flex-col sm:flex-row flex-grow justify-between gap-6 p-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-[600] tracking-[-0.6px] text-[#00355F] uppercase">
                    ANNUAL WELLNESS
                  </span>
                  <h4 className="text-[16px] font-[600] leading-8 text-[#0D1C2E]">
                    Dr. Michael Chen, MD
                  </h4>
                  <div className="flex items-center gap-2 text-[#42474F]">
                    <Video className="w-4 h-4 text-[#42474F]" />
                    <span className="text-[14px]">Telehealth Visit</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <button className="h-[42px] px-6 border border-[#00355F] rounded-xl text-[16px] font-[700] text-[#00355F] hover:bg-[#00355F]/5 transition-colors">
                    Reschedule
                  </button>
                  <button className="flex items-center justify-center w-[52px] h-[38px] bg-[#0F4C81] hover:bg-[#0c3e6a] text-[#8EBDF9] rounded-xl transition-colors">
                    <Video className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Timeline (takes 1 col) */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center h-10">
            <h3 className="text-[18px] font-[600] leading-10 tracking-[-0.32px] text-[#00355F] font-sans">
              Recent Activity
            </h3>
          </div>

          <div className="relative pl-8 flex flex-col gap-8">
            {/* Vertical line divider */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#C2C7D1]" />

            {/* Timeline Item 1 */}
            <div className="relative flex flex-col items-start gap-1">
              {/* Blue active dot */}
              <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-[#F8F9FF] bg-[#00355F] z-10" />
              <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">Yesterday, 04:12 PM</span>
              <h5 className="text-[12px] font-[700] tracking-[0.6px] text-[#0D1C2E]">Lab Results Uploaded</h5>
              <p className="text-[14px] leading-[20px] text-[#42474F] mt-1">
                Metabolic Panel for visit on Oct 02 is now available.
              </p>
              <Link href="/patient/records" className="text-[14px] font-[700] text-[#00355F] underline mt-1.5 hover:text-[#0F4C81]">
                View Results
              </Link>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative flex flex-col items-start gap-1">
              {/* Gray dot */}
              <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-[#F8F9FF] bg-[#C2C7D1] z-10" />
              <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">Oct 02, 2023</span>
              <h5 className="text-[12px] font-[700] tracking-[0.6px] text-[#0D1C2E]">Completed Visit</h5>
              <p className="text-[14px] leading-[20px] text-[#42474F] mt-1">
                General checkup with Dr. Miller. Prescription renewed.
              </p>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative flex flex-col items-start gap-1">
              {/* Gray dot */}
              <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-[#F8F9FF] bg-[#C2C7D1] z-10" />
              <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">Sep 28, 2023</span>
              <h5 className="text-[12px] font-[700] tracking-[0.6px] text-[#0D1C2E]">Medication Refill</h5>
              <p className="text-[14px] leading-[20px] text-[#42474F] mt-1">
                Lisinopril 10mg refill processed by Central Pharmacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Section: Prescriptions & Lab Results ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 w-full">
        
        {/* Left Column: Active Prescriptions (takes 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between w-full h-[18px]">
            <h3 className="text-[18px] font-[600] leading-[18px] text-[#00355F] font-sans">
              Prescriptions
            </h3>
            <Link href="/patient/prescriptions" className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] hover:text-[#00355F]">
              VIEW ALL
            </Link>
          </div>

          <div className="flex flex-col bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden w-full">
            {/* Item 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6">
              <div className="flex flex-col">
                <h5 className="text-[14px] font-[700] text-[#0D1C2E]">Lisinopril 10mg</h5>
                <span className="text-[10px] text-[#42474F] mt-0.5">Once daily, morning</span>
              </div>
              <div className="flex items-center gap-4 sm:self-center">
                <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#15803D] rounded-[2px] text-[9px] font-[700] tracking-[0.2px] uppercase select-none">
                  REFILL READY
                </span>
                <span className="text-[9px] text-[#42474F] font-[400]">Exp: Dec 2024</span>
              </div>
            </div>

            {/* Border Divider */}
            <div className="w-full h-px bg-[#C2C7D1]" />

            {/* Item 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6">
              <div className="flex flex-col">
                <h5 className="text-[14px] font-[700] text-[#0D1C2E]">Metformin 500mg</h5>
                <span className="text-[10px] text-[#42474F] mt-0.5">Twice daily, with meals</span>
              </div>
              <div className="flex items-center gap-4 sm:self-center">
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-[2px] text-[9px] font-[700] tracking-[0.2px] uppercase select-none">
                  RENEWAL DUE
                </span>
                <span className="text-[9px] text-[#42474F] font-[400]">Exp: Oct 15, 2023</span>
              </div>
            </div>

            {/* Request Button Footer */}
            <button className="w-full py-[12px] border-t border-[#C2C7D1] bg-white text-[12px] font-[700] text-[#00355F] hover:bg-[#EFF4FF] transition-colors tracking-[0.6px] uppercase select-none">
              Request All Refills
            </button>
          </div>
        </div>

        {/* Right Column: Lab Results (takes 1 col) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full h-[18px]">
            <h3 className="text-[18px] font-[600] leading-[18px] text-[#00355F] font-sans">
              Lab Results
            </h3>
            <Link href="/patient/records" className="text-[12px] font-[700] tracking-[0.6px] text-[#00355F] hover:underline uppercase">
              See All
            </Link>
          </div>

          <div className="flex flex-col bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden w-full">
            {/* Lab 1 */}
            <div className="flex items-center justify-between gap-3 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-9 bg-[#DBEAFE] rounded-[2px] text-[#00355F]">
                  <FileSpreadsheet className="w-4 h-5" />
                </div>
                <div className="flex flex-col">
                  <h5 className="text-[14px] font-[700] text-[#0D1C2E] truncate max-w-[120px]">
                    Metabolic Panel
                  </h5>
                  <span className="text-[10px] text-[#42474F] mt-0.5">Oct 02, 2023</span>
                </div>
              </div>
              <button className="px-3 py-1 bg-[#00355F] hover:bg-[#002b4d] text-white rounded-[12px] text-[9px] font-[700] uppercase tracking-[0.2px] select-none transition-colors">
                View Report
              </button>
            </div>

            {/* Border Divider */}
            <div className="w-full h-px bg-[#C2C7D1]" />

            {/* Lab 2 */}
            <div className="flex items-center justify-between gap-3 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-9 bg-[#F3E8FF] rounded-[2px] text-[#7E22CE]">
                  <FileSpreadsheet className="w-4 h-5" />
                </div>
                <div className="flex flex-col">
                  <h5 className="text-[14px] font-[700] text-[#0D1C2E] truncate max-w-[120px]">
                    Lipid Panel
                  </h5>
                  <span className="text-[10px] text-[#42474F] mt-0.5">Oct 02, 2023</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#FFDAD6] text-[#BA1A1A] rounded-[12px] text-[9px] font-[700] uppercase tracking-[0.2px] select-none text-center">
                Needs Review
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Section - Promotion / Feature Card ── */}
      <section className="relative w-full rounded-lg bg-[#D5E3FC] border border-[#C2C7D1] overflow-hidden min-h-[300px] flex items-center p-6 md:p-16">
        {/* Faded image overlay placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-indigo-500/10 mix-blend-saturation opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start gap-4 max-w-[611px]">
          <span className="px-4 py-1 bg-[#00355F] text-white text-[12px] font-[600] tracking-[0.6px] rounded-full select-none uppercase">
            Clinq Plus
          </span>
          <h3 className="text-[20px] md:text-[24px] font-[700] tracking-[-0.32px] text-[#00355F] mt-1 font-sans">
            Advanced Health Insights
          </h3>
          <p className="text-[15px] md:text-[16px] leading-[26px] md:leading-[28px] text-[#42474F] max-w-[483px]">
            Connect your wearable devices to Clinq and share your vitals directly with your medical team for real-time proactive monitoring.
          </p>
          <button className="h-[48px] px-8 bg-[#00355F] text-white hover:bg-[#002645] font-[700] text-[14px] rounded-xl tracking-[0.2px] select-none transition-colors mt-2">
            Explore Connect
          </button>
        </div>
      </section>

    </div>
  );
}
