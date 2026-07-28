"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, subWeeks, addWeeks, isSameDay } from "date-fns";
import type { AppointmentRecord } from "@/app/api/admin/appointments/route";

const parseTimeToPixels = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return ((h - 8) + (m / 60)) * 80;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  
  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "error" | "success" }>({ show: false, msg: "", type: "success" });
  
  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDept, setFormDept] = useState("General Practice");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formTimeStart, setFormTimeStart] = useState("");
  const [formTimeEnd, setFormTimeEnd] = useState("");
  const [formUrgent, setFormUrgent] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Fetch logic directly connected to DB
  const fetchAppointments = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const startStr = format(weekStart, "yyyy-MM-dd");
      const endStr = format(weekEnd, "yyyy-MM-dd");
      const res = await fetch(`/api/admin/appointments?start=${startStr}&end=${endStr}`);
      if (!res.ok) throw new Error("Failed to load appointments from server");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
     setIsMounted(true);
     fetchAppointments();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const showToast = (msg: string, type: "error" | "success") => {
      setToast({ show: true, msg, type });
      setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  // ── Intelligent Available Time Slots Calculation ──
  // Generate 30 min intervals from 8:00 to 17:00
  const ALL_TIME_SLOTS = Array.from({ length: 19 }).map((_, i) => {
    const hr = Math.floor(i / 2) + 8;
    const mn = i % 2 === 0 ? "00" : "30";
    return `${String(hr).padStart(2, "0")}:${mn}`;
  });

  // Calculate disabled start times based on the chosen formDate
  const availableStartSlots = useMemo(() => {
      const sameDayAppointments = appointments.filter(a => a.date === formDate);
      
      return ALL_TIME_SLOTS.filter(slot => {
          if (slot === "17:00") return false; // Can't start at 17:00
          
          const [sHr, sMn] = slot.split(":").map(Number);
          const slotPxStart = (sHr - 8) * 80 + (sMn / 60) * 80;
          const slotPxEnd = slotPxStart + 40; // Assume minimum 30 min duration for conflict testing
          
          // Check collision with any existing application block mathematically
          const collision = sameDayAppointments.some(a => {
              const startY = parseTimeToPixels(a.time_start);
              const endY = parseTimeToPixels(a.time_end);
              // standard broad phase collision intersection: (StartA < EndB) and (EndA > StartB)
              return (slotPxStart < endY) && (slotPxEnd > startY);
          });
          
          return !collision;
      });
  }, [appointments, formDate]);

  // Ensure default states aren't empty if valid options exist
  useEffect(() => {
      if (showAddModal) {
          if (availableStartSlots.length > 0 && !availableStartSlots.includes(formTimeStart)) {
              setFormTimeStart(availableStartSlots[0]);
          } else if (availableStartSlots.length === 0) {
              setFormTimeStart("");
          }
      }
  }, [showAddModal, formDate, availableStartSlots, formTimeStart]);

  useEffect(() => {
      if (formTimeStart) {
          const [hr, mn] = formTimeStart.split(":").map(Number);
          let endHr = hr + 1;
          let endMn = mn;
          if (endHr >= 17) { endHr = 17; endMn = 0; }
          setFormTimeEnd(`${String(endHr).padStart(2, "0")}:${String(endMn).padStart(2, "0")}`);
      }
  }, [formTimeStart]);

  // Modal Submit form
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDate || !formTimeStart || !formTimeEnd) {
       setFormError("Detailed time selections and Patient names are strictly required.");
       return;
    }
    
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: formName,
          department: formDept,
          type: "Routine",
          date: formDate,
          time_start: formTimeStart,
          time_end: formTimeEnd,
          is_urgent: formUrgent,
          day_of_week: format(new Date(formDate), "EEEE")
        })
      });

      if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody.error || "Could not save appointment.");
      }
      
      await fetchAppointments();
      setShowAddModal(false);
      setFormName("");
      showToast("Appointment successfully created", "success");
    } catch (err: any) {
       setFormError(err.message);
    } finally {
       setIsSubmitting(false);
    }
  };
  
  const getDeptStyles = (dept: string, isUrgent: boolean) => {
      if (isUrgent) return { bg: "bg-[rgba(186,26,26,0.1)] border-[#BA1A1A]", textMain: "text-[#93000A]", textSub: "text-[#BA1A1A]" };
      switch (dept.toLowerCase()) {
         case "cardiology": return { bg: "bg-[rgba(59,130,246,0.1)] border-[#3B82F6]", textMain: "text-[#1E40AF]", textSub: "text-[#0D1C2E]" };
         case "neurology": return { bg: "bg-[rgba(168,85,247,0.1)] border-[#A855F7]", textMain: "text-[#6B21A8]", textSub: "text-[#0D1C2E]" };
         case "orthopedics": return { bg: "bg-[rgba(16,185,129,0.1)] border-[#10B981]", textMain: "text-[#065F46]", textSub: "text-[#0D1C2E]" };
         default: return { bg: "bg-[rgba(249,115,22,0.1)] border-[#F97316]", textMain: "text-[#9A3412]", textSub: "text-[#0D1C2E]" }; 
      }
  };

  if (!isMounted) return <div className="min-h-screen bg-[#F8F9FF]" />;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8F9FF] select-none font-sans relative">
      
      {/* Toast Notification */}
      {toast.show && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-[4px] shadow-lg transition-all animate-in slide-in-from-top-2 ${toast.type === "success" ? "bg-[#E6F4EA] border border-[#10B981]" : "bg-[#FEF2F2] border border-[#BA1A1A]"}`}>
              {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> : <AlertTriangle className="w-5 h-5 text-[#BA1A1A] border" />}
              <span className={`text-[14px] font-[600] ${toast.type === "success" ? "text-[#047857]" : "text-[#93000A]"}`}>{toast.msg}</span>
          </div>
      )}

      {/* ── Top Navigation Bar Header ── */}
      <header className="w-full h-16 bg-[#F8F9FF] border-b border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
        <div className="relative w-[384px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#727780]" />
          <input
            type="text"
            placeholder="Search analytics, patients, or reports..."
            className="w-full h-[42px] pl-10 pr-4 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[4px] text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#00355F] uppercase hover:bg-[#EFF4FF] transition-colors">Help Center</button>
          <div className="relative flex items-center justify-center w-8 h-[42px] rounded-[12px] cursor-pointer">
            <span className="w-4 h-5 block bg-[#0D1C2E] mask-bell" style={{ WebkitMask: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"></path><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"></path></svg>') no-repeat center/contain" }} />
            <span className="absolute top-2 right-[7px] w-2 h-2 bg-[#BA1A1A] border-2 border-[#F8F9FF] rounded-full" />
          </div>
          <div className="w-px h-8 bg-[#C2C7D1]" />
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-[700] leading-4 text-[#0D1C2E]">Dr. Sarah Chen</span>
              <span className="text-[10px] font-[400] text-[#0D1C2E]">Hospital Admin</span>
            </div>
            <div className="rounded-[12px] bg-[#E6EEFF] border border-[#C2C7D1] flex items-center justify-center text-[#00355F] font-[700] text-sm shrink-0 w-10 h-10">SC</div>
          </div>
        </div>
      </header>

      {/* ── Content Area Wrapper ── */}
      <div className="flex flex-row items-start p-6 gap-6 w-full relative overflow-hidden">
        
        {/* ── Left Sidebar (Stats & Dept Filters) ── */}
        <div className="flex flex-col items-start gap-6 shrink-0 h-[912px] overflow-y-auto no-scrollbar pr-2 pb-20">
          <div className="flex flex-row justify-center items-start p-1 w-[280px] h-[50px] bg-[#EFF4FF] border border-[#C2C7D1] rounded-[8px]">
            <button className="flex flex-col justify-center items-center w-[135px] h-[40px] bg-white shadow-sm rounded-[4px]">
              <span className="font-[700] text-[16px] text-[#00355F]">Week Layout</span>
            </button>
            <button className="flex flex-col justify-center items-center w-[135px] h-[40px] rounded-[4px] hover:bg-[#E6EEFF] transition-colors">
              <span className="font-[400] text-[16px] text-[#42474F] cursor-not-allowed">Month</span>
            </button>
          </div>

          <div className="flex flex-col items-start gap-4 w-[280px]">
            <h3 className="flex flex-row items-center gap-2 w-[280px] h-[24px]">
              <div className="w-[3px] h-[12px] bg-[#BA1A1A]" />
              <span className="font-[400] text-[16px] text-[#BA1A1A]">URGENT ATTENTION</span>
            </h3>
            
            <div className="flex flex-col items-start gap-3 w-[280px]">
              {appointments.filter(a => a.is_urgent).map(a => (
                  <div key={a.id} className="flex flex-col items-start p-4 w-[280px] min-h-[90px] bg-[rgba(255,218,214,0.3)] border-l-[4px] border-[#BA1A1A] rounded-r-[4px]">
                    <div className="flex flex-row justify-between items-start gap-2 w-full">
                      <span className="font-[600] text-[14px] text-[#93000A]">{a.patient_name}</span>
                      <div className="flex flex-col items-start px-1.5 py-0.5 bg-[#BA1A1A] rounded-[2px] mt-1 shrink-0">
                        <span className="font-[700] text-[9px] text-white uppercase">URGENT</span>
                      </div>
                    </div>
                    <span className="font-[400] text-[14px] text-[#42474F] pt-2">{a.date} - {a.time_start}</span>
                  </div>
              ))}
              {appointments.filter(a => a.is_urgent).length === 0 && (
                  <span className="text-sm italic text-[#727780] pl-1">No urgent flags active this week.</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 w-[280px] mt-4">
            <span className="font-[400] text-[16px] text-[#42474F] uppercase tracking-[1px]">DEPARTMENT LEGEND</span>
            <div className="flex flex-col items-start gap-2 w-[280px]">
              {[
                { name: "Cardiology", color: "bg-[#3B82F6]" },
                { name: "Neurology", color: "bg-[#A855F7]" },
                { name: "Orthopedics", color: "bg-[#10B981]" },
                { name: "General Practice", color: "bg-[#F97316]" }
              ].map(d => (
                <div key={d.name} className="flex flex-row items-center p-2 px-3 gap-2 w-full h-[38px] bg-white border border-[#C2C7D1] rounded-[4px]">
                  <div className={`w-3 h-3 ${d.color} rounded-full`} />
                  <span className="font-[400] text-[14px] text-black">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Calendar Main Container ── */}
        <div className="flex flex-col flex-1 w-full h-[869px] bg-white border border-[#C2C7D1] shadow-sm rounded-[8px] overflow-hidden relative isolate">
          
          {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#00355F] animate-spin" />
              </div>
          )}

          {errorMsg && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#FEF2F2] border border-[#BA1A1A] p-4 rounded z-50 flex flex-col items-center">
                  <span className="font-[600] text-[#93000A]">Error fetching schedule</span>
                  <span className="text-sm text-[#42474F]">{errorMsg}</span>
              </div>
          )}

          <div className="flex flex-row justify-between items-center p-4 w-full h-[67px] border-b border-[#C2C7D1] shrink-0 bg-white z-20">
            <div className="flex flex-row items-center gap-4">
              <h4 className="font-[400] text-[20px] leading-[30px] text-[#00355F]">
                {format(weekStart, "MMMM d")} – {format(weekEnd, "d, yyyy")}
              </h4>
              <div className="flex flex-row items-start gap-1">
                <button 
                  onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                  className="flex flex-col justify-center items-center w-[26px] h-[26px] hover:bg-[#F8F9FF] rounded-[4px] border border-transparent hover:border-[#C2C7D1]">
                  <ChevronLeft className="w-4 h-4 text-black" />
                </button>
                <button 
                  onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                  className="flex flex-col justify-center items-center w-[26px] h-[26px] hover:bg-[#F8F9FF] rounded-[4px] border border-transparent hover:border-[#C2C7D1]">
                  <ChevronRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center gap-2">
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="flex flex-col justify-center items-center px-3 py-1.5 h-[34px] border border-[#0F4C81] rounded-[4px] text-[#0F4C81] font-[600] text-[14px] hover:bg-[#EFF4FF]">
                Today
              </button>
            </div>
          </div>

          <div className="flex flex-col w-full h-[800px] overflow-y-auto no-scrollbar relative isolate flex-1 bg-white">
            <div className="flex flex-row items-start w-full h-[81px] bg-[#EFF4FF] border-b border-[#C2C7D1] sticky top-0 z-10 shrink-0">
              <div className="w-[calc(100%/8)] h-[80px] border-r border-[#C2C7D1] shrink-0 bg-white" />
              
              {weekDays.map((date, idx) => {
                const todayCurrent = isSameDay(date, new Date());
                return (
                  <div key={idx} className={`flex flex-col justify-center items-center w-[calc(100%/8)] h-[80px] border-r border-[#C2C7D1] ${todayCurrent ? 'bg-[rgba(15,76,129,0.05)]' : ''}`}>
                    <span className={`leading-6 ${todayCurrent ? 'font-[700] text-[#00355F]' : 'font-[400] text-[#42474F]'} text-[16px]`}>{format(date, "EEE")}</span>
                    <span className={`font-[400] text-[16px] text-[#00355F]`}>{format(date, "d")}</span>
                  </div>
                );
              })}
            </div>

            <div className="w-full h-[720px] bg-white relative">
              <div className="absolute left-0 top-0 w-[calc(100%/8)] h-[720px] flex flex-col">
                {[ "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM" ].map((time, idx) => (
                  <div key={idx} className="flex flex-col items-end pt-2 pr-2 w-full h-[80px] border-b border-[#E2E8F0]">
                    <span className="font-[600] text-[12px] text-[#42474F] tracking-[0.6px]">{time}</span>
                  </div>
                ))}
              </div>

              <div className="absolute left-[calc(100%/8)] right-0 top-0 h-[720px] flex flex-row border-l border-[#E2E8F0] pointer-events-none">
                 {weekDays.map((date, idx) => (
                     <div key={idx} className={`w-[calc(100%/7)] h-full border-r border-[#E2E8F0] ${isSameDay(date, new Date()) ? 'bg-[rgba(15,76,129,0.02)]' : idx >= 5 ? 'bg-[#EFF4FF]' : ''}`} />
                 ))}
                 
                 <div className="absolute inset-0 pointer-events-none flex flex-col">
                   {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-full h-[80px] border-b border-[#E2E8F0] opacity-50" />
                   ))}
                 </div>
              </div>

              {appointments.map((app) => {
                  const dayIdx = weekDays.findIndex(d => format(d, "yyyy-MM-dd") === (app.date?.split("T")[0] || app.date)); // Fallback sanity mapping
                  if (dayIdx === -1) return null; 
                  
                  const topY = parseTimeToPixels(app.time_start);
                  const endY = parseTimeToPixels(app.time_end);
                  const hY = Math.max(endY - topY, 20);
                  const styleRef = getDeptStyles(app.department, app.is_urgent);

                  return (
                    <div
                      key={app.id || Math.random().toString()}
                      title={`Time: ${app.time_start} - ${app.time_end}`}
                      className={`absolute rounded-r-[2px] p-2 flex flex-col gap-0.5 cursor-pointer hover:opacity-80 shadow-sm border-l-[4px] overflow-hidden ${styleRef.bg}`}
                      style={{ 
                          left: `calc(100% * ${(dayIdx + 1)} / 8 + 4px)`, 
                          top: `${topY}px`, 
                          height: `${hY}px`, 
                          width: `calc(100% / 8 - 8px)`
                      }}
                    >
                        <span className={`font-[700] text-[10px] leading-[14px] uppercase truncate ${styleRef.textMain}`}>{app.department}</span>
                        <span className={`font-[700] text-[11px] leading-[15px] truncate ${styleRef.textSub}`}>{app.patient_name}</span>
                        <span className={`font-[400] text-[9px] leading-[13px] opacity-80 ${styleRef.textSub}`}>
                            {app.time_start} - {app.time_end}
                        </span>
                    </div>
                  );
              })}
            </div>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="absolute right-8 bottom-8 w-[64px] h-[64px] bg-[#BA1A1A] shadow-[0px_10px_25px_rgba(186,26,26,0.3)] rounded-[12px] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-30"
          >
            <Plus className="w-[30px] h-[30px] text-white" />
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-[#0D1C2E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col shrink-0">
            <div className="flex flex-row justify-between items-center px-6 py-4 bg-[#EFF4FF] border-b border-[#C2C7D1]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#00355F]" />
                <h3 className="text-[18px] font-[700] text-[#00355F]">New Appointment Schedule</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#727780] hover:text-[#0D1C2E] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAppointment} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#BA1A1A]/20 text-[#991B1B] text-[13px] rounded-[4px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /><span>{formError}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-[700] text-[#42474F] uppercase">Patient Name *</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Jane Doe" className="px-4 py-2 border rounded-[4px]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-[700] text-[#42474F] uppercase">Department</label>
                <select value={formDept} onChange={(e) => setFormDept(e.target.value)} className="px-4 py-2 border rounded-[4px] bg-white">
                    <option>General Practice</option><option>Cardiology</option><option>Neurology</option><option>Orthopedics</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-[700] text-[#42474F] uppercase">Date</label>
                    <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="px-4 py-2 border rounded-[4px]" />
                 </div>
                 <div className="flex flex-col gap-1 justify-center relative top-2">
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                      <input type="checkbox" checked={formUrgent} onChange={(e) => setFormUrgent(e.target.checked)} className="w-4 h-4" />
                      <span className="text-[14px] text-[#BA1A1A] font-[600]">Mark Urgent</span>
                    </label>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-[700] text-[#42474F] uppercase">Available Start Time</label>
                    <select required value={formTimeStart} onChange={(e) => setFormTimeStart(e.target.value)} className="px-4 py-2 border rounded-[4px] bg-white">
                       {availableStartSlots.length === 0 ? <option value="" disabled>No slots available today</option> : null}
                       {availableStartSlots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-[700] text-[#42474F] uppercase">End Time (1hr Max)</label>
                    <select required value={formTimeEnd} onChange={(e) => setFormTimeEnd(e.target.value)} className="px-4 py-2 border rounded-[4px] bg-white">
                        {formTimeStart ? (() => {
                             const idx = ALL_TIME_SLOTS.indexOf(formTimeStart);
                             const endSlots = ALL_TIME_SLOTS.slice(idx + 1, idx + 3).filter(slot => availableStartSlots.includes(slot) || slot === "17:00" ); // next multiple of 30 min blocks safely computed via filtering out overlap collisions natively in start logic, mostly
                             return endSlots.map(s => <option key={s} value={s}>{s}</option>);
                        })() : <option value="">-</option>}
                    </select>
                 </div>
              </div>
              <div className="flex flex-row justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-[4px] font-[600] text-[#42474F] hover:bg-[#F8F9FF] border">Cancel</button>
                <button type="submit" disabled={isSubmitting || availableStartSlots.length === 0} className="px-5 py-2 bg-[#00355F] text-white rounded-[4px] font-[600] disabled:opacity-50 flex items-center justify-center flex-row gap-2">
                   {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving</> : "Save Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
