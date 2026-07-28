"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ChevronDown,
  Download,
  X,
  Loader2,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";
import type { PatientRecord } from "@/app/api/admin/patients/route";

// Badges styles based on admission/health status
function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "Active":
      return { bg: "bg-[#ECFDF5]", text: "text-[#065F46]", font: "font-[700]" };
    case "Archived":
      return { bg: "bg-[#F1F5F9]", text: "text-[#475569]", font: "font-[700]" };
    case "Observation":
      return { bg: "bg-[#FFF7ED]", text: "text-[#9A3412]", font: "font-[700]" };
    case "ER/Critical":
      return { bg: "bg-[#FEF2F2]", text: "text-[#991B1B]", font: "font-[700]" };
    default:
      return { bg: "bg-[#EFF4FF]", text: "text-[#00355F]", font: "font-[700]" };
  }
}

export default function PatientManagementPage() {
  // --- States ---
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Show exact 5 rows to fit 721px height layout

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedInsurance, setSelectedInsurance] = useState("All");

  // UI Interaction States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // New Patient Form States
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("M");
  const [formDept, setFormDept] = useState("Cardiology");
  const [formDoctor, setFormDoctor] = useState("");
  const [formAdmissionStatus, setFormAdmissionStatus] = useState("Observation");
  const [formInsurance, setFormInsurance] = useState("BlueShield");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const departmentsList = [
    "All Departments",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Emergency",
  ];

  const insuranceProviders = ["All", "BlueShield", "Aetna", "Medicare", "United"];

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Patients
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      
      // If single status is selected through checkboxes (for routing compatibility)
      if (selectedStatuses.length === 1) {
        params.append("admission_status", selectedStatuses[0]);
      }
      
      if (selectedDept !== "All Departments") {
        params.append("department", selectedDept);
      }

      const res = await fetch(`/api/admin/patients?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();

      // Client side filter for Multiple Admission Statuses, Insurance Providers
      let filtered = data.patients || [];
      
      if (selectedStatuses.length > 1) {
        filtered = filtered.filter((p: PatientRecord) => 
          selectedStatuses.includes(p.admission_status)
        );
      }

      if (selectedInsurance !== "All") {
        filtered = filtered.filter((p: PatientRecord) => 
          p.insurance.toLowerCase() === selectedInsurance.toLowerCase()
        );
      }

      setPatients(filtered);
      setTotal(selectedStatuses.length > 1 || selectedInsurance !== "All" ? filtered.length : (data.total || 0));
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, search, selectedStatuses, selectedDept, selectedInsurance]);

  // Handle Admission Status Checkbox Change
  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
    setPage(1);
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedDept("All Departments");
    setSelectedInsurance("All");
    setSearch("");
    setPage(1);
  };

  // Handle Submit Form
  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      setFormError("Full Name and Email are required fields.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formName,
          email: formEmail,
          age: parseInt(formAge) || 30,
          gender: formGender,
          department: formDept,
          assigned_doctor: formDoctor || "Dr. Staff Member",
          admission_status: formAdmissionStatus,
          insurance: formInsurance,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create patient");
      }

      // Refresh patients list, reset form state
      await fetchPatients();
      setShowAddModal(false);
      setFormName("");
      setFormEmail("");
      setFormAge("");
      setFormDoctor("");
    } catch (e: any) {
      setFormError(e.message || "An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status Patch handler
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Refresh local view
      setPatients(patients.map(p => p.id === id ? { ...p, status: newStatus } : p));
      setActiveActionMenuId(null);
    } catch (error) {
      console.error("Error updating patient status:", error);
    }
  };

  // Calculated Stats
  const inpatientCount = patients.filter(p => p.admission_status === "Inpatient").length || 1;
  const criticalCount = patients.filter(p => p.status === "ER/Critical").length || 1;

  // Pagination Values
  const totalPages = Math.ceil(total / limit) || 1;
  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  // Sparkline data bars (representing hospital trends over the last 7 days)
  const sparklineBars = [
    { height: "h-[32px]", bg: "bg-[#E6EEFF]" },
    { height: "h-[48px]", bg: "bg-[#DCE9FF]" },
    { height: "h-[40px]", bg: "bg-[rgba(0,53,95,0.4)]" },
    { height: "h-[56px]", bg: "bg-[rgba(0,53,95,0.6)]" },
    { height: "h-[36px]", bg: "bg-[rgba(0,53,95,0.2)]" },
    { height: "h-[64px]", bg: "bg-[rgba(0,53,95,0.8)]" },
    { height: "h-[48px]", bg: "bg-[#00355F]" },
  ];

  return (
    <div className="flex flex-col w-full h-[1140px] bg-[#F8F9FF] select-none relative overflow-y-auto">
      {/* ── Top Header Area Search Integration ── */}
      <header className="w-full h-16 bg-[#F8F9FF] border-b border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
        <div className="relative w-[384px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#727780]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search analytics, patients, or reports..."
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
            <div className="w-40px h-40px rounded-[12px] bg-[#E6EEFF] border border-[#C2C7D1] flex items-center justify-center text-[#00355F] font-[700] text-sm shrink-0 w-10 h-10">
              SC
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Canvas ── */}
      <main className="flex flex-col items-start gap-10 p-6 self-stretch w-full flex-1">
        {/* Page Header Area */}
        <div className="flex flex-row justify-between items-end w-full h-[76px] shrink-0">
          <div className="flex flex-col gap-1 w-[568px]">
            <h2 className="text-[24px] font-[600] leading-6 text-[#00355F] font-sans">
              Patient Directory
            </h2>
            <p className="text-[16px] font-[400] leading-6 text-[#42474F] font-sans max-w-[568px]">
              Access and manage comprehensive patient records. Monitor real-time status and coordinate care across departments with institutional precision.
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 h-[70px]">
            {/* Export List Button */}
            <button className="flex flex-row items-center justify-center px-5 py-2.5 gap-2 bg-white border border-[#00355F] rounded-[4px] text-[#00355F] font-[600] text-[16px] uppercase tracking-[0.4px] hover:bg-[#EEF4FF] transition-all h-[48px]">
              <span className="w-4 h-4 block bg-[#00355F] mask-download" style={{ WebkitMask: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"7 10 12 15 17 10\"></polyline><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"></line></svg>') no-repeat center/contain" }} />
              <span>Export</span>
            </button>

            {/* Add New Patient Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-row items-center justify-center px-6 py-2.5 gap-2 bg-[#00355F] shadow-sm rounded-[4px] text-white font-[600] text-[16px] uppercase tracking-[0.4px] hover:bg-[#002747] transition-all h-[48px]"
            >
              <Plus className="w-5.5 h-4 text-white shrink-0" />
              <span>Add New Patient</span>
            </button>
          </div>
        </div>

        {/* Content Container (Asymmetric Layout Grid) */}
        <div className="relative flex gap-6 md:flex-row  w-full h-[936px] min-h-[600px]">
          {/* Asymmetrical Column 1: Filters Sidebar (288px) */}
          <aside className=" flex-2 left-0 top-0 bottom-[304px] flex flex-col gap-6">
            
            {/* Background + Border Filters Box */}
            <div className="flex flex-col items-start p-6 gap-6 bg-white border border-[#C2C7D1] rounded-[8px] h-[524px] self-stretch">
              
              {/* Filter Header */}
              <div className="flex flex-row justify-between items-center w-full h-[24px]">
                <h3 className="text-[18px] font-[400] leading-6 text-[#00355F]">
                  Filters
                </h3>
                <button
                  onClick={handleClearFilters}
                  className="text-[16px] font-[400] leading-6 text-[#00355f] hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Filter Sections container */}
              <div className="flex flex-col gap-8 w-full">
                
                {/* 1. Admission Status Checkboxes */}
                <div className="flex flex-col gap-4 w-full">
                  <span className="text-[16px] font-[400] tracking-[1.6px] uppercase text-[#42474F] leading-6 font-sans">
                    Admission Status
                  </span>
                  <div className="flex flex-col gap-3 w-full">
                    {["Inpatient", "Outpatient", "Observation", "Emergency"].map((status) => {
                      const isChecked = selectedStatuses.includes(status);
                      return (
                        <label
                          key={status}
                          onClick={() => handleStatusToggle(status)}
                          className="flex flex-row items-center gap-3 w-full h-[20px] cursor-pointer"
                        >
                          <div className="w-4 h-4 flex items-center justify-center border border-[#C2C7D1] rounded-[2px] bg-white text-[#00355F] transition-all">
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                          <span className={`text-[14px] leading-5 font-sans ${isChecked ? "font-[700] text-[#00355F]" : "font-[400] text-[#0D1C2E]"}`}>
                            {status}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Department Select Dropdown */}
                <div className="flex flex-col gap-4 w-full relative">
                  <span className="text-[16px] font-[400] tracking-[1.6px] uppercase text-[#42474F] leading-6">
                    Department
                  </span>
                  
                  <div className="relative w-full">
                    <button
                      onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                      className="flex flex-row justify-between items-center px-4.5 py-2.5 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[4px] w-full h-[42px] cursor-pointer"
                    >
                      <span className="text-[14px] leading-5 text-[#0D1C2E]">
                        {selectedDept}
                      </span>
                      <ChevronDown className={`w-[21px] h-[21px] text-[#6B7280] transition-transform ${showDeptDropdown ? "rotate-180" : ""}`} />
                    </button>

                    {showDeptDropdown && (
                      <div className="absolute left-0 right-0 top-[46px] bg-white border border-[#C2C7D1] rounded-[4px] shadow-lg z-30 max-h-[200px] overflow-y-auto">
                        {departmentsList.map((dept) => (
                          <div
                            key={dept}
                            onClick={() => {
                              setSelectedDept(dept);
                              setShowDeptDropdown(false);
                              setPage(1);
                            }}
                            className="px-4 py-2 text-[14px] text-[#0D1C2E] hover:bg-[#EFF4FF] cursor-pointer"
                          >
                            {dept}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Insurance Provider Buttons */}
                <div className="flex flex-col gap-4 w-full">
                  <span className="text-[16px] font-[400] tracking-[1.6px] uppercase text-[#42474F] leading-6">
                    Insurance Provider
                  </span>
                  
                  <div className="flex flex-wrap gap-2 w-full">
                    {insuranceProviders.map((prov) => {
                      const isSelected = selectedInsurance === prov;
                      return (
                        <button
                          key={prov}
                          onClick={() => {
                            setSelectedInsurance(prov);
                            setPage(1);
                          }}
                          className={`flex items-center justify-center px-3 py-1.5 h-[38px] rounded-[12px] font-sans font-[700] text-[11px] border transition-all ${
                            isSelected
                              ? "bg-[#D4E6E5] text-[#576867] border-transparent"
                              : "bg-white text-[#0D1C2E] border-[#C2C7D1] hover:bg-[#F8F9FF]"
                          }`}
                        >
                          {prov}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Insight Card (Hospital Occupancy) */}
            <div className="flex flex-col items-start p-6 bg-[#00355F] shadow-lg rounded-[8px] w-[288px] h-[197px] text-white">
              <div className="flex flex-col gap-2 w-full h-[149px]">
                <h4 className="text-[16px] font-[400] leading-6">
                  Hospital Occupancy
                </h4>

                <div className="flex flex-row items-baseline gap-2 pb-2 h-[48px]">
                  <span className="text-[32px] font-[700] leading-10">84%</span>
                  <span className="text-[14px] font-[400] text-[#8EBDF9] leading-5">Stable</span>
                </div>

                {/* Overlay Progress Bar */}
                <div className="w-full h-1.5 bg-[rgba(255,255,255,0.2)] rounded-[12px] relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-white rounded-[12px] w-[84%]" />
                </div>

                {/* Surge alert caption */}
                <div className="pt-2 text-[12px] font-[400] leading-5 opacity-80 max-w-[240px]">
                  Moderate surge expected in Emergency Department within 4 hours.
                </div>
              </div>
            </div>

          </aside>

          {/* Asymmetrical Column 2: Patient Table Area & Bottom Bento (664px) at left: 312px */}
          <div className=" left-[312px] right-0 top-0 bottom-0 flex flex-col gap-6 flex-1">
            
            {/* Table Area (Modern Data Table) */}
            <div className="flex flex-col w-full h-[721.5px] bg-white border border-[#C2C7D1] rounded-[8px] overflow-hidden">
              
              {/* Scrollable Table body wrapper */}
              <div className="flex-1 w-full overflow-y-auto block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#EFF4FF] border-b border-[#C2C7D1] h-[80px]">
                      <th className="text-left py-3 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">
                        Patient Name
                      </th>
                      <th className="text-left py-3 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F] whitespace-nowrap">
                        Medical ID
                      </th>
                      <th className="text-left py-3 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">
                        Department
                      </th>
                      <th className="text-left py-3 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">
                        Adm. Status
                      </th>
                      <th className="text-left py-3 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">
                        Status
                      </th>
                      <th className="text-right py-3 px-6 text-[11px] font-[700] tracking-[1.1px] uppercase text-[#42474F]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-20">
                          <Loader2 className="w-8 h-8 animate-spin text-[#00355F] mx-auto mb-2" />
                          <span className="text-[14px] text-[#42474F]">Loading patient records...</span>
                        </td>
                      </tr>
                    ) : patients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-24 text-[14px] text-[#42474F]">
                          No records match filters.
                        </td>
                      </tr>
                    ) : (
                      patients.map((p) => {
                        const statusStyle = getStatusBadgeStyle(p.status);
                        return (
                          <tr key={p.id} className="border-t border-[#C2C7D1] hover:bg-[#F8F9FF] transition-colors h-[113px]">
                            {/* Patient Name with initials circular logo */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 w-[160px]">
                                <div className="w-[32px] h-[32px] rounded-[12px] bg-[#E6EEFF] flex items-center justify-center font-[700] text-[#00355F] text-[16px] shrink-0">
                                  {p.initials || "P"}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[14px] font-[700] leading-6 text-[#00355F] truncate">
                                    {p.full_name}
                                  </span>
                                  <span className="text-[12px] font-[400] text-[#42474F] leading-6">
                                    {p.gender}, {p.age} yrs
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Medical ID */}
                            <td className="px-6 py-4 text-[13px] font-[400] text-[#42474F] font-mono whitespace-nowrap">
                              {p.medical_id || "#MC-XXXXX"}
                            </td>

                            {/* Department */}
                            <td className="px-6 py-4 text-[14px] font-[400] text-[#0D1C2E]">
                              <div className="truncate w-[100px]" title={p.department}>
                                {p.department}
                              </div>
                            </td>

                            {/* Admission Status */}
                            <td className="px-6 py-4 text-[14px] font-[400] text-[#0D1C2E]">
                              {p.admission_status}
                            </td>

                            {/* Status Badge */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-[12px] text-[11px] leading-[24px] ${statusStyle.bg} ${statusStyle.text} ${statusStyle.font}`}>
                                {p.status}
                              </span>
                            </td>

                            {/* Actions menu */}
                            <td className="px-6 py-4 text-right relative">
                              <button
                                onClick={() => setActiveActionMenuId(activeActionMenuId === p.id ? null : p.id)}
                                className="w-8 h-8 rounded-[12px] hover:bg-[#EFF4FF] flex items-center justify-center text-[#727780] transition-colors ml-auto cursor-pointer"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {/* Action Popover Menu */}
                              {activeActionMenuId === p.id && (
                                <div
                                  ref={actionMenuRef}
                                  className="absolute right-6 top-[70px] w-[180px] bg-white border border-[#C2C7D1] rounded-[8px] shadow-lg py-2 z-40 text-left"
                                >
                                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-[0.5px] text-[#727780] border-b border-[#EFF4FF]">
                                    Change Status
                                  </div>
                                  {["Active", "Observation", "ER/Critical", "Archived"].map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => handleUpdateStatus(p.id, st)}
                                      className="flex items-center justify-between w-full px-4 py-2 text-[13px] text-[#0D1C2E] hover:bg-[#EFF4FF] transition-colors text-left"
                                    >
                                      <span>{st}</span>
                                      {p.status === st && <Check className="w-4 h-4 text-[#00355F]" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-row justify-between items-center px-6 py-4 bg-[#EFF4FF] border-t border-[#C2C7D1] h-[73px] select-none shrink-0">
                <span className="text-[14px] font-[400] text-[#42474F]">
                  Showing {rangeStart}-{rangeEnd} of {total} results
                </span>

                <div className="flex flex-row items-center gap-2">
                  {/* Prev Button */}
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="w-10 h-10 bg-white border border-[#C2C7D1] rounded-[4px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F9FF] text-[#727780]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex flex-row items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const num = i + 1;
                      const isCurrent = page === num;
                      return (
                        <button
                          key={num}
                          onClick={() => setPage(num)}
                          className={`w-10 h-10 rounded-[4px] flex items-center justify-center font-[700] text-[14px] ${
                            isCurrent
                              ? "bg-[#00355F] text-white shadow-sm"
                              : "text-[#42474F] hover:bg-[#E6EEFF]"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="w-10 h-10 bg-white border border-[#C2C7D1] rounded-[4px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F9FF] text-[#00355F]"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00355F]" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bento-style statistics grid at the bottom (height: 190px) */}
            <div className="flex flex-row justify-between items-start gap-6 w-full h-[190px]">
              
              {/* Bento Card 1: Alerts Overview (width: ~205px) */}
              <div className="flex flex-col justify-between p-6 bg-white border border-[#C2C7D1] rounded-[8px] w-[210px] h-[166px]">
                <div className="flex flex-row items-center gap-3 w-full h-[48px] border-b border-[#EFF4FF] pb-2">
                  <div className="w-[36px] h-[40px] rounded-[4px] bg-[#D4E6E5] flex items-center justify-center text-[#576867] shrink-0 font-[700]">
                    <span className="w-5 h-5 block bg-[#576867] mask-activity" style={{ WebkitMask: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"></path></svg>') no-repeat center/contain" }} />
                  </div>
                  <span className="text-[14px] font-[700] text-[#0D1C2E] leading-5">Admissions</span>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-row justify-between items-center w-full">
                    <span className="text-[12px] font-[400] text-[#0D1C2E]">Inpatients</span>
                    <span className="text-[12px] font-[700] text-[#065F46]">+{inpatientCount}</span>
                  </div>
                  <div className="flex flex-row justify-between items-center w-full">
                    <span className="text-[12px] font-[400] text-[#0D1C2E]">Observation</span>
                    <span className="text-[12px] font-[700] text-[#991B1B]">+{criticalCount}</span>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Clinq Occupancy Trends Sparkline (width: ~434px) */}
              <div className="flex flex-col justify-between p-6 bg-white border border-[#C2C7D1] rounded-[8px] w-[430px] h-[166px]">
                <div className="flex flex-row justify-between items-center w-full pb-2">
                  <span className="text-[14px] font-[400] text-[#0D1C2E]">Occupancy Trends</span>
                  <span className="text-[10px] font-[700] text-[#42474F] tracking-[1.1px] uppercase">LAST 7 DAYS</span>
                </div>

                {/* Mock Sparkline bars */}
                <div className="flex flex-row justify-center items-end gap-3 px-2 h-[64px] pb-1 w-full bg-gradient-to-t from-[#F8F9FF] to-white rounded-[4px] border border-[#EFF4FF]">
                  {sparklineBars.map((bar, i) => (
                    <div
                      key={i}
                      className={`w-[48px] ${bar.height} ${bar.bg} rounded-t-[2px] cursor-pointer hover:opacity-80 transition-all`}
                      title={`Day ${i+1}`}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* ── dialog/ADD PATIENT POPUP MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0D1C2E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col scale-100 transform transition-transform duration-300">
            {/* Modal Header */}
            <div className="flex flex-row justify-between items-center px-6 py-4 bg-[#EFF4FF] border-b border-[#C2C7D1]">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#00355F]" />
                <h3 className="text-[18px] font-[700] text-[#00355F]">Add New Patient Record</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#727780] hover:text-[#0D1C2E] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddPatientSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#BA1A1A]/20 text-[#991B1B] text-[13px] rounded-[4px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0" />
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
                  placeholder="Eleanor Watson"
                  className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] placeholder-[#727780] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="eleanor@example.com"
                  className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] placeholder-[#727780] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
                />
              </div>

              {/* Age and Gender row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Age</label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="42"
                    className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="px-4 py-2 border border-[#C2C7D1] bg-white rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Department and Assigned Doctor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="px-4 py-2 border border-[#C2C7D1] bg-white rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  >
                    {departmentsList.filter(d => d !== "All Departments").map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Assigned Doctor</label>
                  <input
                    type="text"
                    value={formDoctor}
                    onChange={(e) => setFormDoctor(e.target.value)}
                    placeholder="Dr. Sarah Chen"
                    className="px-4 py-2 border border-[#C2C7D1] rounded-[4px] text-[14px] text-[#0D1C2E] placeholder-[#727780] focus:outline-none focus:ring-2 focus:ring-[#00355F]/20"
                  />
                </div>
              </div>

              {/* Admission Status and Insurance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Admission Status</label>
                  <select
                    value={formAdmissionStatus}
                    onChange={(e) => setFormAdmissionStatus(e.target.value)}
                    className="px-4 py-2 border border-[#C2C7D1] bg-white rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  >
                    <option value="Inpatient">Inpatient</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Observation">Observation</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-[700] text-[#42474F] uppercase tracking-[0.5px]">Insurance Provider</label>
                  <select
                    value={formInsurance}
                    onChange={(e) => setFormInsurance(e.target.value)}
                    className="px-4 py-2 border border-[#C2C7D1] bg-white rounded-[4px] text-[14px] text-[#0D1C2E] focus:outline-none"
                  >
                    {insuranceProviders.filter(i => i !== "All").map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFF4FF] mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-[4px] border border-[#C2C7D1] text-[14px] text-[#42474F] hover:bg-[#F8F9FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#00355F] hover:bg-[#002747] text-white rounded-[4px] font-[600] text-[14px] flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Add Patient</span>
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
