"use client";

import React, { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { usePlatformData } from "@/lib/hooks/usePlatformData";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  Search,
  MapPin,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Heart,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { data, isLoading } = usePlatformData();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  useEffect(() => {
    const locations = [
      { name: "CLINQ MAIN HOSPITAL HQ", lat: 51.5212, lng: -0.1302 },
      { name: "CLINQ LAGOS MEDICAL CENTER", lat: 6.5182, lng: 3.3842 },
      { name: "CLINQ NEW YORK HOSPITAL", lat: 40.7306, lng: -73.9975 },
      { name: "CLINQ TOKYO HEALTH CLINIC", lat: 35.6895, lng: 139.6917 },
      { name: "CLINQ INTL. MEDICAL HQ", lat: -33.9249, lng: 18.4241 }
    ];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    setMapLocation(randomLoc);
  }, []);

  const departments = data?.departments ?? [];
  const specialists = data?.specialists ?? [];
  const blogPosts = data?.blogPosts ?? [];
  const stats = data?.stats;

  const faqs = [
    {
      q: "How do I book an appointment?",
      a: 'Simply click the "Book Appointment" button on the navigation bar, choose your preferred clinician, pick a date and slot, and confirm. Your records will sync immediately.',
    },
    {
      q: "Can I manage my family's records?",
      a: "Yes, after creating a patient profile, you can register dependents under a unified account portal and track their health sheets, vitals, and consultation logs.",
    },
    {
      q: "Is my medical data secure?",
      a: "Clinq complies fully with HIPAA standards. All medical charts, diagnostic history, and patient-doctor consult chats are protected with 256-bit encryption.",
    },
  ];

  const filteredDoctors = specialists.filter((doc) => {
    const deptName = doc.department_name || "";
    const matchesDept =
      selectedDeptId === "all" ||
      deptName.toLowerCase().includes(selectedDeptId.toLowerCase());
    const matchesSearch =
      doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="flex flex-col items-start p-0 isolation-isolate relative w-full overflow-y-auto bg-brand-bg-light dark:bg-[#080f18] font-sans antialiased text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
      {/* Absolute/Fixed Header */}
      <PublicNavbar />

      {/* Main Container starts from top-80px for offset */}
      <main className="w-full flex flex-col items-start pt-[81px] bg-brand-bg-light dark:bg-[#080f18] transition-colors duration-300">
        {/* =============== HERO SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-8 md:py-[128px] px-6 md:px-16 flex items-center justify-center border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Left Content Container */}
            <div className="w-full md:w-[516px] flex flex-col items-start gap-6 order-1">
              <div className="pt-2">
                <h1 className="text-3xl sm:text-4xl md:text-[48px] md:leading-[60px] font-[700] text-brand-blue dark:text-white tracking-[-0.96px] text-left">
                  Healthcare that fits your lifestyle.
                </h1>
              </div>

              <div className="w-full max-w-[512px]">
                <p className="text-base sm:text-[18px] sm:leading-[28px] font-[400] text-[#42474F] dark:text-[#A5AAB5] text-left">
                  Instantly book consultations with top medical specialists,
                  secure your lab reports, check pharmacy supplies, and message
                  doctors via a clean virtual portal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4 w-full sm:w-auto">
                <Link
                  href="/patient/appointments/book"
                  className="w-full sm:w-[208px] h-[58px] bg-brand-blue dark:bg-[#5F9EA0] hover:bg-brand-blue/90 dark:hover:bg-[#5F9EA0]/95 text-white dark:text-[#0D1C2E] font-[700] text-base rounded-[4px] shadow flex items-center justify-center transition"
                >
                  Book Now
                </Link>
                <Link
                  href="/about"
                  className="w-full sm:w-[173px] h-[58px] border border-[#727780] dark:border-[#22354A] hover:bg-brand-bg-light dark:hover:bg-[#1E2E40] text-brand-blue dark:text-[#EFF4FF] font-[700] text-base rounded-[4px] flex items-center justify-center transition"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Interactive Mockup Graphic */}
            <div className="w-full md:w-[512px] flex justify-center order-2">
              <img
                src="/hero-img.svg"
                alt="clinq patient dashboard illustration"
                className="max-w-[320px] sm:max-w-[400px] md:max-w-none w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* =============== STATS SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#122338] py-12 md:py-20 border-b border-t border-[#C2C7D1]/10 dark:border-[#22354A]/30 flex justify-center transition-colors duration-300">
          <div className="w-full max-w-[1280px] px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-[#5F9EA0] tracking-[-0.32px]">
                {stats?.totalSpecialists ?? 0}+
              </div>
              <div className="text-[10px] sm:text-xs font-[600] text-[#42474F] dark:text-[#A7ABB5] tracking-[0.6px] uppercase">
                Specialists
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <div className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-[#5F9EA0] tracking-[-0.32px]">
                {stats ? `${(stats.totalPatients / 1000).toFixed(0)}k` : "0"}+
              </div>
              <div className="text-[10px] sm:text-xs font-[600] text-[#42474F] dark:text-[#A7ABB5] tracking-[0.6px] uppercase">
                Happy Patients
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <div className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-[#5F9EA0] tracking-[-0.32px]">
                99%
              </div>
              <div className="text-[10px] sm:text-xs font-[600] text-[#42474F] dark:text-[#A7ABB5] tracking-[0.6px] uppercase">
                Satisfaction
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <div className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-[#5F9EA0] tracking-[-0.32px]">
                24/7
              </div>
              <div className="text-[10px] sm:text-xs font-[600] text-[#42474F] dark:text-[#A7ABB5] tracking-[0.6px] uppercase">
                Hours Support
              </div>
            </div>
          </div>
        </section>

        {/* =============== INSURANCE PARTNERS SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-12 border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 flex justify-center transition-colors duration-300">
          <div className="w-full max-w-[1152px] px-6 flex flex-col gap-8 items-center">
            {/* Headline */}
            <div className="text-center">
              <span className="text-xs font-[600] text-[#42474F] dark:text-[#A5AAB5]/70 tracking-[1.2px] uppercase">
                Our Trusted Insurance Partners
              </span>
            </div>

            {/* Logo Strips */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 min-h-7 text-center">
              <span className="text-base sm:text-xl font-[700] text-[#42474F] dark:text-[#A5AAB5]">
                Aetna
              </span>
              <span className="text-base sm:text-xl font-[700] text-[#42474F] dark:text-[#A5AAB5]">
                BlueCross
              </span>
              <span className="text-base sm:text-xl font-[700] text-[#42474F] dark:text-[#A5AAB5]">
                UnitedHealthcare
              </span>
              <span className="text-base sm:text-xl font-[700] text-[#42474F] dark:text-[#A5AAB5]">
                Cigna
              </span>
              <span className="text-base sm:text-xl font-[700] text-[#42474F] dark:text-[#A5AAB5]">
                Axa
              </span>
              <span className="text-base sm:text-xl font-[700] text-[#42474F] dark:text-[#A5AAB5]">
                Medicare
              </span>
            </div>
          </div>
        </section>

        {/* =============== FEATURES SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] dark:bg-[#122338] py-16 md:py-[128px] px-6 md:px-16 flex justify-center transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 md:gap-24">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px]">
                Why Choose Clinq?
              </h2>
              <p className="max-w-[672px] text-sm sm:text-base text-[#42474F] dark:text-[#A7ABB5] leading-6">
                Clinq bridges the gap between active patients and clinical
                coordination teams, removing scheduling limits and paper files.
              </p>
            </div>

            {/* Feature lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="w-full min-h-[231px] bg-[#F8F9FF] dark:bg-[#1E2D4A] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 rounded-lg p-6 sm:p-8 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-xl sm:text-2xl font-[600] text-brand-blue dark:text-[#5F9EA0] mt-2">
                  Real-time Availability
                </h3>
                <p className="text-sm text-[#42474F] dark:text-[#A7ABB5] leading-5">
                  See exactly when your preferred specialists are free and
                  secure your slot instantly.
                </p>
              </div>

              <div className="w-full min-h-[231px] bg-[#F8F9FF] dark:bg-[#1E2D4A] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 rounded-lg p-6 sm:p-8 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xl sm:text-2xl font-[600] text-brand-blue dark:text-[#5F9EA0] mt-2">
                  Seamless Check-ins
                </h3>
                <p className="text-sm text-[#42474F] dark:text-[#A7ABB5] leading-5">
                  Reduce paperwork and wait times with our digital registration
                  and check-in process.
                </p>
              </div>

              <div className="w-full min-h-[231px] bg-[#F8F9FF] dark:bg-[#1E2D4A] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 rounded-lg p-6 sm:p-8 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="text-xl sm:text-2xl font-[600] text-brand-blue dark:text-[#5F9EA0] mt-2">
                  Personalized Care
                </h3>
                <p className="text-sm text-[#42474F] dark:text-[#A7ABB5] leading-5">
                  Manage your health history and upcoming visits in one secure,
                  easy-to-access portal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =============== PATIENT TESTIMONIALS SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-16 md:py-[128px] px-6 md:px-16 flex justify-center border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 md:gap-16">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px]">
                Patient Testimonials
              </h2>
              <p className="text-sm sm:text-base text-[#42474F] dark:text-[#A5AAB5] leading-6 max-w-sm">
                Hear from patients who use Clinq daily.
              </p>
            </div>

            {/* Testimonial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="w-full min-h-[237px] bg-[#EFF4FF] dark:bg-[#122338] border border-[#C2C7D1]/10 dark:border-[#22354A]/50 rounded-[16px] p-6 sm:p-8 flex flex-col justify-between gap-4">
                <div className="flex gap-1 text-brand-blue dark:text-[#5F9EA0]">
                  {[...Array(5)].map((_, i) => (
                    <Award
                      key={i}
                      className="w-4 h-4 fill-brand-blue dark:fill-[#5F9EA0] text-brand-blue dark:text-[#5F9EA0]"
                    />
                  ))}
                </div>
                <p className="text-sm text-brand-dark dark:text-[#E3E3E3] font-[400] leading-5 italic">
                  "The digital check-in saved me so much time. I was seen by Dr.
                  Sharma within 5 minutes of arriving."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-[12px] bg-[#D2E4FF] dark:bg-[#1E2D4A] text-brand-blue dark:text-white flex items-center justify-center font-bold text-sm shrink-0">
                    MS
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-dark dark:text-white">
                      Marcus Sharma
                    </div>
                    <div className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] tracking-[0.5px] uppercase">
                      Patient
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="w-full min-h-[237px] bg-[#EFF4FF] dark:bg-[#122338] border border-[#C2C7D1]/10 dark:border-[#22354A]/50 rounded-[16px] p-6 sm:p-8 flex flex-col justify-between gap-4">
                <div className="flex gap-1 text-brand-blue dark:text-[#5F9EA0]">
                  {[...Array(5)].map((_, i) => (
                    <Award
                      key={i}
                      className="w-4 h-4 fill-brand-blue dark:fill-[#5F9EA0] text-brand-blue dark:text-[#5F9EA0]"
                    />
                  ))}
                </div>
                <p className="text-sm text-brand-dark dark:text-[#E3E3E3] font-[400] leading-5 italic">
                  "The portal makes managing my family's appointments so simple.
                  Everything is in one place."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-[12px] bg-[#D4E6E5] dark:bg-[#1e2d2d] text-[#516161] dark:text-[#A5AAB5] flex items-center justify-center font-bold text-sm shrink-0">
                    LC
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-dark dark:text-white">
                      Lisa Chen
                    </div>
                    <div className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] tracking-[0.5px] uppercase">
                      Patient
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="w-full min-h-[237px] bg-[#EFF4FF] dark:bg-[#122338] border border-[#C2C7D1]/10 dark:border-[#22354A]/50 rounded-[16px] p-6 sm:p-8 flex flex-col justify-between gap-4">
                <div className="flex gap-1 text-brand-blue dark:text-[#5F9EA0]">
                  {[...Array(5)].map((_, i) => (
                    <Award
                      key={i}
                      className="w-4 h-4 fill-brand-blue dark:fill-[#5F9EA0] text-brand-blue dark:text-[#5F9EA0]"
                    />
                  ))}
                </div>
                <p className="text-sm text-brand-dark dark:text-[#E3E3E3] font-[400] leading-5 italic">
                  "Expert care and a very clean facility. The cardiology team at
                  Clinq is truly world-class."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-[12px] bg-[#E0E3E5] dark:bg-[#2c2f30] text-[#313436] dark:text-[#A5AAB5] flex items-center justify-center font-bold text-sm shrink-0">
                    JM
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-dark dark:text-white">
                      James Miller
                    </div>
                    <div className="text-[10px] text-[#42474F] dark:text-[#A5AAB5] tracking-[0.5px] uppercase">
                      Patient
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============== SERVICES/ADVANCED TOOLS SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-12 md:py-[68px] px-6 md:px-16 flex justify-center border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
            {/* Left list details */}
            <div className="w-full md:w-[544px] flex flex-col items-start gap-6 md:gap-8">
              <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px] text-left">
                Advanced tools for our internal medical standards.
              </h2>
              <dl className="flex flex-col gap-6 w-full">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#EFF4FF] dark:bg-[#1E2D4A] text-brand-blue dark:text-[#5F9EA0] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <dd className="text-sm sm:text-base font-[500] text-brand-dark dark:text-[#E3E3E3]">
                    State-of-the-art diagnostic equipment for precise testing.
                  </dd>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#EFF4FF] dark:bg-[#1E2D4A] text-brand-blue dark:text-[#5F9EA0] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <dd className="text-sm sm:text-base font-[500] text-brand-dark dark:text-[#E3E3E3]">
                    Comprehensive digital medical records available instantly.
                  </dd>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#EFF4FF] dark:bg-[#1E2D4A] text-brand-blue dark:text-[#5F9EA0] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <dd className="text-sm sm:text-base font-[500] text-brand-dark dark:text-[#E3E3E3]">
                    Integrated telehealth platform for remote consultation.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right clinical dashboard mockup */}
            <div className="w-full md:w-auto flex justify-center">
              <img
                src="/advanced-tool.svg"
                alt="clinq advanced diagnostic tools"
                className="max-w-[320px] sm:max-w-[400px] md:max-w-none w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* =============== FAQ SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-16 md:py-[128px] px-6 sm:px-12 md:px-24 lg:px-[256px] flex justify-center border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[768px] flex flex-col gap-12 md:gap-16">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px]">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-[#42474F] dark:text-[#A5AAB5] leading-6 max-w-sm">
                Get quick answers about Clinq features.
              </p>
            </div>

            {/* Accordion container */}
            <div className="flex flex-col gap-4 w-full">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-[#EFF4FF] dark:bg-[#122338] border border-[#C2C7D1]/10 dark:border-[#22354A]/50 rounded-lg overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-[24px] flex items-center justify-between text-left font-[700] text-base text-brand-blue dark:text-[#5F9EA0] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-dark dark:text-[#A5AAB5] transition-transform shrink-0 ${
                        activeFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-6 text-sm text-[#42474F] dark:text-[#A5AAB5] leading-6 animate-fade-in font-[400] border-t border-[#C2C7D1]/5 dark:border-[#22354A]/30 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============== NUMERIC BANNER HIGHLIGHTS SECTION =============== */}
        <section className="w-full bg-[#0F4C81] dark:bg-[#122338] py-16 md:py-[128px] px-6 md:px-16 flex justify-center text-white transition-colors duration-300">
          <div className="w-full max-w-[1024px] flex flex-col gap-12 md:gap-20">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-white tracking-[-0.32px] max-w-md">
                By the numbers.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-[36px] font-[800] leading-10 opacity-40">
                  01
                </div>
                <h4 className="text-xl sm:text-2xl font-[600] text-white dark:text-[#5F9EA0]">
                  Active Specialists
                </h4>
                <p className="text-xs sm:text-sm text-white/70 dark:text-[#A7ABB5] leading-5">
                  Over 50+ board-certified medical experts across 12
                  departments.
                </p>
              </div>

              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-[36px] font-[800] leading-10 opacity-40">
                  02
                </div>
                <h4 className="text-xl sm:text-2xl font-[600] text-white dark:text-[#5F9EA0]">
                  Total Consultations
                </h4>
                <p className="text-xs sm:text-sm text-white/70 dark:text-[#A7ABB5] leading-5">
                  Over 10,000+ completed check-ins and successful treatments.
                </p>
              </div>

              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-[36px] font-[800] leading-10 opacity-40">
                  03
                </div>
                <h4 className="text-xl sm:text-2xl font-[600] text-white dark:text-[#5F9EA0]">
                  Satisfaction Rate
                </h4>
                <p className="text-xs sm:text-sm text-white/70 dark:text-[#A7ABB5] leading-5">
                  99.4% patient satisfaction rating across all clinical
                  feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =============== HEALTH RESOURCES / BLOG SECTION =============== */}
        <section className="w-full bg-[#F8F9FF] dark:bg-[#0D1C2E] py-16 md:py-[128px] px-6 md:px-16 flex justify-center border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 md:gap-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
              <div>
                <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px]">
                  Health Resources
                </h2>
                <p className="text-sm sm:text-base text-[#42474F] dark:text-[#A7ABB5] mt-2">
                  Stay informed with our latest news and wellness articles.
                </p>
              </div>
              <Link
                href="/resources"
                className="text-sm sm:text-base font-[700] text-brand-blue dark:text-[#5F9EA0] flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Blog Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {blogPosts.map((blog) => (
                <article
                  key={blog.id}
                  className="w-full min-h-[390px] flex flex-col gap-3 pb-1"
                >
                  <div className="w-full h-[204px] bg-[#E6EEFF] dark:bg-[#122338] rounded-lg relative overflow-hidden flex flex-col justify-end p-4 shadow-sm border border-[#C2C7D1]/10 dark:border-[#22354A]/30">
                    {blog.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={blog.image_url} 
                        alt={blog.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      // Mock illustration inside placeholder
                      <div className="w-full h-24 flex items-center justify-center text-brand-blue dark:text-[#5F9EA0] opacity-40">
                        <ClipboardCheck className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#EFF4FF] dark:bg-[#122338] border border-brand-blue/15 dark:border-[#5F9EA0]/30 text-brand-blue dark:text-[#5F9EA0] font-[700] text-[10px] tracking-[1px] uppercase px-2 py-0.5 rounded-[2px] z-10">
                      {blog.category}
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-[600] text-brand-blue dark:text-white mt-2 leading-8">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-[#42474F] dark:text-[#A5AAB5] leading-5">
                    {blog.description}
                  </p>
                  <Link
                    href={`/resources/${blog.id}`}
                    className="text-xs font-[700] text-brand-blue dark:text-[#5F9EA0] mt-auto hover:underline"
                  >
                    Read More
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =============== CARDIOLOGY TESTIMONIAL QUOTE SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-16 md:py-[128px] px-6 sm:px-12 md:px-24 lg:px-[256px] flex justify-center transition-colors duration-300">
          <div className="w-full max-w-[768px] flex flex-col items-center gap-6 md:gap-8">
            <div className="text-brand-blue dark:text-[#5F9EA0] opacity-30">
              <span className="text-4xl sm:text-6xl font-serif">“</span>
            </div>

            <blockquote className="text-lg sm:text-xl md:text-[24px] md:leading-[39px] font-[600] text-brand-blue dark:text-[#EFF4FF] text-center max-w-[630px]">
              "Expert care and a very clean facility. The cardiology team at
              Clinq is truly world-class."
            </blockquote>

            <div className="text-center font-sans">
              <cite className="text-base font-[700] text-brand-dark dark:text-white not-italic block">
                Dr. Arya Sharma
              </cite>
              <span className="text-xs sm:text-sm font-[400] text-[#42474F] dark:text-[#A7ABB5] block mt-1">
                Senior Cardiologist
              </span>
            </div>
          </div>
        </section>

        {/* =============== FIND YOUR SPECIALIST SECTION =============== */}
        <section
          id="specialists-section"
          className="w-full bg-[#EFF4FF] dark:bg-[#122338] py-16 md:py-[128px] px-6 md:px-16 flex justify-center transition-colors duration-300"
        >
          <div className="w-full max-w-[1152px] flex flex-col gap-12 md:gap-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px]">
                Find Your Specialist
              </h2>
              <p className="text-sm sm:text-base text-[#42474F] dark:text-[#A5AAB5] leading-6 max-w-2xl">
                Search our verified Practitioner directory by clinical specialty
                or medical unit.
              </p>
            </div>

            {/* Unified Search and Pills Filter Container */}
            <div className="flex flex-col gap-8 w-full">
              {/* Search Bar Row */}
              <div className="w-full max-w-[640px] mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727780] dark:text-[#A7ABB5] w-[18px] h-[18px]" />
                <input
                  type="text"
                  placeholder="Search doctor names, specialties, or departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#0D1C2E] border border-[#C2C7D1]/30 dark:border-[#22354A] rounded-xl px-4 py-[14px] pl-12 text-sm text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-[#5F9EA0]/30 shadow-xs transition duration-200"
                />
              </div>

              {/* Department Pills Row */}
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-2 text-[#727780] dark:text-[#A7ABB5]">
                  <Stethoscope className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0] animate-pulse" />
                  <span className="text-xs font-[600] uppercase tracking-wider">Filter by Department</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 w-full max-w-[900px] mx-auto">
                  {/* "All" Pill */}
                  <button
                    onClick={() => setSelectedDeptId("all")}
                    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-[650] border transition duration-200 cursor-pointer select-none ${
                      selectedDeptId === "all"
                        ? "bg-brand-blue dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] border-brand-blue dark:border-[#5F9EA0] shadow-sm"
                        : "bg-white dark:bg-[#0D1C2E] text-brand-dark dark:text-[#A5AAB5] border-[#C2C7D1]/20 dark:border-[#22354A] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] hover:text-brand-blue dark:hover:text-white hover:border-brand-blue/20"
                    }`}
                  >
                    All Specialties
                  </button>

                  {/* Department specific Pills */}
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDeptId(dept.name)}
                      className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-[650] border transition duration-200 cursor-pointer select-none ${
                        selectedDeptId === dept.name
                          ? "bg-brand-blue dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] border-brand-blue dark:border-[#5F9EA0] shadow-sm"
                          : "bg-white dark:bg-[#0D1C2E] text-brand-dark dark:text-[#A5AAB5] border-[#C2C7D1]/20 dark:border-[#22354A] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] hover:text-brand-blue dark:hover:text-white hover:border-brand-blue/20"
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Specialists Grid Layout */}
            <div className="w-full">
              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                  {filteredDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-[#0D1C2E] border border-[#C2C7D1]/15 dark:border-[#22354A]/30 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-brand-blue/30 dark:hover:border-[#5F9EA0]/30 relative"
                    >
                      {/* Avatar Wrapper */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[24px] font-[700] shadow-sm relative overflow-hidden mb-4 shrink-0 border-2 border-[#EFF4FF] dark:border-[#1E2E40]">
                        {doc.image_url ? (
                          <img
                            src={doc.image_url}
                            alt={doc.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-blue/60 to-brand-blue dark:from-[#5F9EA0]/40 dark:to-[#5F9EA0] flex items-center justify-center text-white font-[700] text-xl">
                            {doc.initials || "MD"}
                          </div>
                        )}
                      </div>

                      {/* Doctor Info */}
                      <h4 className="text-base sm:text-[18px] leading-6 font-[750] text-[#0f3456] dark:text-[#EFF4FF] mb-1">
                        {doc.full_name}
                      </h4>
                      <span className="text-xs sm:text-sm text-[#727780] dark:text-[#A5AAB5] font-[450] mb-3">
                        {doc.specialty}
                      </span>
                      
                      {/* Department Badge */}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-[600] bg-[#EFF4FF] dark:bg-[#1E2E40] text-brand-blue dark:text-[#5F9EA0] border border-brand-blue/5 dark:border-[#1E2E40]/50 mb-6 shrink-0 uppercase tracking-wider">
                        {doc.department_name || "Specialist"}
                      </span>

                      {/* Book CTA */}
                      <Link
                        href="/patient/appointments/book"
                        className="w-full py-2.5 mt-auto bg-brand-blue dark:bg-[#5F9EA0] hover:bg-brand-blue/90 dark:hover:bg-[#5F9EA0]/95 text-white dark:text-[#0D1C2E] font-[700] text-xs sm:text-sm rounded-[6px] flex items-center justify-center gap-1.5 transition shadow-sm shrink-0"
                      >
                        Book Now
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center bg-white dark:bg-[#0D1C2E] border border-dashed border-[#C2C7D1]/40 dark:border-[#22354A]/30 rounded-xl w-full text-sm text-[#727780] dark:text-[#A5AAB5] flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EFF4FF] dark:bg-[#1E2D4A] text-brand-blue dark:text-[#5F9EA0] flex items-center justify-center">
                    <Search className="w-5 h-5 text-brand-blue dark:text-[#5F9EA0]" />
                  </div>
                  <div>
                    <h5 className="font-[750] text-brand-dark dark:text-white mb-1">No Specialists Found</h5>
                    <p className="max-w-md mx-auto text-xs sm:text-sm text-[#727780] dark:text-[#A7ABB5] leading-5">
                      No matching specialist records found in this category. Try adjusting your search query or choosing another department.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =============== MOBILE SECTION =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-16 md:py-[128px] px-6 md:px-16 flex justify-center border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
            {/* Left Phone Mockup Graphic */}
            <div className="w-full md:w-auto flex justify-center">
              <img
                src="/appointment-booked.svg"
                alt="clinq mobile appointment confirmation"
                className="max-w-[280px] sm:max-w-[360px] md:max-w-[#450px] w-full h-auto"
              />
            </div>

            {/* Right details */}
            <div className="w-full md:w-[534px] flex flex-col items-start gap-6 text-left">
              <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px]">
                Better care, Everytime.
              </h2>
              <p className="text-sm sm:text-base text-[#42474F] dark:text-[#A7ABB5] leading-6">
                Book appointment in just few clicks. Choose your doctor, pick a
                time that works for you and we’ll take care of the rest
              </p>

              <div className="flex flex-row items-start gap-4 pt-4 w-full sm:w-auto">
                <Link
                  href="/patient/appointments/book"
                  className="w-full sm:w-[144px] h-[48px] bg-brand-blue dark:bg-[#5F9EA0] hover:bg-brand-blue/90 dark:hover:bg-[#5F9EA0]/95 text-white dark:text-[#0D1C2E] font-[700] text-sm rounded-[4px] flex items-center justify-center transition shadow-sm"
                >
                  Book Now
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-[144px] h-[48px] border border-brand-blue dark:border-[#22354A] hover:bg-brand-bg-light dark:hover:bg-[#1E2E40] text-brand-blue dark:text-[#EFF4FF] font-[700] text-sm rounded-[4px] flex items-center justify-center transition"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =============== LOCATION & CAMPUS SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] dark:bg-[#122338] py-16 md:py-[128px] px-6 sm:px-12 md:px-16 flex justify-center transition-colors duration-300">
          <div className="w-full max-w-[1152px] bg-white dark:bg-[#0D1C2E] border border-[#C2C7D1]/10 dark:border-[#22354A]/30 rounded-[24px] shadow-sm p-6 sm:p-12 flex flex-col lg:flex-row items-center lg:justify-between gap-10 lg:gap-12 relative overflow-hidden">
            {/* Left address details */}
            <div className="w-full lg:w-[551px] flex flex-col justify-center items-start gap-6 relative z-10 text-left">
              <div className="flex items-start gap-2 h-7 bg-brand-blue/5 dark:bg-[#5F9EA0]/10 border border-brand-blue/10 dark:border-[#5F9EA0]/20 px-3 py-1 rounded">
                <MapPin className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0] shrink-0 my-auto animate-bounce" />
                <span className="text-[10px] uppercase font-bold text-brand-blue dark:text-[#5F9EA0] tracking-wider">
                  Clinq Hospital
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-[32px] font-[600] leading-10 text-brand-blue dark:text-white tracking-[-0.32px]">
                  Visit Our Hospital
                </h2>
                <p className="text-sm sm:text-base text-[#42474F] dark:text-[#A7ABB5] mt-4 leading-6">
                  Centrally located in the medical district, with 24/7 emergency
                  access and ample parking for patients and visitors.
                </p>
              </div>

              <dl className="flex flex-col gap-6 pt-2 w-full text-sm">
                <div className="flex flex-row items-start gap-4">
                  <div className="w-5 h-5 text-brand-blue dark:text-[#5F9EA0] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <dt className="font-[700] text-brand-dark dark:text-white text-sm sm:text-base">
                      Main Hospital Address
                    </dt>
                    <dd className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] mt-0.5">
                      123 Healthcare Blvd, Medical District
                    </dd>
                  </div>
                </div>

                <div className="flex flex-row items-start gap-4">
                  <div className="w-5 h-5 text-brand-blue dark:text-[#5F9EA0] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <dt className="font-[700] text-brand-dark dark:text-white text-sm sm:text-base">
                      Contact Telephone Line
                    </dt>
                    <dd className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] mt-0.5">
                      +1 (555) 019-2834
                    </dd>
                  </div>
                </div>

                <div className="flex flex-row items-start gap-4">
                  <div className="w-5 h-5 text-brand-blue dark:text-[#5F9EA0] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <dt className="font-[700] text-brand-dark dark:text-white text-sm sm:text-base">
                      Electronic Communications Mail
                    </dt>
                    <dd className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] mt-0.5">
                      info@clinq.healthcare
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Right Map Mockup Layout */}
            <div className="w-full sm:w-[450px] h-[300px] sm:h-[380px] bg-[#EFF4FF] dark:bg-[#122338] rounded-2xl relative overflow-hidden border border-[#C2C7D1]/10 dark:border-[#22354A]/30 shrink-0 shadow-inner flex items-center justify-center z-10">
              {mapLocation ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=14&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <>
                  {/* Grid map overlays */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00355F_1px,transparent_1px)] [background-size:16px_16px]" />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 dark:from-[#5F9EA0]/5 to-transparent pointer-events-none" />
                  {/* Pulsing home address marker */}
                  <div className="relative">
                    <span className="absolute -left-3 -top-3 w-10 h-10 bg-brand-blue/20 dark:bg-[#5F9EA0]/20 rounded-full animate-ping" />
                    <div className="w-4 h-4 bg-brand-blue dark:bg-[#5F9EA0] border-2 border-white dark:border-[#0D1C2E] rounded-full shadow relative z-10" />
                  </div>
                </>
              )}

              {/* Small location popup label */}
              <div className="absolute bottom-6 bg-white dark:bg-[#122338] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 px-3.5 py-2 rounded-lg shadow-sm text-center z-20">
                <div className="text-[10px] font-bold text-brand-blue dark:text-[#5F9EA0]">
                  {mapLocation?.name || "CLINQ MAIN HOSPITAL HQ"}
                </div>
                <div className="text-[8px] text-[#727780] dark:text-[#A7ABB5] font-sans font-[500] uppercase mt-0.5 tracking-wider">
                  24/7 Access Gateway
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <PublicFooter />
    </div>
  );
}
