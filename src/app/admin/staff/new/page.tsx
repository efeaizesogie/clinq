"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  AlertTriangle,
  Upload,
  User,
  Shield,
  Briefcase,
  CheckCircle,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

export default function OnboardPersonnelPage() {
  const router = useRouter();

  // Personal Information States
  const [fullName, setFullName] = useState("");
  const [prefix, setPrefix] = useState("Dr.");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Professional Credentials States
  const [degree, setDegree] = useState("MD (Medical Doctor)");
  const [license, setLicense] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [isCertified, setIsCertified] = useState(true);

  // Shift & Rotation States (Mon: true, Tue: true, etc.)
  const [activeDays, setActiveDays] = useState([true, true, true, true, true, false, false]); // M T W T F S S

  // Assignment & Role States
  const [department, setDepartment] = useState("Cardiology Division");
  const [jobTitle, setJobTitle] = useState("Attending Physician");
  const [accessLevel, setAccessLevel] = useState("clinician"); // clinician or admin
  const [imageUrl, setImageUrl] = useState("");

  // Submission Management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (index: number) => {
    const updated = [...activeDays];
    updated[index] = !updated[index];
    setActiveDays(updated);
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setError("Full Legal Name is required.");
      return;
    }
    if (!specialization) {
      setError("Clinical Specialization is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Fallback pictures
    const defaultAvatars = [
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=compress&cs=tinysrgb&q=80&w=400",
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=compress&cs=tinysrgb&q=80&w=400",
      "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=compress&cs=tinysrgb&q=80&w=400",
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=compress&cs=tinysrgb&q=80&w=400"
    ];
    const finalImage = imageUrl.trim() || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    // Map department index matching specialization label
    const mappedSpecialty = `${degree.split(" ")[0]} • ${specialization.trim()}`;

    // Get Active Shift description (e.g. Morning Rotation)
    let shiftString = "08:00 - 16:00 (Morning)";
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const enabledDays = dayNames.filter((_, idx) => activeDays[idx]).join(", ");
    if (enabledDays) {
      shiftString = `08:00 - 16:00 (Days: ${enabledDays})`;
    }

    // Map role/tag
    let mappedTag = "CONSULTANT";
    if (jobTitle.includes("Senior")) mappedTag = "CONSULTANT";
    else if (jobTitle.includes("Fellow")) mappedTag = "FELLOW";
    else if (jobTitle.includes("Resident")) mappedTag = "RESIDENT";
    else mappedTag = "CLINICAL FACULTY";

    const payload = {
      full_name: `${prefix} ${fullName.trim()}`,
      specialty: mappedSpecialty,
      tag: mappedTag,
      status: "Active",
      experience: "8+ Years", // Default placeholder background experience
      bio: `Lead clinical practitioner in the ${department}. Expert in patient diagnostics and therapeutic procedures. Residential validation: ${address || "Verified"}`,
      rating: 4.8, 
      retention_rate: 96,
      shift: shiftString,
      image_url: finalImage
    };

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to onboard new specialist.");
      }

      // Onboard successful
      router.push("/admin/staff");
    } catch (err: any) {
      console.error("Error onboarding staff member:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8F9FF] select-none text-[#0D1C2E] font-sans">
      {/* ── Top Header Navigation Bar ── */}
      
      <header className="h-[64px] border-b border-[#C2C7D1] bg-[#F8F9FF] px-6 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/staff")}
            className="flex items-center gap-1.5 text-[#00355F] font-[700] text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-[700] text-[#0D1C2E]">Hospital Admin</span>
            <span className="text-[10px] text-[#727780] uppercase">Admin Terminal</span>
          </div>
          <div className="w-9 h-9 rounded-[12px] bg-[#E6EEFF] border border-[#C2C7D1] flex items-center justify-center font-[700] text-sm text-[#00355F]">
            AD
          </div>
        </div>
      </header>

      {/* ── Page Content Layout Container ── */}
      <form onSubmit={handleOnboardSubmit} className="flex-1 w-full px-6 py-8 flex flex-col gap-8">
        
        {/* HEADING & ACTIONS ROAD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-[#C2C7D1]/55 w-full">
          <div>
            <h1 className="text-[24px] font-[600] text-[#0D1C2E] leading-10 letter-spacing-[-0.32px] font-sans mt-1">
              Onboard New Personnel
            </h1>
            <p className="text-[16px] text-[#42474F] font-[400] leading-6 max-w-[640px] mt-1.5">
              Insert a medical specialist credential to register them within the active clinical registry directory.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/staff")}
              className="px-5 py-2 border border-[#00355F] text-[#00355F] rounded-[4px] text-[12px] uppercase font-[600] tracking-[0.6px] bg-white hover:bg-[#EEF4FF] transition-all h-[42px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#00355F] hover:bg-[#002747] text-white rounded-[4px] text-[12px] uppercase font-[600] tracking-[0.6px] transition-all shadow-md h-[42px] flex items-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Onboard Specialist"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-[4px] flex items-center gap-3 w-full">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* BENTO GRID COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-start">
          
          {/* LEFT 2-COLUMN FORMS GROUP */}
          <div className="md:col-span-2 flex flex-col gap-8">
            
            {/* 1. PERSONAL INFORMATION */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#C2C7D1]">
                <User className="w-5 h-5 text-[#00355F]" />
                <h3 className="text-[18px] font-[600] text-[#0D1C2E]">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Legal Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Mitchell"
                    className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:border-[#00355F] transition-all"
                  />
                </div>

                {/* Preferred Prefix dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Preferred Prefix *
                  </label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] focus:outline-none focus:border-[#00355F] transition-all"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                  </select>
                </div>

                {/* Email address */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Primary Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="s.mitchell@hospital.org"
                    className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:border-[#00355F] transition-all"
                  />
                </div>

                {/* Contact phone number */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:border-[#00355F] transition-all"
                  />
                </div>
              </div>

              {/* Residential Address textarea */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                  Residential Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Apartment, City, State, ZIP"
                  rows={2}
                  className="w-full bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-3 text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:border-[#00355F] transition-all resize-none"
                />
              </div>
            </div>

            {/* 2. PROFESSIONAL CREDENTIALS */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#C2C7D1]">
                <Layers className="w-5 h-5 text-[#00355F]" />
                <h3 className="text-[18px] font-[600] text-[#0D1C2E]">Professional Credentials</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Highest Degree */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Highest Degree
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] focus:outline-none focus:border-[#00355F] transition-all"
                  >
                    <option value="MD (Medical Doctor)">MD (Medical Doctor)</option>
                    <option value="DO (Doctor of Osteopathic Medicine)">DO (Doctor of Osteopathic Medicine)</option>
                    <option value="PhD (Doctor of Philosophy)">PhD (Doctor of Philosophy)</option>
                    <option value="MS (Master of Science)">MS (Master of Science)</option>
                  </select>
                </div>

                {/* Medical license number */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Medical License Number
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="LIC-9988-0021"
                    className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:border-[#00355F] transition-all"
                  />
                </div>

                {/* Clinical specialization */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Clinical Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Neuro-Ophthalmology"
                    className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:border-[#00355F] transition-all"
                  />
                </div>

                {/* Board certification status */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                    Board Certification Status
                  </label>
                  <div className="flex items-center gap-6 h-[50px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={isCertified === true}
                        onChange={() => setIsCertified(true)}
                        className="w-4.5 h-4.5 accent-[#00355F]"
                      />
                      <span className="text-[14px] text-[#0D1C2E] font-[500]">Board Certified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={isCertified === false}
                        onChange={() => setIsCertified(false)}
                        className="w-4.5 h-4.5 accent-[#00355F]"
                      />
                      <span className="text-[14px] text-[#0D1C2E] font-[500]">Non-Certified</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SHIFT SCHEDULING SECTION */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#C2C7D1]">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#00355F]" />
                  <h3 className="text-[18px] font-[600] text-[#0D1C2E]">Shift Rotation</h3>
                </div>
                <span className="text-[12px] font-[700] text-[#00355F] tracking-[0.6px] uppercase select-none">
                  Active Shifts Setup
                </span>
              </div>

              {/* Day selection grid rows */}
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-[700] text-[#727780] tracking-[0.6px] uppercase">
                  Weekly Rotation Days
                </span>
                <div className="flex gap-2.5 items-center justify-between w-full">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                    const isSelected = activeDays[idx];
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(idx)}
                        className={`flex-1 h-[70px] border rounded-[4px] flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? "bg-[#0F4C81] border-[#00355F] text-white shadow-sm"
                            : "bg-[#F8F9FF] border-[#C2C7D1] text-[#0D1C2E] opacity-65 hover:opacity-100"
                        }`}
                      >
                        <span className={`text-[12px] font-[600] ${isSelected ? "text-[#8EBDF9]" : "text-[#727780]"} tracking-[0.6px] uppercase`}>
                          {day.slice(0, 3)}
                        </span>
                        <span className={`text-[14px] font-[700] ${isSelected ? "text-white" : "text-[#0D1C2E]"}`}>
                          {isSelected ? "ON" : "OFF"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rotational Shifts info block cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#E6EEFF] border border-[#C2C7D1]/50 rounded-[4px] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[12px] font-[600] text-[#576867] tracking-[0.6px]">SHIFT TYPE</span>
                    <span className="bg-[#D4E6E5] text-[#576867] text-[10px] font-[700] px-2 py-0.5 rounded-[2px] uppercase">
                      Weekday
                    </span>
                  </div>
                  <span className="text-[14px] text-[#0D1C2E] font-[500]">
                    Morning Rotation (08:00 - 16:00)
                  </span>
                </div>

                <div className="bg-[#E6EEFF] border border-[#C2C7D1]/50 rounded-[4px] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[12px] font-[600] text-[#576867] tracking-[0.6px]">OVERTIME</span>
                    <span className="bg-[#FFDAD6] text-[#93000A] text-[10px] font-[700] px-2 py-0.5 rounded-[2px] uppercase">
                      Weekend
                    </span>
                  </div>
                  <span className="text-[14px] text-[#0D1C2E] font-[500]">
                    On-Call Every 3rd Weekend
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 1-COLUMN LOGISTICS PANEL */}
          <div className="flex flex-col gap-8">
            
            {/* A. BIOMETRIC PHOTOGRAPHY */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-8 shadow-sm flex flex-col items-center gap-6">
              <span className="text-[12px] font-[700] text-[#0D1C2E] tracking-[0.6px] uppercase">
                Biometric Identification
              </span>

              {/* Photo box display */}
              <div className="relative w-40 h-40">
                <div className="w-full h-full bg-[#E6EEFF] border-4 border-[#DCE9FF] rounded-[12px] flex items-center justify-center overflow-hidden">
                  {imageUrl.trim() ? (
                    <img
                      src={imageUrl}
                      alt="Uploaded face profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-[#0D1C2E]/60 animate-pulse" />
                  )}
                </div>
                {/* Upload Action overlay button */}
                <div className="absolute right-1 bottom-1 w-9 h-9 bg-[#00355F] border-2 border-white rounded-[12px] shadow-md flex items-center justify-center text-white cursor-pointer hover:bg-[#00223D] transition-colors">
                  <Upload className="w-[14px] h-[14px]" />
                </div>
              </div>

              {/* Image URL text binding input */}
              <div className="w-full flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-[700] text-[#727780] uppercase tracking-[0.5px]">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-[40px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-3 py-1 text-[13px] text-[#0D1C2E] placeholder-[#6B7280] focus:outline-none focus:border-[#00355F] transition-all"
                />
                <span className="text-[10px] text-[#727780] text-center mt-1">
                  Provide custom Unsplash Doctor image link or leave blank for random seed.
                </span>
              </div>
            </div>

            {/* B. ASSIGNMENT & LOGISTICS */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#C2C7D1]">
                <Activity className="w-5 h-5 text-[#00355F]" />
                <h3 className="text-[18px] font-[600] text-[#0D1C2E]">Assignment</h3>
              </div>

              {/* Admin department choice */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                  Administrative Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] focus:outline-none focus:border-[#00355F] transition-all"
                >
                  <option value="Cardiology Division">Cardiology Division</option>
                  <option value="Neurology Division">Neurology Division</option>
                  <option value="Pediatrics Department">Pediatrics Department</option>
                  <option value="General Surgery Center">General Surgery Center</option>
                  <option value="Emergency Room Unit">Emergency Room Unit</option>
                </select>
              </div>

              {/* Job Title / Role */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                  Job Title / Role *
                </label>
                <select
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 py-2 text-[16px] text-[#0D1C2E] focus:outline-none focus:border-[#00355F] transition-all"
                >
                  <option value="Attending Physician">Attending Physician</option>
                  <option value="Senior Consultant">Senior Consultant</option>
                  <option value="Resident Physician">Resident Physician</option>
                  <option value="Clinical Fellow">Clinical Fellow</option>
                </select>
              </div>

              {/* System Access level cards */}
              <div className="flex flex-col gap-3">
                <label className="text-[12px] font-[700] text-[#0D1C2E] uppercase tracking-[0.6px]">
                  System Access Level
                </label>

                {/* Option 1: Clinician */}
                <div
                  onClick={() => setAccessLevel("clinician")}
                  className={`border rounded-[4px] p-4 flex gap-3 items-start cursor-pointer transition-colors ${
                    accessLevel === "clinician"
                      ? "bg-[#EFF4FF] border-[#00355F]"
                      : "bg-[#F8F9FF] border-[#C2C7D1] opacity-75 hover:opacity-100"
                  }`}
                >
                  <input
                    type="radio"
                    checked={accessLevel === "clinician"}
                    onChange={() => setAccessLevel("clinician")}
                    className="w-4 h-4 mt-0.5 accent-[#00355F]"
                  />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-[700] text-[#0D1C2E]">Clinician Access</span>
                    <span className="text-[12px] text-[#727780] mt-0.5 leading-4">
                      Provides dashboard statistics & scheduling management access.
                    </span>
                  </div>
                </div>

                {/* Option 2: Full Admin */}
                <div
                  onClick={() => setAccessLevel("admin")}
                  className={`border rounded-[4px] p-4 flex gap-3 items-start cursor-pointer transition-colors ${
                    accessLevel === "admin"
                      ? "bg-[#EFF4FF] border-[#00355F]"
                      : "bg-[#F8F9FF] border-[#C2C7D1] opacity-75 hover:opacity-100"
                  }`}
                >
                  <input
                    type="radio"
                    checked={accessLevel === "admin"}
                    onChange={() => setAccessLevel("admin")}
                    className="w-4 h-4 mt-0.5 accent-[#00355F]"
                  />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-[700] text-[#0D1C2E]">Full Administrative</span>
                    <span className="text-[12px] text-[#727780] mt-0.5 leading-4">
                      Administrative credentials for billing, directory configuration & user assignments.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* C. SYSTEM AUTOMATED INTEGRATION METADATA NOTE */}
            <div className="bg-[#00355F]/5 border border-[#00355F]/20 rounded-[8px] p-6 flex gap-3 items-start">
              <Shield className="w-5 h-5 text-[#00355F] mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[12px] font-[700] text-[#00355F] uppercase tracking-[0.6px]">
                  Verification Check
                </span>
                <p className="text-[13px] text-[#07497D] leading-5 mt-1 font-[500]">
                  Clinq systems automatically validate newly added medical credentials against hospital registries and certified board databases down to licensure status before status authorization.
                </p>
              </div>
            </div>

          </div>

        </div>

      </form>
    </div>
  );
}
