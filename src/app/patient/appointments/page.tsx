"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Phone,
  HelpCircle,
  Video,
  MapPin,
  CheckCircle,
  Grid,
  FileText,
  User,
  Plus
} from "lucide-react";

export default function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 17)); // Oct 17, 2023

  // Simple hardcoded calendar days for Oct 2023
  // Oct 1st was Sunday, 31 days total
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startOffset = 0; // Starts sunday, so offset is 0

  return (
    <div className="w-full px-4 py-4 md:p-6 lg:p-8 flex flex-col gap-10 md:gap-16 bg-[#F8F9FF] font-sans antialiased text-[#42474F]">
      
      {/* ── Header Section ── */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full shrink-0">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <h2 className="text-[24px] font-[600] leading-10 tracking-[-0.8px] text-[#00355F] font-sans">
            Appointments
          </h2>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
            Manage your scheduled visits, consultations, and medical appointments. Keep track of your treatment timeline and support.
          </p>
        </div>

          <Link
                href="/patient/appointments/book"
                className="flex items-center justify-center gap-2 h-[56px] px-[32px] bg-[#00355F] text-white rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),_0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#002645] transition-colors font-sans select-none shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-[14px] h-[14px] stroke-[2.5]" />
            <span className="text-[16px] font-[700] leading-6 tracking-[0.2px]">
              Book Appointment
            </span>
          </Link>
      </section>

      {/* ── Bento Grid Layout for Content ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 w-full">
        
        {/* Left Column: Upcoming & Past Appointments (takes 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-12">
          
          {/* Upcoming Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-[600] leading-8 text-[#0D1C2E] font-sans">
                  Upcoming Visits
                </h3>
                <div className="flex items-center justify-center min-w-[24px] h-[20px] px-2 bg-[#D2E4FF] rounded-full">
                  <span className="text-[12px] font-[700] tracking-[0.6px] text-[#001C37]">2</span>
                </div>
              </div>
              
              {/* Layout Switcher button representation */}
              <button className="flex items-center justify-center w-9 h-9 border border-[#C2C7D1] rounded-[4px] text-[#0D1C2E] hover:bg-[#EFF4FF] transition-colors">
                <Grid className="w-[18px] h-[12px]" />
              </button>
            </div>

            {/* List of cards */}
            <div className="flex flex-col gap-6">
              
              {/* Upcoming Card 1 */}
              <div className="flex flex-col sm:flex-row bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden shrink-0">
                {/* Date Sidebar */}
                <div className="flex flex-row sm:flex-col justify-center items-center gap-2 sm:gap-0.5 px-6 py-4 sm:py-6 sm:w-[120px] bg-[#0F4C81] border-b sm:border-b-0 sm:border-r border-[#C2C7D1] justify-around sm:justify-center">
                  <span className="text-[10px] font-[700] uppercase tracking-[0.6px] text-[#D9E6F8]">OCT</span>
                  <span className="text-[36px] sm:text-[48px] font-[800] tracking-[-0.96px] text-white leading-none my-1">15</span>
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#D9E6F8]">2:00 PM</span>
                </div>
                
                {/* Content & Action Area */}
                <div className="flex flex-col sm:flex-row flex-grow justify-between gap-6 p-6">
                  <div className="flex flex-col gap-1.5 max-w-[272px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#D4E6E5] text-[#576867] rounded-[2px] text-[12px] font-[700] tracking-[0.6px] uppercase select-none">
                        CLINICAL VISIT
                      </span>
                      <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">In-Person</span>
                    </div>
                    <h4 className="text-[18px] font-[700] leading-8 text-[#00355F] font-sans">
                      Dr. Sarah Miller, MD
                    </h4>
                    <span className="text-[14px] leading-5 text-[#42474F]">
                      Suite 410, Medical Arts center
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button className="h-[34px] px-4 border border-[#C2C7D1] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#42474F] hover:bg-[#F8F9FF] transition-colors uppercase">
                      Reschedule
                    </button>
                    <button className="h-[34px] px-6 bg-[#00355F] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white hover:bg-[#002645] transition-colors uppercase">
                      Join
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Card 2 */}
              <div className="flex flex-col sm:flex-row bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden shrink-0">
                {/* Date Sidebar */}
                <div className="flex flex-row sm:flex-col justify-center items-center gap-2 sm:gap-0.5 px-6 py-4 sm:py-6 sm:w-[120px] bg-[#DCE9FF] border-b sm:border-b-0 sm:border-r border-[#C2C7D1] justify-around sm:justify-center">
                  <span className="text-[10px] font-[700] uppercase tracking-[0.6px] text-[#00355F]">OCT</span>
                  <span className="text-[36px] sm:text-[48px] font-[800] tracking-[-0.96px] text-[#00355F] leading-none my-1">22</span>
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F]">10:00 AM</span>
                </div>
                
                {/* Content & Action Area */}
                <div className="flex flex-col sm:flex-row flex-grow justify-between gap-6 p-6">
                  <div className="flex flex-col gap-1.5 max-w-[272px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#D2E4FF] text-[#001C37] rounded-[2px] text-[12px] font-[700] tracking-[0.6px] uppercase select-none">
                        ANNUAL WELLNESS
                      </span>
                      <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">Telehealth</span>
                    </div>
                    <h4 className="text-[18px] font-[700] leading-7 text-[#00355F] font-sans">
                      Routine Dermatological Review
                    </h4>
                    <span className="text-[14px] leading-5 text-[#42474F]">
                      Dr. Michael Chen, MD
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button className="h-[34px] px-4 border border-[#C2C7D1] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#42474F] hover:bg-[#F8F9FF] transition-colors uppercase">
                      Reschedule
                    </button>
                    <button className="h-[34px] px-[24px] bg-[#00355F] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white hover:bg-[#002645] transition-colors uppercase">
                      Join Visit
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Past Appointments Section */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-[600] leading-8 text-[#0D1C2E] font-sans select-none">
              Past Appointments
            </h3>

            <div className="flex flex-col bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden w-full">
              {/* Responsive Table Wrapper */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#EFF4FF] border-b border-[#C2C7D1] h-12">
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">Date / Time</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">Provider</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">Type</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">Status</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase text-right select-none">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C2C7D1]">
                    {/* Row 1 */}
                    <tr className="h-[97px] hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-6 py-2">
                        <div className="flex flex-col">
                          <span className="text-[16px] font-[700] text-[#0D1C2E]">Sept 12, 2023</span>
                          <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] mt-1">10:00 AM</span>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Dr. Sarah Miller, MD
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Consultation
                      </td>
                      <td className="px-6 py-2">
                        <span className="px-2 py-0.5 bg-[#D4E6E5] text-[#576867] rounded-[2px] text-[10px] font-[700] tracking-[0.2px] uppercase select-none font-sans">
                          COMPLETED
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <button className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:underline uppercase">
                          View Summary
                        </button>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="h-[98px] hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-6 py-2">
                        <div className="flex flex-col">
                          <span className="text-[16px] font-[700] text-[#0D1C2E]">Aug 30, 2023</span>
                          <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] mt-1">04:30 PM</span>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Dr. Sarah Miller, MD
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Follow-up
                      </td>
                      <td className="px-6 py-2">
                        <span className="px-2 py-0.5 bg-[#D4E6E5] text-[#576867] rounded-[2px] text-[10px] font-[700] tracking-[0.2px] uppercase select-none font-sans">
                          COMPLETED
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <button className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:underline uppercase">
                          View Summary
                        </button>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="h-[98px] hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-6 py-2">
                        <div className="flex flex-col">
                          <span className="text-[16px] font-[700] text-[#0D1C2E]">July 15, 2023</span>
                          <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] mt-1">11:15 AM</span>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Dr. Michael Chen, MD
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Dermatology
                      </td>
                      <td className="px-6 py-2">
                        <span className="px-2 py-0.5 bg-[#D4E6E5] text-[#576867] rounded-[2px] text-[10px] font-[700] tracking-[0.2px] uppercase select-none font-sans">
                          COMPLETED
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <button className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:underline uppercase">
                          View Summary
                        </button>
                      </td>
                    </tr>

                    {/* Row 4 (opaque/cancelled) */}
                    <tr className="h-[97.5px] hover:bg-[#F8F9FF] transition-colors opacity-60">
                      <td className="px-6 py-2">
                        <div className="flex flex-col">
                          <span className="text-[16px] font-[700] text-[#0D1C2E]">June 02, 2023</span>
                          <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] mt-1">09:00 AM</span>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Dr. Sarah Miller, MD
                      </td>
                      <td className="px-6 py-2 text-[14px] text-[#0D1C2E]">
                        Annual Visit
                      </td>
                      <td className="px-6 py-2">
                        <span className="px-2 py-0.5 bg-[#FFDAD6] text-[#93000A] rounded-[2px] text-[10px] font-[700] tracking-[0.2px] uppercase select-none font-sans">
                          CANCELLED
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <button className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] hover:underline uppercase">
                          Rebook
                        </button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <button className="w-full py-[16px] bg-[#EFF4FF] text-[12px] font-[700] text-[#00355F] hover:bg-[#D9E6F8] transition-colors tracking-[0.6px] uppercase select-none font-sans text-center">
                View All Visit History
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Calendar & Clinic Contact Widgets (takes 1 col) */}
        <div className="flex flex-col gap-8">
          
          {/* Widget 1: Calendar View Widget */}
          <div className="flex flex-col gap-4 bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg p-6">
            <div className="flex items-center justify-between w-full pb-2">
              <h4 className="text-[18px] font-[700] leading-7 text-[#0D1C2E] font-sans">
                Calendar Overview
              </h4>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center p-1 rounded-full text-[#42474F] hover:bg-[#EFF4FF]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center p-1 rounded-full text-[#42474F] hover:bg-[#EFF4FF]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid headers */}
            <div className="grid grid-cols-7 gap-1 text-center border-t border-[#C2C7D1] pt-3">
              {weekdays.map((day, idx) => (
                <span key={idx} className="text-[12px] font-[700] tracking-[0.6px] text-[#42474F]">
                  {day}
                </span>
              ))}
            </div>

            {/* Days in a standard grid */}
            <div className="grid grid-cols-7 gap-y-1.5 text-center mt-2 relative">
              {/* In Oct 2023, 1st day starts on Sunday, so offset is 0 */}
              {daysInMonth.map((day) => {
                const isActive = day === 17;
                const hasDot = day === 18;
                return (
                  <div key={day} className="relative flex flex-col justify-center items-center h-[40px] w-full">
                    <button
                      className={`flex items-center justify-center rounded-[4px] h-[36px] w-[36px] text-[14px] font-[700] transition-all select-none ${
                        isActive
                          ? "bg-[#00355F] text-white"
                          : "text-[#0D1C2E] hover:bg-[#EFF4FF]"
                      }`}
                    >
                      {day}
                    </button>
                    {/* Small blue dot indicator for Day 18 */}
                    {hasDot && (
                      <span className="absolute bottom-1 w-1 h-1 bg-[#00355F] rounded-full z-10" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend Indicators */}
            <div className="mt-4 pt-4 border-t border-[#C2C7D1] flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#00355F]" />
                <span className="text-[14px] text-[#42474F] font-[400]">Confirmed (Active)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#D4E6E5]" />
                <span className="text-[14px] text-[#42474F] font-[400]">Completed</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Priority Lab Access Promo */}
          <div className="relative flex flex-col justify-end p-6 min-h-[350px] bg-[#0F4C81] rounded-lg overflow-hidden shadow-[0px_4px_20px_rgba(15,76,129,0.04)]">
            {/* Ambient decoration */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C81] via-transparent to-transparent opacity-90 z-10" />
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay opacity-20 pointer-events-none" />

            <div className="relative z-20 flex flex-col gap-4">
              <span className="px-2.5 py-1 bg-[#00355F] text-white text-[10px] font-[700] tracking-[0.5px] uppercase rounded-full select-none w-max">
                Featured
              </span>
              <h4 className="text-[18px] font-[600] leading-8 text-[#D3DDEA] font-sans">
                Priority Lab Access
              </h4>
              <p className="text-[14px] leading-5 text-[#D3DDEA] opacity-90">
                Upgrade to Pro to skip wait times for routine blood work and get same-day result analysis.
              </p>
              <button className="w-full py-3 bg-white text-[#0F4C81] hover:bg-[#EFF4FF] font-[700] text-[16px] rounded-lg transition-colors mt-2 text-center uppercase tracking-[0.6px]">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Widget 3: Clinical Support Card */}
          <div className="flex flex-col gap-4 bg-[#EFF4FF] border border-[#C2C7D1] rounded-lg p-6">
            <h4 className="text-[18px] font-[700] leading-7 text-[#0D1C2E] font-sans select-none">
              Scheduling Support
            </h4>
            <div className="flex flex-col gap-4 mt-2">
              {/* Call */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-9 text-[#00355F] shrink-0 mt-0.5">
                  <Phone className="w-[18px] h-[18px]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase">CALL CLINIC</span>
                  <a href="tel:18005550199" className="text-[16px] font-[700] text-[#00355F] hover:underline">
                    1-800-CLINQ-MD
                  </a>
                </div>
              </div>

              {/* Portal */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-9 text-[#00355F] shrink-0 mt-0.5">
                  <HelpCircle className="w-[18px] h-[18px]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase">ONLINE SUPPORT</span>
                  <Link href="/help" className="text-[16px] font-[700] text-[#00355F] hover:underline">
                    Visit Support Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
