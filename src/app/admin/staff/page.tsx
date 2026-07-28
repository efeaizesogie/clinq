"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Loader2,
  Check,
  ChevronDown,
  Download,
  X,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  Sparkles,
  Award,
  Clock,
  Briefcase,
  ArrowUpDown
} from "lucide-react";
import type { Specialist, DepartmentPerformance } from "@/lib/types";

// Helper function to render status indicator badges
function getStatusDotColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-[#22C55E]"; // Green
    case "Off Duty":
      return "bg-[#94A3B8]"; // Slate/Grey
    case "Emergency Leave":
      return "bg-[#EF4444]"; // Red
    default:
      return "bg-[#94A3B8]";
  }
}

// Helpers for Department Performance table badges
function getPerformanceBadgeStyle(status: string) {
  if (status.toUpperCase() === "OPTIMAL") {
    return { bg: "bg-[#DCFCE7]", text: "text-[#15803D]", font: "font-[700]" };
  }
  return { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]", font: "font-[700]" };
}

export default function StaffDirectoryPage() {
  const router = useRouter();
  // --- Dashboard Data states ---
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [performance, setPerformance] = useState<DepartmentPerformance[]>([]);
  const [kpis, setKpis] = useState({
    totalActiveStaff: 1280,
    currentlyOnDuty: 342,
    staffRetention: 94.2,
    openPositions: 12
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // --- Filter states ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specializations");
  const [selectedTag, setSelectedTag] = useState("Seniority Level");
  const [selectedAvailability, setSelectedAvailability] = useState("Availability");
  const [sortByPerformance, setSortByPerformance] = useState(false);

  // --- Dropdown visibility states ---
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);

  // --- Add Staff Modal states ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSpecialty, setFormSpecialty] = useState("MD, FACC • Cardiology");
  const [formTag, setFormTag] = useState("CONSULTANT");
  const [formStatus, setFormStatus] = useState("Active");
  const [formExperience, setFormExperience] = useState("10+ Years");
  const [formRating, setFormRating] = useState("4.8");
  const [formRetentionRate, setFormRetentionRate] = useState("95.0");
  const [formShift, setFormShift] = useState("08:00 - 20:00 (Floor 4)");
  const [formBio, setFormBio] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Dropdown lists
  const specializationOptions = [
    "All Specializations",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Oncology",
    "Orthopedics"
  ];

  const tagOptions = [
    "Seniority Level",
    "CLINICAL FACULTY",
    "RESIDENT",
    "FELLOW",
    "CONSULTANT"
  ];

  const availabilityOptions = [
    "Availability",
    "Active",
    "Off Duty",
    "Emergency Leave"
  ];

  // Fetch Data from `/api/admin/staff`
  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedSpecialty !== "All Specializations") params.append("department", selectedSpecialty);
      if (selectedTag !== "Seniority Level") params.append("tag", selectedTag);
      if (selectedAvailability !== "Availability") params.append("availability", selectedAvailability);
      if (sortByPerformance) params.append("sort", "performance");

      const response = await fetch(`/api/admin/staff?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load staff details");
      const data = await response.json();

      setSpecialists(data.specialists || []);
      setKpis(data.kpis || {
        totalActiveStaff: 1280,
        currentlyOnDuty: 342,
        staffRetention: 94.2,
        openPositions: 12
      });
      setPerformance(data.departmentPerformance || []);
    } catch (error) {
      console.error("Error loading staff directory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [searchQuery, selectedSpecialty, selectedTag, selectedAvailability, sortByPerformance]);

  // Click outside listener for dropdowns
  const specialtyRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
        setShowSpecialtyDropdown(false);
      }
      if (tagRef.current && !tagRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
      if (availabilityRef.current && !availabilityRef.current.contains(event.target as Node)) {
        setShowAvailabilityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Submit Handler for Add New Staff Detail
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSpecialty) {
      setFormError("Full Name and Specialty qualification are required.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formName,
          specialty: formSpecialty,
          tag: formTag,
          status: formStatus,
          experience: formExperience,
          bio: formBio || `${formTag} specialist on duty.`,
          rating: parseFloat(formRating) || 5.0,
          retention_rate: parseFloat(formRetentionRate) || 95.0,
          shift: formShift
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Cannot create staff entry.");
      }

      await fetchStaffData();
      setShowAddModal(false);
      // Reset Modal Fields
      setFormName("");
      setFormBio("");
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sparkline Trends rendering helper
  const defaultSparkline = [
    { h: "h-[8px]", bg: "bg-[#00355F]/10" },
    { h: "h-[16px]", bg: "bg-[#00355F]/20" },
    { h: "h-[12px]", bg: "bg-[#00355F]/30" },
    { h: "h-[20px]", bg: "bg-[#00355F]/50" },
    { h: "h-[#4px]", bg: "bg-[#00355F]/20" },
    { h: "h-[24px]", bg: "bg-[#00355F]/80" },
    { h: "h-[16px]", bg: "bg-[#00355F]" }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8F9FF] select-none overflow-y-auto">
      {/* ── Header ── */}
      <header className="w-full h-16 bg-[#F8F9FF] border-b border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
        <div className="relative w-[384px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#727780]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medical specialists, departments, or shifts..."
            className="w-full h-[42px] pl-10 pr-4 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[4px] text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#00355F] uppercase hover:bg-[#EFF4FF] transition-colors">
            Help Center
          </button>
          
          <div className="relative flex items-center justify-center w-8 h-[42px] rounded-[12px] cursor-pointer">
            <span className="w-4 h-5 block bg-[#0D1C2E] mask-bell" style={{ WebkitMask: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"></path><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"></path></svg>') no-repeat center/contain" }} />
            <span className="absolute top-2 right-[7px] w-2 h-2 bg-[#BA1A1A] border-2 border-[#F8F9FF] rounded-full" />
          </div>

          <div className="flex items-center justify-center w-9 h-[42px] rounded-[12px] cursor-pointer">
            <span className="w-5 h-5 block bg-[#0D1C2E] mask-cog" style={{ WebkitMask: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>') no-repeat center/contain" }} />
          </div>

          <div className="w-px h-8 bg-[#C2C7D1]" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-[700] leading-4 tracking-[0.6px] text-[#0D1C2E]">
                Dr. Sarah Chen
              </span>
              <span className="text-[10px] font-[400] leading-[15px] tracking-[0.5px] uppercase text-[#0D1C2E]">
                Hospital Admin
              </span>
            </div>
            <div className="w-10 h-10 rounded-[12px] bg-[#E6EEFF] border border-[#C2C7D1] flex items-center justify-center text-[#00355F] font-[700] text-sm shrink-0">
              SC
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CANVAS ── */}
      <main className="flex flex-col items-start gap-10 p-6 self-stretch w-full flex-1">
        
        {/* Title and Top Level Actions */}
        <div className="flex flex-row justify-between items-end w-full">
          <div className="flex flex-col gap-1 max-w-[650px]">
            <h2 className="text-[24px] font-[600] leading-6 text-[#00355F]">
              Medical Specialists
            </h2>
            <p className="text-[16px] font-[400] leading-6 text-[#42474F]">
              Manage Clinq’s clinical teams, monitor department-level performance metrics, and add new specialists to the ecosystem.
            </p>
          </div>

          <div className="flex flex-row items-center gap-3">
            <button className="flex flex-row items-center justify-center px-5 py-2.5 gap-2 bg-white border border-[#00355F] rounded-[4px] text-[#00355F] font-[600] text-[16px] uppercase tracking-[0.4px] hover:bg-[#EEF4FF] transition-all h-[48px]">
              <Download className="w-4 h-4 text-[#00355F]" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-row items-center justify-center px-6 py-2.5 gap-2 bg-[#00355F] shadow-sm rounded-[4px] text-white font-[600] text-[16px] uppercase tracking-[0.4px] hover:bg-[#002747] transition-all h-[48px]"
            >
              <Plus className="w-5 h-4 text-white" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>

        {/* ── METRICS BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
          {/* Card 1: Total Active Staff */}
          <div className="flex flex-col justify-between p-6 bg-white border border-[#C2C7D1] rounded-[8px] h-[142px]">
            <span className="text-[12px] font-[700] tracking-[1.2px] uppercase text-[#42474F] font-sans">
              Total Active Staff
            </span>
            <div className="flex flex-row justify-between items-end w-full">
              <span className="text-[32px] font-[700] leading-10 text-[#0D1C2E]">
                {kpis.totalActiveStaff.toLocaleString()}
              </span>
              <span className="text-[12px] font-[700] text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-[4px]">
                Active
              </span>
            </div>
          </div>

          {/* Card 2: Currently on Duty */}
          <div className="flex flex-col justify-between p-6 bg-white border border-[#C2C7D1] rounded-[8px] h-[142px]">
            <span className="text-[12px] font-[700] tracking-[1.2px] uppercase text-[#42474F]">
              Currently On Duty
            </span>
            <div className="flex flex-row justify-between items-end w-full">
              <span className="text-[32px] font-[700] leading-10 text-[#0D1C2E]">
                {kpis.currentlyOnDuty}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-[700] text-[#056041]">
                <span>+34</span>
                <span className="text-[#6B7280] font-[400] text-[10px]">Today</span>
              </div>
            </div>
          </div>

          {/* Card 3: Staff Retention */}
          <div className="flex flex-col justify-between p-6 bg-white border border-[#C2C7D1] rounded-[8px] h-[142px]">
            <span className="text-[12px] font-[700] tracking-[1.2px] uppercase text-[#42474F]">
              Staff Retention
            </span>
            <div className="flex flex-row justify-between items-end w-full">
              <span className="text-[32px] font-[700] leading-10 text-[#0D1C2E]">
                {kpis.staffRetention}%
              </span>
              <span className="text-[12px] font-[400] text-[#42474F] font-sans">
                Annual Avg
              </span>
            </div>
          </div>

          {/* Card 4: Open Positions */}
          <div className="flex flex-col justify-between p-6 bg-[#00355F] rounded-[8px] h-[142px] text-white">
            <span className="text-[12px] font-[700] tracking-[1.2px] uppercase text-[#8EBDF9]">
              Open Positions
            </span>
            <div className="flex flex-row justify-between items-end w-full">
              <span className="text-[32px] font-[700] leading-10">
                {kpis.openPositions}
              </span>
              <span className="text-[12px] font-[400] text-[#8EBDF9]">
                6 departments
              </span>
            </div>
          </div>
        </div>

        {/* ── FILTER & SORT CONTROLS BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full bg-white border border-[#C2C7D1] rounded-[8px] p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter symbol indicator */}
            <div className="flex items-center gap-2 text-[#00355F] font-[600]">
              <span className="w-4 h-4 block bg-[#00355F] mask-filter" style={{ WebkitMask: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"></polygon></svg>') no-repeat center/contain" }} />
              <span className="text-[14px]">Filter By</span>
            </div>

            {/* Specialty Dropdown */}
            <div className="relative" ref={specialtyRef}>
              <button
                onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[13px] text-[#0D1C2E] hover:bg-[#F8F9FF] font-[500]"
              >
                <span>{selectedSpecialty}</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showSpecialtyDropdown && (
                <div className="absolute left-0 mt-1 w-[200px] bg-white border border-[#C2C7D1] rounded-[4px] shadow-lg z-30 py-1">
                  {specializationOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedSpecialty(opt);
                        setShowSpecialtyDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#EFF4FF] text-[#0D1C2E] flex justify-between items-center"
                    >
                      <span>{opt}</span>
                      {selectedSpecialty === opt && <Check className="w-3.5 h-3.5 text-[#00355F]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Seniority / Tag Dropdown */}
            <div className="relative" ref={tagRef}>
              <button
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[13px] text-[#0D1C2E] hover:bg-[#F8F9FF] font-[500]"
              >
                <span>{selectedTag === "Seniority Level" ? "Seniority Level" : selectedTag}</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showTagDropdown && (
                <div className="absolute left-0 mt-1 w-[200px] bg-white border border-[#C2C7D1] rounded-[4px] shadow-lg z-30 py-1">
                  {tagOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedTag(opt);
                        setShowTagDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#EFF4FF] text-[#0D1C2E] flex justify-between items-center"
                    >
                      <span>{opt}</span>
                      {selectedTag === opt && <Check className="w-3.5 h-3.5 text-[#00355F]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Availability / Status Dropdown */}
            <div className="relative" ref={availabilityRef}>
              <button
                onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[13px] text-[#0D1C2E] hover:bg-[#F8F9FF] font-[500]"
              >
                <span>{selectedAvailability}</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showAvailabilityDropdown && (
                <div className="absolute left-0 mt-1 w-[200px] bg-white border border-[#C2C7D1] rounded-[4px] shadow-lg z-30 py-1">
                  {availabilityOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedAvailability(opt);
                        setShowAvailabilityDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#EFF4FF] text-[#0D1C2E] flex justify-between items-center"
                    >
                      <span>{opt === "Availability" ? "All Availability" : opt}</span>
                      {selectedAvailability === opt && <Check className="w-3.5 h-3.5 text-[#00355F]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setSortByPerformance(!sortByPerformance)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-[13px] font-[600] border transition-all ${
              sortByPerformance
                ? "bg-[#D4E6E5] text-[#576867] border-transparent"
                : "bg-white text-[#00355F] border-[#00355F]/80 hover:bg-[#F8F9FF]"
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort by Performance</span>
          </button>
        </div>

        {/* ── CARD GRID SHOWN DYNAMICALLY ── */}
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#00355F] mb-3" />
            <span className="text-[15px] text-[#42474F]">Loading specialists data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {specialists.map((spec) => (
              <div
                key={spec.id}
                className="bg-white border border-[#C2C7D1] rounded-[8px] p-6 flex flex-col justify-between h-[392px] shadow-sm hover:shadow-md hover:scale-[1.01] transition-all relative overflow-hidden"
              >
                
                {/* Header of card (Avatar & Tag) */}
                <div className="flex flex-row justify-between items-start mt-2">
                  {spec.image_url ? (
                    <img
                      src={spec.image_url}
                      alt={spec.full_name}
                      className="w-14 h-14 rounded-[12px] object-cover shadow-sm"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-[12px] bg-gradient-to-br flex items-center justify-center text-white text-[20px] font-[700] shadow-sm`}>
                      {spec.initials || "MD"}
                    </div>
                  )}
                  
                  {/* Category Status tag */}
                  <span className="px-2.5 py-1 bg-[#D4E6E5] text-[#576867] text-[10px] font-[800] rounded-[12px] tracking-[0.5px] uppercase">
                    {spec.tag || "CONSULTANT"}
                  </span>
                </div>

                {/* Body Details */}
                <div className="flex flex-col gap-1 mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] font-[700] text-[#00355F] font-sans">
                      {spec.full_name}
                    </h3>
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(spec.status || "Active")}`} title={spec.status} />
                  </div>
                  
                  <p className="text-[13px] font-[500] text-[#727780] font-sans">
                    {spec.specialty}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2.5 text-[12px] text-[#42474F]">
                    <Clock className="w-3.5 h-3.5 text-[#00355F]" />
                    <span className="font-[500]">
                      {spec.status === "Active" ? `Shift: ${spec.shift}` : spec.status === "Emergency Leave" ? "On Emergency Leave" : `Next Shift: ${spec.shift}`}
                    </span>
                  </div>
                </div>

                {/* Progress bar / Retention Sparkline */}
                <div className="flex flex-col gap-1 mt-3.5">
                  <div className="flex justify-between items-center text-[11px] text-[#42474F] font-[600]">
                    <span>Performance Rating</span>
                    <span>{spec.rating ? (spec.rating / 5.0 * 100).toFixed(0) : "95"}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EFF4FF] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${spec.status === "Active" ? 'from-[#00355F] to-[#8EBDF9]' : spec.status === "Emergency Leave" ? 'from-[#EF4444] to-[#8EBDF9]' : 'from-[#94A3B8] to-[#8EBDF9]'}`}
                      style={{ width: `${spec.rating ? (spec.rating / 5.0 * 100) : 95}%` }}
                    />
                  </div>
                </div>

                {/* Footer ratings boxes */}
                <div className="grid grid-cols-2 gap-3 border-t border-[#EFF4FF] pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-[700] tracking-[0.5px] text-[#727780]">Retention</span>
                    <span className="text-[15px] font-[700] text-[#0D1C2E]">{spec.retention_rate || 95}%</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-[700] tracking-[0.5px] text-[#727780]">Rating</span>
                    <span className="text-[15px] font-[700] text-[#0D1C2E]">{spec.rating?.toFixed(1) || "5.0"}/5.0</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => router.push(`/admin/staff/${spec.id}`)}
                  className="w-full py-2 bg-[#EFF4FF] text-[#00355F] font-[600] text-[12px] uppercase rounded-[4px] mt-4 hover:bg-[#D2E4FF] transition-all text-center tracking-[0.5px]"
                >
                  View Full Clinical Profile
                </button>
              </div>
            ))}

            {/* Dotted Box: Add New Member Button Card */}
            <div
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-[#C2C7D1] hover:border-[#00355F] rounded-[8px] p-6 flex flex-col items-center justify-center h-[392px] cursor-pointer hover:bg-[#EEF4FF]/30 transition-all select-none group"
            >
              <div className="w-14 h-14 rounded-full bg-[#EFF4FF] group-hover:bg-[#D2E4FF] transition-all flex items-center justify-center text-[#00355F] mb-4">
                <Plus className="w-7 h-7" />
              </div>
              <h4 className="text-[16px] font-[700] text-[#00355F]">Add New Team Member</h4>
              <p className="text-[13px] text-[#727780] text-center max-w-[200px] mt-1">
                Insert a medical specialist credential to register them within active registry.
              </p>
            </div>
          </div>
        )}

        {/* ── DEPARTMENT PERFORMANCE METRICS TABLE ── */}
        <div className="flex flex-col gap-4 w-full bg-white border border-[#C2C7D1] rounded-[8px] overflow-hidden mt-6">
          <div className="p-6 border-b border-[#C2C7D1] bg-[#EFF4FF]">
            <h3 className="text-[18px] font-[600] text-[#00355F]">
              Department Performance Metrics
            </h3>
            <p className="text-[13px] text-[#42474F] mt-1">
              Cross-reference active staff count alongside weekly patient throughput and scheduling workloads down to efficiency indices.
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#F8F9FF] border-b border-[#C2C7D1] h-[50px]">
                  <th className="py-2.5 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">Department</th>
                  <th className="py-2.5 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">Location</th>
                  <th className="py-2.5 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">Head of Dept.</th>
                  <th className="py-2.5 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">Staff Count</th>
                  <th className="py-2.5 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">Patient Throughput</th>
                  <th className="py-2.5 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">Efficiency Index</th>
                  <th className="py-2.5 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F] text-right">Status</th>
                </tr>
              </thead>

              <tbody>
                {performance.map((dept) => {
                  const badgeStyle = getPerformanceBadgeStyle(dept.status);
                  return (
                    <tr key={dept.id} className="border-t border-[#C2C7D1] hover:bg-[#F8F9FF] transition-all h-[76px]">
                      <td className="px-6 py-4 font-[700] text-[14px] text-[#00355F]">{dept.name}</td>
                      <td className="px-6 py-4 text-[13px] text-[#42474F]">{dept.location}</td>
                      <td className="px-6 py-4 text-[13px] text-[#0D1C2E] font-[500]">{dept.head_of_dept}</td>
                      <td className="px-6 py-4 text-[13px] text-[#0D1C2E]">{dept.staff_count} Specialists</td>
                      <td className="px-6 py-4 text-[13px] text-[#0D1C2E]">{dept.throughput}</td>
                      
                      {/* Efficiency progress bar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 w-[150px]">
                          <div className="flex-1 h-2 bg-[#EFF4FF] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#00355F] rounded-full"
                              style={{ width: `${dept.efficiency}%` }}
                            />
                          </div>
                          <span className="text-[12px] font-[700] text-[#0D1C2E] shrink-0">{dept.efficiency}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-[12px] text-[10px] tracking-[0.5px] uppercase ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.font}`}>
                          {dept.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── ADD NEW STAFF POPUP MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0D1C2E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-2xl w-full max-w-[520px] overflow-hidden flex flex-col transform transition-transform duration-300">
            {/* Modal Header */}
            <div className="flex flex-row justify-between items-center px-6 py-4 bg-[#EFF4FF] border-b border-[#C2C7D1]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00355F]" />
                <h3 className="text-[18px] font-[700] text-[#00355F]">Add New Staff Specialist</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#727780] hover:text-[#0D1C2E] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStaffSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#BA1A1A]/20 text-[#991B1B] text-[13px] rounded-[4px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#991B1B]" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Dr. Julia Vance"
                  className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] placeholder-[#727780] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
                />
              </div>

              {/* Specialty */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Specialty details *</label>
                <input
                  type="text"
                  required
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="MD, FACC • Cardiology"
                  className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
                />
              </div>

              {/* Experience and Shift Info row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Seniority Tag</label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="px-4 py-2 border border-[#C2C7D1] bg-white rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  >
                    <option value="CLINICAL FACULTY">Clinical Faculty</option>
                    <option value="RESIDENT">Resident</option>
                    <option value="FELLOW">Fellow</option>
                    <option value="CONSULTANT">Consultant</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="px-4 py-2 border border-[#C2C7D1] bg-white rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Experience</label>
                  <input
                    type="text"
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    placeholder="10+ Years"
                    className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Shift/Wing Details</label>
                  <input
                    type="text"
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    placeholder="08:00 - 20:00 (Floor 4)"
                    className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Retention Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formRetentionRate}
                    onChange={(e) => setFormRetentionRate(e.target.value)}
                    placeholder="98.2"
                    className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Initial Rating (out of 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    placeholder="4.9"
                    className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio summary */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Short Biography</label>
                <textarea
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Specializing in cardiovascular care, heart failure management, and clinical cardiology therapeutics..."
                  rows={3}
                  className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] placeholder-[#727780] focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-[#C2C7D1] text-[#42474F] font-[600] text-[14px] rounded-[4px] uppercase hover:bg-[#F8F9FF] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#00355F] text-white font-[600] text-[14px] rounded-[4px] uppercase hover:bg-[#002747] transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Add Member</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
