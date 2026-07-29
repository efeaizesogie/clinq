"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
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
import { createClient } from "@/lib/supabase/client";

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date()); // Current month shown in calendar
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch user's appointments
        const { data: apptData, error } = await supabase
          .from("appointments")
          .select("*, specialists(full_name, image_url)")
          .eq("patient_id", user.id)
          .order("scheduled_at", { ascending: true });

        if (apptData) {
          setAppointments(apptData);
        }
      } catch (err) {
        console.error("Error loading appointments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Format date helper for sidebars
  const formatDateSidebar = (dateStr: string) => {
    if (!dateStr) return { monthStr: "OCT", dayNum: "15" };
    try {
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return { monthStr: "OCT", dayNum: "15" };
      const monthStr = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      const dayNum = d.getDate().toString();
      return { monthStr, dayNum };
    } catch {
      return { monthStr: "OCT", dayNum: "15" };
    }
  };

  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Derive a display status for any appointment whose date has passed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getApptDate = (appt: any): Date | null => {
    const raw = appt.date || appt.scheduled_at?.split("T")[0];
    if (!raw) return null;
    const d = new Date(raw + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  };

  const isPast = (appt: any) => {
    const d = getApptDate(appt);
    return d ? d < today : false;
  };

  // Display status: what the user sees in the UI
  const getDisplayStatus = (appt: any): { label: string; bg: string; text: string } => {
    if (!isPast(appt)) {
      // Future appointments
      if (appt.status === "Confirmed") return { label: "CONFIRMED",  bg: "bg-[#D4E6E5] dark:bg-[#1E2E2D]", text: "text-[#576867] dark:text-[#A3B3B2]" };
      return { label: "PENDING", bg: "bg-[#E6EEFF] dark:bg-[#1B2F45]", text: "text-[#00355F] dark:text-[#8EBDF9]" };
    }
    // Past appointments — derive from stored status
    switch (appt.status) {
      case "Confirmed":  return { label: "ATTENDED",      bg: "bg-[#DCFCE7] dark:bg-[#183525]", text: "text-[#15803D] dark:text-[#4ADE80]" };
      case "Completed":  return { label: "ATTENDED",      bg: "bg-[#DCFCE7] dark:bg-[#183525]", text: "text-[#15803D] dark:text-[#4ADE80]" };
      case "Cancelled":  return { label: "CANCELLED",     bg: "bg-[#FFDAD6] dark:bg-[#451B1B]", text: "text-[#93000A] dark:text-[#FF8989]" };
      case "Pending":    return { label: "MISSED",        bg: "bg-[#FEF3C7] dark:bg-[#3C2E1B]", text: "text-[#B45309] dark:text-[#FBBF24]" };
      default:           return { label: "EXPIRED",       bg: "bg-[#E0E3E5] dark:bg-[#2A2B2D]", text: "text-[#42474F] dark:text-[#A5AAB5]" };
    }
  };

  const upcomingAppointments = appointments.filter(appt => !isPast(appt));
  const pastAppointments     = appointments.filter(appt => isPast(appt));

  // Calendar rendering math
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const daysInMonthList = Array.from({ length: totalDays }, (_, i) => i + 1);

  const getDayDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8 md:p-12 lg:p-16 flex flex-col gap-10 bg-[#F8F9FF] dark:bg-[#080F18] font-sans antialiased text-[#42474F] dark:text-[#A5AAB5] h-screen justify-center items-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00355F] dark:border-[#1B6CA8] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-[600] text-[#00355F] dark:text-[#5F9EA0]">Loading dynamic appointment timeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 md:p-6 lg:p-8 flex flex-col gap-10 md:gap-16 bg-[#F8F9FF] dark:bg-[#080F18] font-sans antialiased text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
      
      {/* ── Header Section ── */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full shrink-0">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <h2 className="text-[24px] font-[600] leading-10 tracking-[-0.8px] text-[#00355F] dark:text-[#5F9EA0] font-sans transition-colors">
            Appointments
          </h2>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] transition-colors">
            Manage your scheduled visits, consultations, and medical appointments. Keep track of your treatment timeline and support.
          </p>
        </div>

        <Link
          href="/patient/appointments/book"
          className="flex items-center justify-center gap-2 h-[56px] px-[32px] bg-[#00355F] dark:bg-[#1B6CA8] text-white rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),_0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#002645] dark:hover:bg-[#2582C7] transition-all font-sans select-none shrink-0 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-[14px] h-[14px] stroke-[2.5]" />
          <span className="text-[16px] font-[700] leading-6 tracking-[0.2px] cursor-pointer">
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
                <h3 className="text-[18px] font-[600] leading-8 text-[#0D1C2E] dark:text-white font-sans transition-colors">
                  Upcoming Visits
                </h3>
                <div className="flex items-center justify-center min-w-[24px] h-[20px] px-2 bg-[#D2E4FF] dark:bg-[#1E2D4A] rounded-full transition-colors">
                  <span className="text-[12px] font-[700] tracking-[0.6px] text-[#001C37] dark:text-[#8EBDF9] transition-colors">
                    {upcomingAppointments.length}
                  </span>
                </div>
              </div>
              
              <button className="flex items-center justify-center w-9 h-9 border border-[#C2C7D1] dark:border-[#22354A] rounded-[4px] text-[#0D1C2E] dark:text-white hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer">
                <Grid className="w-[18px] h-[12px] cursor-pointer" />
              </button>
            </div>

            {/* List of cards */}
            <div className="flex flex-col gap-6">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appt) => {
                  const { monthStr, dayNum } = formatDateSidebar(appt.date || appt.scheduled_at?.split("T")[0]);
                  const isTelehealth = appt.location?.toLowerCase().includes("telehealth") || !appt.location;
                  const isUrgent = appt.is_urgent;
                  const doctorName = appt.specialists?.full_name || appt.assigned_doctor || "Dr. Sarah Miller, MD";
                  const timeDisplay = appt.time_start || (appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "");
                  const displayStatus = getDisplayStatus(appt);

                  return (
                    <div key={appt.id} className="flex flex-col sm:flex-row bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-lg overflow-hidden shrink-0 transition-colors">
                      {/* Date Sidebar */}
                      <div className="flex flex-row sm:flex-col justify-center items-center gap-2 sm:gap-0.5 px-6 py-4 sm:py-6 sm:w-[120px] bg-[#0F4C81] dark:bg-[#1E2D4A] border-b sm:border-b-0 sm:border-r border-[#C2C7D1] dark:border-[#22354A] justify-around sm:justify-center transition-colors">
                        <span className="text-[10px] font-[700] uppercase tracking-[0.6px] text-[#D9E6F8] dark:text-[#A5AAB5] transition-colors">{monthStr}</span>
                        <span className="text-[36px] sm:text-[48px] font-[800] tracking-[-0.96px] text-white leading-none my-1 transition-colors">{dayNum}</span>
                        <span className="text-[12px] font-[600] tracking-[0.6px] text-[#D9E6F8] dark:text-[#A5AAB5] transition-colors">{timeDisplay}</span>
                      </div>
                      
                      {/* Content & Action Area */}
                      <div className="flex flex-col sm:flex-row flex-grow justify-between gap-6 p-6">
                        <div className="flex flex-col gap-1.5 max-w-[320px]">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 ${isUrgent ? "bg-[#FFDAD6] text-[#93000A]" : "bg-[#D4E6E5] text-[#576867]"} rounded-[2px] text-[12px] font-[700] tracking-[0.6px] uppercase select-none`}>
                              {isUrgent ? "URGENT VISIT" : "CLINICAL VISIT"}
                            </span>
                            <span className={`px-2 py-0.5 ${displayStatus.bg} ${displayStatus.text} rounded-[2px] text-[10px] font-[700] tracking-[0.6px] uppercase select-none`}>
                              {displayStatus.label}
                            </span>
                          </div>
                          <h4 className="text-[18px] font-[700] leading-8 text-[#00355F] dark:text-white font-sans transition-colors">
                            {doctorName}
                          </h4>
                          <div className="flex items-center gap-2 text-[#42474F] dark:text-[#A5AAB5] text-[14px] transition-colors">
                            {isTelehealth ? (
                              <>
                                <Video className="w-4 h-4 text-[#42474F] dark:text-[#A5AAB5]" />
                                <span>Virtual Consultation</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-[15px]" />
                                <span>{appt.location || "Suite 410, Medical Arts center"}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <Link href="/patient/appointments" className="h-[34px] px-4 border border-[#C2C7D1] dark:border-[#22354A] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A] transition-all uppercase cursor-pointer flex items-center justify-center">
                            Reschedule
                          </Link>
                          <Link href="/patient/messages" className="h-[34px] px-6 bg-[#00355F] dark:bg-[#1B6CA8] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white hover:bg-[#002645] dark:hover:bg-[#2582C7] transition-all uppercase cursor-pointer flex items-center justify-center">
                            Message Doctor
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg text-center text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                  You have no upcoming appointments. Click &quot;Book Appointment&quot; to schedule a visit.
                </div>
              )}
            </div>
          </div>

          {/* Past Appointments Section */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-[600] leading-8 text-[#0D1C2E] dark:text-white font-sans select-none transition-colors">
              Past Appointments
            </h3>

            <div className="flex flex-col bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-lg overflow-hidden w-full transition-colors">
              {/* Responsive Table Wrapper */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#EFF4FF] dark:bg-[#1E2D4A] border-b border-[#C2C7D1] dark:border-[#22354A] h-12 transition-colors">
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] uppercase select-none transition-colors">Date / Time</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] uppercase select-none transition-colors">Provider</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] uppercase select-none transition-colors">Type</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] uppercase select-none transition-colors">Status</th>
                      <th className="px-6 text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] uppercase text-right select-none transition-colors">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C2C7D1] dark:divide-[#22354A] transition-colors">
                    {pastAppointments.length > 0 ? (
                      pastAppointments.map((appt) => {
                        const displayStatus = getDisplayStatus(appt);
                        const dateStr = appt.date || appt.scheduled_at?.split("T")[0];
                        const timeDisplay = appt.time_start || (appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "");
                        return (
                          <tr key={appt.id} className={`h-[98px] hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A]/50 transition-colors ${displayStatus.label === "CANCELLED" || displayStatus.label === "MISSED" ? "opacity-70" : ""}`}>
                            <td className="px-6 py-2">
                              <div className="flex flex-col">
                                <span className="text-[16px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">{formatLongDate(dateStr)}</span>
                                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] mt-1 transition-colors">{timeDisplay}</span>
                              </div>
                            </td>
                            <td className="px-6 py-2 text-[14px] text-[#0D1C2E] dark:text-white transition-colors">
                              {appt.specialists?.full_name || appt.assigned_doctor || "Dr. Sarah Miller, MD"}
                            </td>
                            <td className="px-6 py-2 text-[14px] text-[#0D1C2E] dark:text-white transition-colors">
                              {appt.department || "Consultation"}
                            </td>
                            <td className="px-6 py-2">
                              <span className={`px-2 py-0.5 ${displayStatus.bg} ${displayStatus.text} rounded-[2px] text-[10px] font-[700] tracking-[0.2px] uppercase select-none font-sans transition-colors`}>
                                {displayStatus.label}
                              </span>
                            </td>
                            <td className="px-6 py-2 text-right">
                              {displayStatus.label === "CANCELLED" || displayStatus.label === "MISSED" ? (
                                <Link href="/patient/appointments/book" className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] dark:text-[#5F9EA0] hover:underline uppercase cursor-pointer transition-colors">
                                  Rebook
                                </Link>
                              ) : (
                                <Link href="/patient/records" className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] dark:text-[#5F9EA0] hover:underline uppercase cursor-pointer transition-colors">
                                  View Summary
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#42474F]">
                          No past appointment history available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <Link href="/patient/records" className="w-full py-[16px] bg-[#EFF4FF] dark:bg-[#1E2D4A] text-[12px] font-[700] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#D9E6F8] dark:hover:bg-[#1F3C64] transition-colors tracking-[0.6px] uppercase select-none font-sans text-center cursor-pointer">
                View All Visit History
              </Link>
            </div>

          </div>

        </div>

        {/* Right Column: Calendar & Clinic Contact Widgets (takes 1 col) */}
        <div className="flex flex-col gap-8">
          
          {/* Widget 1: Calendar View Widget */}
          <div className="flex flex-col gap-4 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-lg p-6 transition-colors">
            <div className="flex items-center justify-between w-full pb-2">
              <h4 className="text-[18px] font-[700] leading-7 text-[#0D1C2E] dark:text-white font-sans transition-colors">
                Calendar Overview
              </h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="flex items-center justify-center p-1 rounded-full text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 cursor-pointer" />
                </button>
                <span className="text-[14px] font-[700] text-[#0D1C2E] dark:text-white min-w-[100px] text-center select-none transition-colors">
                  {viewDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="flex items-center justify-center p-1 rounded-full text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            </div>

            {/* Calendar Grid headers */}
            <div className="grid grid-cols-7 gap-1 text-center border-t border-[#C2C7D1] dark:border-[#22354A] pt-3 transition-colors">
              {weekdays.map((day, idx) => (
                <span key={idx} className="text-[12px] font-[700] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                  {day}
                </span>
              ))}
            </div>

            {/* Days in a standard grid */}
            <div className="grid grid-cols-7 gap-y-1.5 text-center mt-2 relative">
              {/* Blank days for offset */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={"empty-" + i} className="h-[40px] w-full" />
              ))}

              {/* Month days */}
              {daysInMonthList.map((day) => {
                const dayStr = getDayDateString(day);
                
                // Cell is active if selected or equals today if no selection
                const isSelected = selectedDate === dayStr;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                const isActive = isSelected || (!selectedDate && isToday);

                // Check if patient has any appointment on this specific day
                const dayAppointments = appointments.filter(appt => {
                  const d = appt.date || appt.scheduled_at?.split("T")[0];
                  return d === dayStr;
                });
                const hasDot = dayAppointments.length > 0;

                // Dot colour: priority order — missed > cancelled > attended > pending > confirmed
                let dotColor = "bg-[#00355F]";
                if (hasDot) {
                  const statuses = dayAppointments.map(a => getDisplayStatus(a).label);
                  if (statuses.includes("MISSED"))     dotColor = "bg-[#B45309]";
                  else if (statuses.includes("CANCELLED")) dotColor = "bg-[#BA1A1A]";
                  else if (statuses.includes("ATTENDED"))  dotColor = "bg-[#15803D]";
                  else if (statuses.includes("PENDING"))   dotColor = "bg-[#8EBDF9]";
                  else if (statuses.includes("CONFIRMED")) dotColor = "bg-[#00355F]";
                }

                return (
                  <div key={day} className="relative flex flex-col justify-center items-center h-[40px] w-full">
                    <button
                      onClick={() => setSelectedDate(dayStr)}
                      className={`flex items-center justify-center rounded-[4px] h-[36px] w-[36px] text-[14px] font-[700] transition-all select-none cursor-pointer ${
                        isActive
                          ? "bg-[#00355F] dark:bg-[#1B6CA8] text-white dark:text-white"
                          : "text-[#0D1C2E] dark:text-white hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]"
                      }`}
                    >
                      {day}
                    </button>
                    {/* Dynamic dot indicator */}
                    {hasDot && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 ${dotColor} rounded-full z-10`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend Indicators */}
            <div className="mt-4 pt-4 border-t border-[#C2C7D1] dark:border-[#22354A] flex flex-col gap-2 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#00355F]" />
                <span className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] font-[400] transition-colors">Confirmed</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#8EBDF9]" />
                <span className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] font-[400] transition-colors">Pending</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#15803D]" />
                <span className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] font-[400] transition-colors">Attended</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#B45309]" />
                <span className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] font-[400] transition-colors">Missed</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#BA1A1A]" />
                <span className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] font-[400] transition-colors">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Priority Lab Access Promo */}
          <div className="relative flex flex-col justify-end p-6 min-h-[350px] bg-[#0F4C81] dark:bg-[#121E2C] border dark:border-[#22354A] rounded-lg overflow-hidden shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C81] dark:from-[#121E2C] via-transparent to-transparent opacity-90 z-10" />
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay opacity-20 pointer-events-none" />

            <div className="relative z-20 flex flex-col gap-4">
              <span className="px-2.5 py-1 bg-[#00355F] dark:bg-[#1B6CA8] text-white text-[10px] font-[700] tracking-[0.5px] uppercase rounded-full select-none w-max transition-colors">
                Featured
              </span>
              <h4 className="text-[18px] font-[600] leading-8 text-[#D3DDEA] dark:text-white font-sans transition-colors">
                Priority Lab Access
              </h4>
              <p className="text-[14px] leading-5 text-[#D3DDEA] dark:text-[#A5AAB5] opacity-90 transition-colors">
                Upgrade to Pro to skip wait times for routine blood work and get same-day result analysis.
              </p>
              <button className="w-full py-3 bg-white dark:bg-[#1B6CA8] text-[#0F4C81] dark:text-white hover:bg-[#EFF4FF] dark:hover:bg-[#2582C7] font-[700] text-[16px] rounded-lg transition-colors mt-2 text-center uppercase tracking-[0.6px] cursor-pointer">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Widget 3: Clinical Support Card */}
          <div className="flex flex-col gap-4 bg-[#EFF4FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg p-6 transition-colors font-sans">
            <h4 className="text-[18px] font-[700] leading-7 text-[#0D1C2E] dark:text-white font-sans select-none transition-colors">
              Scheduling Support
            </h4>
            <div className="flex flex-col gap-4 mt-2">
              {/* Call */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-9 text-[#00355F] dark:text-[#5F9EA0] shrink-0 mt-0.5 transition-colors">
                  <Phone className="w-[18px] h-[18px]" />
                </div>
                <div className="flex flex-col font-sans">
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] uppercase transition-colors">CALL CLINIC</span>
                  <a href="tel:18005550199" className="text-[16px] font-[700] text-[#00355F] dark:text-[#1B6CA8] hover:underline cursor-pointer transition-colors">
                    1-800-CLINQ-MD
                  </a>
                </div>
              </div>

              {/* Portal */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-9 text-[#00355F] dark:text-[#5F9EA0] shrink-0 mt-0.5 transition-colors">
                  <HelpCircle className="w-[18px] h-[18px]" />
                </div>
                <div className="flex flex-col font-sans">
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] uppercase transition-colors">ONLINE SUPPORT</span>
                  <Link href="/help" className="text-[16px] font-[700] text-[#00355F] dark:text-[#1B6CA8] hover:underline cursor-pointer transition-colors">
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
