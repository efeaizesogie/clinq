"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  CheckCircle,
  FileText,
  Clock,
  Compass,
  Heart,
  TrendingUp,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import type { Specialist } from "@/lib/types";

export default function SpecialistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load specialists from API to match this ID
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/staff");
        if (!response.ok) throw new Error("Failed to load staff list");
        const data = await response.json();
        const found = (data.specialists as Specialist[]).find((s) => s.id === id);
        if (found) {
          setSpecialist(found);
        } else {
          // If not found in DB, try rendering doctor matching names or fallback
          const fallback = (data.specialists as Specialist[])[0];
          setSpecialist(fallback || null);
        }
      } catch (err) {
        console.error("Error loading doctor profile page:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00355F]" />
        <span className="text-sm mt-3 text-[#42474F]">Loading staff credentials...</span>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6">
        <span className="text-lg font-[600] text-[#00355F]">Specialist Profile Not Found</span>
        <button
          onClick={() => router.push("/admin/staff")}
          className="mt-4 px-4 py-2 bg-[#00355F] text-white rounded-[4px] text-sm uppercase font-[600]"
        >
          Return to Staff Directory
        </button>
      </div>
    );
  }

  const isJulianVance = specialist.full_name.includes("Julian Vance");

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8F9FF] select-none overflow-y-auto">
      {/* Top Header / Nav Section */}
      <div className="w-full h-16 bg-[#F8F9FF] border-b border-[#C2C7D1] flex items-center justify-between px-6 shrink-0 z-20 sticky top-0 bg-opacity-95 backdrop-blur-sm shadow-sm">
        <button
          onClick={() => router.push("/admin/staff")}
          className="flex items-center gap-2 text-[#00355F] font-[600] text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4 text-[#00355F]" />
          <span>Back to Staff Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-[700] text-[#0D1C2E]">Dr. Sarah Chen</span>
            <span className="text-[10px] text-[#727780] uppercase">Hospital Admin</span>
          </div>
          <div className="w-9 h-9 rounded-[12px] bg-[#E6EEFF] border border-[#C2C7D1] flex items-center justify-center font-[700] text-sm text-[#00355F]">
            SC
          </div>
        </div>
      </div>

      {/* ── Main Canvas Content area ── */}
      <main className="flex flex-col items-start gap-8 p-6 self-stretch w-full max-w-[1024px] mx-auto">
        
        {/* IDENTITY HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full bg-white border border-[#E2E8F0] rounded-[8px] p-6 shadow-sm">
          <div className="flex items-center gap-6">
            {/* Profile Avatar Frame */}
            <div className="relative">
              {specialist.image_url ? (
                <img
                  src={specialist.image_url}
                  alt={specialist.full_name}
                  className="w-32 h-32 rounded-[12px] object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className={`w-32 h-32 rounded-[12px] bg-gradient-to-br ${specialist.color_grad || 'from-[#00355F] to-[#8EBDF9]'} flex items-center justify-center text-white text-[42px] font-[700] shadow-md border-4 border-white`}>
                  {specialist.initials || "MD"}
                </div>
              )}
              {/* Online Green dot status */}
              <div 
                className={`absolute right-1 bottom-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                  specialist.status === "Active" ? "bg-[#22C55E]" : specialist.status === "Emergency Leave" ? "bg-[#EF4444]" : "bg-[#94A3B8]"
                }`} 
              />
            </div>

            {/* Doctor Info */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[26px] font-[600] text-[#0D1C2E] leading-8 font-sans">
                  {specialist.full_name}
                </h1>
                
                {/* Specialty Status Tag */}
                <span className="px-3 py-1 bg-[#D4E6E5] text-[#576867] text-[12px] font-[700] uppercase rounded-[12px] tracking-[0.5px]">
                  {isJulianVance ? "Senior Cardiologist" : specialist.tag || "Specialist"}
                </span>
              </div>

              {/* Qualifications */}
              <p className="text-[16px] text-[#42474F] font-[500]">
                {specialist.specialty} • ID: STAFF-{isJulianVance ? "94212" : specialist.id.slice(0, 5).toUpperCase()}
              </p>

              {/* Status details */}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] text-[#42474F] font-[600]">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#00355F]" />
                  <span>Certified Specialist</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#00355F]" />
                  <span>North Wing, Unit 4B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button className="flex-1 md:flex-initial px-4 py-2 border border-[#00355F] text-[#00355F] rounded-[4px] text-[12px] uppercase font-[600] tracking-[0.6px] bg-white hover:bg-[#EEF4FF] transition-all h-[36px]">
              Edit Profile
            </button>
            <button className="flex-1 md:flex-initial px-4 py-2 bg-[#BA1A1A] hover:bg-[#A31616] text-white rounded-[4px] text-[12px] uppercase font-[600] tracking-[0.6px] transition-all shadow-sm h-[36px]">
              Modify Privileges
            </button>
          </div>
        </div>

        {/* BENTO GRID CONTENT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* LEFT 2-COLUMN GROUP */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* CAREER SUMMARY */}
            <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                <Briefcase className="w-[18px] h-[18px] text-[#00355F]" />
                <h3 className="text-[18px] font-[600] text-[#0D1C2E]">Career Summary</h3>
              </div>

              <p className="text-[16px] text-[#42474F] leading-[26px]">
                {isJulianVance
                  ? "With over 18 years of clinical experience, Dr. Vance has pioneered several minimally invasive cardiac procedures within the City General network. He currently serves as the Lead Consultant for the Interventional Cardiology department, overseeing a team of 12 specialists and managing high-complexity vascular cases."
                  : specialist.bio || "Specialist clinician dedicated to delivering cutting-edge analytics and medicine therapeutics."}
              </p>

              {/* Internal Tenure Numbers */}
              <div className="grid grid-cols-3 gap-4 border-t border-[#C2C7D1] pt-6 mt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-[700] text-[#727780] tracking-[0.5px] uppercase">Tenure</span>
                  <span className="text-[18px] font-[600] text-[#00355F]">{isJulianVance ? "12 Years" : specialist.experience}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-[700] text-[#727780] tracking-[0.5px] uppercase">Total Procedures</span>
                  <span className="text-[18px] font-[600] text-[#00355F]">{isJulianVance ? "4,200+" : "1,500+"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-[700] text-[#727780] tracking-[0.5px] uppercase">Clinical Trials</span>
                  <span className="text-[18px] font-[600] text-[#00355F]">{isJulianVance ? "08 Active" : "03 Active"}</span>
                </div>
              </div>
            </div>

            {/* SPECIALIZED PROCEDURES */}
            <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-[18px] font-[600] text-[#0D1C2E] pb-2 border-b border-[#F1F5F9]">
                Specialized Procedures
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Transcatheter Aortic Valve (TAVI)", desc: "Minimally invasive aortic replacement" },
                  { title: "Complex PCI & Stenting", desc: "Coronary artery revascularization" },
                  { title: "Cardiac Electrophysiology", desc: "Pacemaker and ablation therapies" },
                  { title: "Computed Tomography (CT)", desc: "Advanced vascular screening & diagnostics" }
                ].map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#EFF4FF] border border-[#C2C7D1]/30 rounded-[4px] p-4 hover:bg-[#D2E4FF]/40 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-[700] text-[#0D1C2E]">{p.title}</span>
                      <span className="text-[11px] text-[#6B7280]">{p.desc}</span>
                    </div>
                    <Info className="w-4 h-4 text-[#42474F]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Timelines and Educational background */}
            <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-[18px] font-[600] text-[#0D1C2E] pb-2 border-b border-[#F1F5F9]">
                Educational Background
              </h3>

              <div className="flex flex-col gap-6">
                {[
                  {
                    year: "2005 - 2008",
                    degree: "Fellowship in Interventional Cardiology",
                    sub: "Johns Hopkins University School of Medicine"
                  },
                  {
                    year: "2001 - 2005",
                    degree: "Residency in Internal Medicine",
                    sub: "Stanford University Medical Center"
                  },
                  {
                    year: "2001",
                    degree: "Doctor of Medicine (MD)",
                    sub: "Harvard Medical School"
                  }
                ].map((edu, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-[2px] bg-[#E6EEFF] flex items-center justify-center text-[#00355F] font-[700] shrink-0 font-sans mt-0.5">
                      <Award className="w-[20px] h-[20px]" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-[600] text-[#00355F] tracking-[0.5px] uppercase">{edu.year}</span>
                      <span className="text-[15px] font-[700] text-[#0D1C2E]">{edu.degree}</span>
                      <span className="text-[14px] text-[#42474F]">{edu.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 1-COLUMN GROUP */}
          <div className="flex flex-col gap-6">
            
            {/* SATISFACTION INDEX */}
            <div className="bg-[#00355F] text-white rounded-[4px] p-6 shadow-md flex flex-col justify-between h-[317px]">
              <div>
                <h3 className="text-[18px] font-[600]">Patient Satisfaction</h3>
                
                <div className="flex gap-2 items-baseline mt-4">
                  <span className="text-[34px] font-[700] tracking-tighter">{specialist.rating?.toFixed(1) || "4.9"}</span>
                  <span className="text-[#8EBDF9] text-[16px]">/ 5.0</span>
                </div>

                {/* Stars */}
                <div className="flex gap-1 items-center mt-2.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-[18px] h-[18px] fill-current ${
                        s <= Math.round(specialist.rating || 5) ? "text-[#8EBDF9]" : "text-white/20"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[#8EBDF9] text-[14px] mt-4 leading-5">
                  Based on 1,248 verified patient reviews from the last fiscal year.
                </p>
              </div>

              {/* Progress and Trust indicator */}
              <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-[13px] font-[500]">
                  <span>Trust Index</span>
                  <span>{specialist.retention_rate || 98}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#FFFFFF]/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${specialist.retention_rate || 98}%` }} />
                </div>
              </div>
            </div>

            {/* ACTIVE SHIFT CALENDAR */}
            <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-[600] text-[#0D1C2E]">Active Shift Calendar</h3>
                
                <div className="flex items-center gap-1 text-[#0D1C2E]">
                  <button className="p-1 hover:bg-[#F1F5F9] rounded">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-[800] uppercase tracking-[0.5px]">OCTOBER 2023</span>
                  <button className="p-1 hover:bg-[#F1F5F9] rounded">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-[600] text-[#727780] pt-2">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>

              {/* Grid Calendar Dates (Highlights Vance's shifts) */}
              <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-[600] text-[#0D1C2E] border-t border-[#F1F5F9] pt-2">
                <span className="py-2 text-[#C2C7D1]">25</span>
                <span className="py-2 text-[#C2C7D1]">26</span>
                <span className="py-2 text-[#C2C7D1]">27</span>
                <span className="py-2 text-[#C2C7D1]">28</span>
                <span className="py-2 text-[#C2C7D1]">29</span>
                <span className="py-2 text-[#C2C7D1]">30</span>
                <span className="py-2 bg-[#E6EEFF] rounded-[2px]">1</span>

                <span className="py-2 bg-[#00355F] text-white rounded-[2px]">2</span>
                <span className="py-2 bg-[#00355F] text-white rounded-[2px]">3</span>
                <span className="py-2">4</span>
                <span className="py-2 bg-[#D4E6E5] text-[#576867] rounded-[2px]">5</span>
                <span className="py-2 bg-[#D4E6E5] text-[#576867] rounded-[2px]">6</span>
                <span className="py-2">7</span>
                <span className="py-2">8</span>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-[#F1F5F9] text-[11px] font-[600] text-[#0D1C2E] tracking-[0.5px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#00355F] rounded-[2px]" />
                  <span>On-Call (Surgery)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#D4E6E5] rounded-[2px]" />
                  <span>Outpatient Clinic</span>
                </div>
              </div>
            </div>

            {/* RESEARCH & PUBLICATIONS */}
            <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <h3 className="text-[17px] font-[600] text-[#0D1C2E]">Research & Publications</h3>
                <span className="text-[12px] font-[600] text-[#00355F] cursor-pointer hover:underline">View All (9)</span>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  {
                    journal: "Journal of Cardiology (2022)",
                    title: "Long-term Outcomes of TAVI in High-Risk Octogenarians",
                    cit: 142,
                    imp: 8.4
                  },
                  {
                    journal: "The Lancet Oncology (2021)",
                    title: "Cardiotoxicity Trends in Modern Immunotherapy Protocols",
                    cit: 89,
                    imp: 17.1
                  },
                  {
                    journal: "Heart & Vascular Review (2020)",
                    title: "Digital Health Integration in Chronic Heart Failure",
                    cit: 215,
                    imp: 5.2
                  }
                ].map((pub, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-[13px] border-b border-dashed border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
                    <span className="text-[#6B7280]">{pub.journal}</span>
                    <span className="font-[700] text-[#0D1C2E] hover:text-[#00355F] cursor-pointer select-text">{pub.title}</span>
                    <div className="flex gap-2 mt-1">
                      <span className="px-1.5 py-0.5 bg-[#EFF4FF] text-[#00355F] text-[10px] rounded font-[600]">Citations: {pub.cit}</span>
                      <span className="px-1.5 py-0.5 bg-[#EFF4FF] text-[#00355F] text-[10px] rounded font-[600]">Impact: {pub.imp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* COMPLIANCE FOOTER */}
        <div className="w-full border-t border-[#C2C7D1] pt-6 mt-4 flex flex-col md:flex-row gap-4 items-center justify-between text-[13px] text-[#727780]">
          <span>Last Profile Verification: October 12, 2023 by Chief Medical Officer</span>
          
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-[#0D1C2E]">Privacy Policy</span>
            <span className="cursor-pointer hover:text-[#0D1C2E]">Credentialing Agreement</span>
            <span className="cursor-pointer hover:text-[#0D1C2E]">HIPAA Compliance</span>
          </div>
        </div>

      </main>
    </div>
  );
}
