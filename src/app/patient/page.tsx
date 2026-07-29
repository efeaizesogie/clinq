"use client";

import React, { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";

export default function PatientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch Profile Vitals
        const { data: profData } = await supabase
          .from("patient_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (profData) {
          setProfile(profData);
        }

        // Fetch Appointments
        const { data: apptData } = await supabase
          .from("appointments")
          .select("*, specialists(full_name, image_url)")
          .eq("patient_id", user.id)
          .order("scheduled_at", { ascending: true })
          .limit(3);
        if (apptData) {
          setAppointments(apptData);
        }

        // Fetch Timeline Events
        const { data: timelineData } = await supabase
          .from("patient_timeline_events")
          .select("*")
          .eq("patient_id", user.id)
          .order("event_date", { ascending: false })
          .limit(3);
        if (timelineData) {
          setTimeline(timelineData);
        }

        // Fetch Prescriptions
        const { data: prescData } = await supabase
          .from("patient_prescriptions")
          .select("*")
          .eq("patient_id", user.id)
          .limit(2);
        if (prescData) {
          setPrescriptions(prescData);
        }

        // Fetch Lab Results
        const { data: labsData } = await supabase
          .from("patient_lab_results")
          .select("*")
          .eq("patient_id", user.id)
          .order("date", { ascending: false })
          .limit(2);
        if (labsData) {
          setLabs(labsData);
        }
      } catch (err) {
        console.error("Error loading patient dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatDateSidebar = (dateStr: string) => {
    if (!dateStr) return { dayName: "TUE", dayNum: "15" };
    try {
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return { dayName: "TUE", dayNum: "15" };
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const dayNum = d.getDate().toString();
      return { dayName, dayNum };
    } catch {
      return { dayName: "TUE", dayNum: "15" };
    }
  };

  const formatTimelineDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8 md:p-12 lg:p-16 flex flex-col gap-10 bg-[#F8F9FF] dark:bg-[#080F18] font-sans antialiased text-[#42474F] dark:text-[#A5AAB5] h-screen justify-center items-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00355F] dark:border-[#1B6CA8] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-[600] text-[#00355F] dark:text-[#5F9EA0]">Loading dynamic health metrics...</span>
        </div>
      </div>
    );
  }

  // Fallback defaults if database is not fully populated for user
  const displayName = profile?.full_name || "Alexander Sterling";
  const userInitials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const weightVal = profile?.weight_lbs || 0.0;
  const hrVal = profile?.heart_rate_bpm || 0.0;
  const bpVal = profile?.blood_pressure_mmhg || "0/0";

  // Prepare custom message banner
  const nextApp = appointments[0];
  let bannerMessage = "Welcome to your Patient Portal. View your diagnostic records, request prescription refills, or contact your care team.";
  if (nextApp) {
    const rawDate = nextApp.date || nextApp.scheduled_at?.split("T")[0];
    const formattedDate = rawDate ? new Date(rawDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "";
    const timeDisplay = nextApp.time_start || (nextApp.scheduled_at ? new Date(nextApp.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "2:00 PM");
    bannerMessage = `You have an upcoming consultation with ${nextApp.specialists?.full_name || nextApp.assigned_doctor || "Dr. Sarah Miller, MD"} on ${formattedDate} at ${timeDisplay}.`;
  }

  return (
    <div className="w-full px-4 py-8 md:p-12 lg:p-16 flex flex-col gap-10 md:gap-16 bg-[#F8F9FF] dark:bg-[#080F18] font-sans antialiased text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
      
      {/* ── 1. Section - Welcome Area (Asymmetric Bento) ── */}
      <section className="flex flex-col gap-6 w-full">
        {/* Banner Card */}
        <div className="relative w-full min-h-[240px] md:h-[256px] rounded-lg bg-[#00355F] dark:bg-[#121E2C] border dark:border-[#22354A] flex flex-col justify-end p-6 md:p-10 overflow-hidden shrink-0 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-blue-500/10 mix-blend-overlay opacity-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-2 max-w-[848px]">
            <h2 className="text-[28px] md:text-[32px] font-[700] leading-tight md:line-height-[56px] tracking-[-0.96px] text-white">
              Good morning, {displayName}
            </h2>
            <p className="text-[16px] md:text-[18px] font-[400] leading-[26px] md:leading-[28px] text-[#8EBDF9] dark:text-[#5F9EA0] max-w-[576px] transition-colors">
              {bannerMessage}
            </p>
          </div>
        </div>

        {/* Vital Signs Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Left card (HR & BP) */}
          <div className="lg:col-span-2 flex flex-col gap-4 bg-[#DCE9FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg p-6 transition-colors">
            <h3 className="text-[12px] font-[600] leading-4 tracking-[1.2px] text-[#00355F] dark:text-[#5F9EA0] uppercase select-none transition-colors">
              LATEST VITALS
            </h3>
            <div className="flex flex-col gap-4">
              {/* Row 1: Heart Rate */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-[#1E2D4A]/50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00355F] dark:bg-[#1B6CA8] rounded-lg text-white transition-colors">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <span className="text-[14px] font-[600] text-[#0D1C2E] dark:text-white">HR</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[16px] font-[700] text-[#0D1C2E] dark:text-white">{hrVal}</span>
                    <span className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] font-[400]">bpm</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-[700] text-[#16A34A]">
                    <span>+2.1%</span>
                    <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Row 2: Blood Pressure */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-[#1E2D4A]/50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00355F] dark:bg-[#1B6CA8] rounded-lg text-white transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[14px] font-[600] text-[#0D1C2E] dark:text-white">Blood Pressure</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[16px] font-[700] text-[#0D1C2E] dark:text-white">{bpVal}</span>
                    <span className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] font-[400]">mmHg</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-[700] text-[#16A34A]">
                    <span>+1.2%</span>
                    <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right card (Weight) */}
          <div className="flex flex-col gap-4 bg-[#DCE9FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg p-6 transition-colors">
            <h3 className="text-[12px] font-[600] leading-4 tracking-[1.2px] text-[#00355F] dark:text-[#5F9EA0] uppercase select-none transition-colors">
              WEIGHT
            </h3>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-[#1E2D4A]/50 rounded-lg h-full transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00355F] dark:bg-[#1B6CA8] rounded-lg text-white transition-colors">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[14px] font-[600] text-[#0D1C2E] dark:text-white">Weight</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[16px] font-[700] text-[#0D1C2E] dark:text-white">{weightVal}</span>
                    <span className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] font-[400]">lbs</span>
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
        <h3 className="text-[12px] font-[600] leading-4 tracking-[1.2px] text-[#00355F] dark:text-[#5F9EA0] uppercase select-none transition-colors">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {/* Card 1: Book Appointment */}
          <Link href="/patient/appointments/book" className="flex flex-col items-center justify-center gap-4 p-6 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] dark:bg-[#1E2D4A] rounded-xl text-[#00355F] dark:text-[#5F9EA0] group-hover:scale-105 transition-transform">
              <Calendar className="w-[18px] h-5" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] dark:text-[#A5AAB5] uppercase text-center max-w-[130px] cursor-pointer">
              Book Appointment
            </span>
          </Link>
          
          {/* Card 2: Message Doctor */}
          <Link href="/patient/messages" className="flex flex-col items-center justify-center gap-4 p-6 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] dark:bg-[#1E2D4A] rounded-xl text-[#00355F] dark:text-[#5F9EA0] group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] dark:text-[#A5AAB5] uppercase text-center max-w-[125px] cursor-pointer">
              Message Doctor
            </span>
          </Link>

          {/* Card 3: Medical Records */}
          <Link href="/patient/records" className="flex flex-col items-center justify-center gap-4 p-6 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] dark:bg-[#1E2D4A] rounded-xl text-[#00355F] dark:text-[#5F9EA0] group-hover:scale-105 transition-transform">
              <FileText className="w-[14px] h-[18px]" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] dark:text-[#A5AAB5] uppercase text-center max-w-[110px] cursor-pointer">
              Medical Records
            </span>
          </Link>

          {/* Card 4: Prescriptions */}
          <Link href="/patient/prescriptions" className="flex flex-col items-center justify-center gap-4 p-6 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 bg-[#DCE9FF] dark:bg-[#1E2D4A] rounded-xl text-[#00355F] dark:text-[#5F9EA0] group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-[600] tracking-[1.2px] text-[#42474F] dark:text-[#A5AAB5] uppercase text-center max-w-[100px] cursor-pointer">
              Prescriptions
            </span>
          </Link>
        </div>
      </section>

      {/* ── 3. Two Column Layout: Appointments & Activity ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 w-full">
        
        {/* Left Column: Upcoming Appointments (takes 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between w-full h-10">
            <h3 className="text-[18px] font-[600] leading-10 tracking-[-0.32px] text-[#00355F] dark:text-[#5F9EA0] font-sans transition-colors">
              Upcoming Appointments
            </h3>
            <Link href="/patient/appointments" className="text-[12px] font-[700] tracking-[0.6px] text-[#00355F] dark:text-[#5F9EA0] hover:underline uppercase cursor-pointer transition-colors">
              See All
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            {appointments.length > 0 ? (
              appointments.map((appt) => {
                const rawDate = appt.date || appt.scheduled_at?.split("T")[0];
                const { dayName, dayNum } = formatDateSidebar(rawDate);
                const isTelehealth = appt.location?.toLowerCase().includes("telehealth") || !appt.location;
                const timeDisplay = appt.time_start || (appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "");
                
                return (
                  <div key={appt.id} className="flex flex-col sm:flex-row bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-lg overflow-hidden shrink-0 transition-colors">
                    {/* Date Sidebar */}
                    <div className="flex flex-row sm:flex-col justify-center items-center gap-2 sm:gap-0.5 px-6 py-4 sm:py-6 sm:w-[120px] bg-[#DCE9FF] dark:bg-[#1E2D4A] border-b sm:border-b-0 sm:border-r border-[#C2C7D1] dark:border-[#22354A] justify-around sm:justify-center transition-colors">
                      <span className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] dark:text-[#5F9EA0] transition-colors">{dayName}</span>
                      <span className="text-[36px] sm:text-[48px] font-[700] tracking-[-0.96px] text-[#00355F] dark:text-white leading-none my-1 transition-colors">{dayNum}</span>
                      <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{timeDisplay}</span>
                    </div>
                    
                    {/* Info & Action area */}
                    <div className="flex flex-col sm:flex-row flex-grow justify-between gap-6 p-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[12px] font-[600] tracking-[-0.6px] text-[#00355F] dark:text-[#5F9EA0] uppercase transition-colors">
                          {appt.is_urgent ? "URGENT VISIT" : "CLINICAL VISIT"}
                        </span>
                        <h4 className="text-[16px] font-[600] leading-8 text-[#0D1C2E] dark:text-white transition-colors">
                          {appt.specialists?.full_name || appt.assigned_doctor || "Dr. Sarah Miller, MD"}
                        </h4>
                        <div className="flex items-center gap-2 text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                          {isTelehealth ? (
                            <>
                              <Video className="w-4 h-4 text-[#42474F] dark:text-[#A5AAB5]" />
                              <span className="text-[14px]">Telehealth Visit</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-[15px]" />
                              <span className="text-[14px]">{appt.location || "Suite 410, Medical Arts center"}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <Link href="/patient/appointments" className="h-[42px] px-6 border border-[#00355F] dark:border-[#1B6CA8] rounded-xl text-[16px] font-[700] text-[#00355F] dark:text-[#1B6CA8] hover:bg-[#00355F]/5 dark:hover:bg-[#1B6CA8]/5 transition-all flex items-center justify-center cursor-pointer">
                          Reschedule
                        </Link>
                        <Link href="/patient/messages" className="flex items-center justify-center w-[52px] h-[38px] bg-[#0F4C81] dark:bg-[#1B6CA8] hover:bg-[#0c3e6a] dark:hover:bg-[#2582C7] text-[#8EBDF9] dark:text-white rounded-xl transition-all cursor-pointer">
                          <MessageSquare className="w-5 h-5 fill-current" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg text-center text-[#42474F] dark:text-[#A5AAB5] transition-colors">
                No upcoming visits scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Timeline */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center h-10">
            <h3 className="text-[18px] font-[600] leading-10 tracking-[-0.32px] text-[#00355F] dark:text-[#5F9EA0] font-sans transition-colors">
              Recent Activity
            </h3>
          </div>

          <div className="relative pl-8 flex flex-col gap-8">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#C2C7D1] dark:bg-[#22354A] transition-colors" />

            {timeline.length > 0 ? (
              timeline.map((event, index) => (
                <div key={event.id} className="relative flex flex-col items-start gap-1">
                  <div className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-[#F8F9FF] dark:border-[#080F18] ${index === 0 ? "bg-[#00355F] dark:bg-[#1B6CA8]" : "bg-[#C2C7D1] dark:bg-[#22354A]"} z-10 transition-colors`} />
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">{formatTimelineDate(event.event_date)}</span>
                  <h5 className="text-[12px] font-[700] tracking-[0.6px] text-[#0D1C2E] dark:text-white transition-colors">{event.title}</h5>
                  <p className="text-[14px] leading-[20px] text-[#42474F] dark:text-[#A5AAB5] mt-1 transition-colors">
                    {event.description}
                  </p>
                  {event.category === "Diagnostic" && (
                    <Link href="/patient/records" className="text-[14px] font-[700] text-[#00355F] dark:text-[#5F9EA0] underline mt-1.5 hover:text-[#0F4C81] dark:hover:text-[#1B6CA8] cursor-pointer transition-colors">
                      View Results
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="relative flex flex-col items-start gap-1">
                <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-[#F8F9FF] dark:border-[#080F18] bg-[#C2C7D1] dark:bg-[#22354A] z-10 transition-colors" />
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] transition-colors">Oct 02, 2023</span>
                <h5 className="text-[12px] font-[700] tracking-[0.6px] text-[#0D1C2E] dark:text-white transition-colors">Registered Account</h5>
                <p className="text-[14px] leading-[20px] text-[#42474F] dark:text-[#A5AAB5] mt-1 transition-colors">
                  Your patient portal account has been successfully provisioned.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Section: Prescriptions & Lab Results ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 w-full">
        
        {/* Left Column: Active Prescriptions (takes 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between w-full h-[18px]">
            <h3 className="text-[18px] font-[600] leading-[18px] text-[#00355F] dark:text-[#5F9EA0] font-sans transition-colors">
              Prescriptions
            </h3>
            <Link href="/patient/prescriptions" className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5] hover:text-[#00355F] dark:hover:text-[#5F9EA0] cursor-pointer transition-colors">
              VIEW ALL
            </Link>
          </div>

          <div className="flex flex-col bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-lg overflow-hidden w-full transition-colors">
            {prescriptions.length > 0 ? (
              prescriptions.map((presc, idx) => (
                <div key={presc.id}>
                  {idx > 0 && <div className="w-full h-px bg-[#C2C7D1] dark:bg-[#22354A] transition-colors" />}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6">
                    <div className="flex flex-col">
                      <h5 className="text-[14px] font-[700] text-[#0D1C2E] dark:text-white transition-colors">{presc.medication_name} {presc.dosage}</h5>
                      <span className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] mt-0.5 transition-colors">{presc.frequency}</span>
                    </div>
                    <div className="flex items-center gap-4 sm:self-center">
                      <span className={`px-2 py-0.5 ${presc.status === "Active" ? "bg-[#DCFCE7] dark:bg-[#1B3E2F] text-[#15803D] dark:text-[#4ADE80]" : "bg-[#FEF3C7] dark:bg-[#3E2F1E] text-[#B45309] dark:text-[#FBBF24]"} rounded-[2px] text-[9px] font-[700] tracking-[0.2px] uppercase select-none transition-colors`}>
                        {presc.status === "Active" ? "REFILL READY" : "COMPLETED"}
                      </span>
                      <span className="text-[9px] text-[#42474F] dark:text-[#A5AAB5] font-[400] transition-colors">{presc.expires}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#42474F] dark:text-[#A5AAB5] transition-colors">No prescriptions loaded.</div>
            )}

            {/* Request Button Footer */}
            <Link href="/patient/prescriptions" className="w-full py-[12px] border-t border-[#C2C7D1] dark:border-[#22354A] bg-white dark:bg-[#121E2C] text-[12px] font-[700] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors tracking-[0.6px] uppercase select-none text-center cursor-pointer">
              Request All Refills
            </Link>
          </div>
        </div>

        {/* Right Column: Lab Results (takes 1 col) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full h-[18px]">
            <h3 className="text-[18px] font-[600] leading-[18px] text-[#00355F] dark:text-[#5F9EA0] font-sans transition-colors">
              Lab Results
            </h3>
            <Link href="/patient/lab-results" className="text-[12px] font-[700] tracking-[0.6px] text-[#00355F] dark:text-[#5F9EA0] hover:underline uppercase cursor-pointer transition-colors">
              See All
            </Link>
          </div>

          <div className="flex flex-col bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-lg overflow-hidden w-full transition-colors">
            {labs.length > 0 ? (
              labs.map((lab, idx) => (
                <div key={lab.id}>
                  {idx > 0 && <div className="w-full h-px bg-[#C2C7D1] dark:bg-[#22354A] transition-colors" />}
                  <div className="flex items-center justify-between gap-3 p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-9 bg-[#DBEAFE] dark:bg-[#1E2D4A] rounded-[2px] text-[#00355F] dark:text-[#5F9EA0] transition-colors">
                        <FileSpreadsheet className="w-4 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <h5 className="text-[14px] font-[700] text-[#0D1C2E] dark:text-white truncate max-w-[125px] transition-colors">
                          {lab.name}
                        </h5>
                        <span className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] mt-0.5 transition-colors">{lab.date}</span>
                      </div>
                    </div>
                    {lab.status === "Reviewed" ? (
                      <Link href="/patient/lab-results" className="px-3 py-1 bg-[#00355F] dark:bg-[#1B6CA8] hover:bg-[#002b4d] dark:hover:bg-[#2582C7] text-white rounded-[12px] text-[9px] font-[700] uppercase tracking-[0.2px] select-none transition-colors cursor-pointer flex items-center justify-center">
                        View Report
                      </Link>
                    ) : (
                      <span className="px-3 py-1 bg-[#FFDAD6] dark:bg-[#3F1E1E] text-[#BA1A1A] dark:text-[#E85B5B] rounded-[12px] text-[9px] font-[700] uppercase tracking-[0.2px] select-none text-center transition-colors">
                        Needs Review
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#42474F] dark:text-[#A5AAB5] transition-colors">No laboratory tests found.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. Section - Promotion / Feature Card ── */}
      <section className="relative w-full rounded-lg bg-[#D5E3FC] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] overflow-hidden min-h-[300px] flex items-center p-6 md:p-16 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-indigo-500/10 mix-blend-saturation opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start gap-4 max-w-[611px]">
          <span className="px-4 py-1 bg-[#00355F] dark:bg-[#1B6CA8] text-white text-[12px] font-[600] tracking-[0.6px] rounded-full select-none uppercase transition-colors">
            Clinq Plus
          </span>
          <h3 className="text-[20px] md:text-[24px] font-[700] tracking-[-0.32px] text-[#00355F] dark:text-[#5F9EA0] mt-1 font-sans transition-colors">
            Advanced Health Insights
          </h3>
          <p className="text-[15px] md:text-[16px] leading-[26px] md:leading-[28px] text-[#42474F] dark:text-[#A5AAB5] max-w-[483px] transition-colors">
            Connect your wearable devices to Clinq and share your vitals directly with your medical team for real-time proactive monitoring.
          </p>
          <button className="h-[48px] px-8 bg-[#00355F] dark:bg-[#1B6CA8] text-white hover:bg-[#002645] dark:hover:bg-[#2582C7] font-[700] text-[14px] rounded-xl tracking-[0.2px] select-none transition-colors mt-2 cursor-pointer">
            Explore Connect
          </button>
        </div>
      </section>

    </div>
  );
}
