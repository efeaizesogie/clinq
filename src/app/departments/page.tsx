'use client';

import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { 
  HeartPulse, Brain, Baby, Sparkles, Activity, Eye, 
  Search, ArrowRight, ChevronDown, ClipboardCheck, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface DeptItem {
  id: string;
  name: string;
  category: string;
  description: string;
  doctorsCount: number;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const departments: DeptItem[] = [
    {
      id: '1',
      name: 'Cardiology',
      category: 'Specialty',
      description: 'Comprehensive heart care including diagnostic screenings, interventional procedures, and advanced cardiac…',
      doctorsCount: 5,
      icon: HeartPulse
    },
    {
      id: '2',
      name: 'Neurology',
      category: 'Specialty',
      description: 'Expert diagnosis and treatment for disorders of the nervous system, specializing in complex neurological…',
      doctorsCount: 4,
      icon: Brain
    },
    {
      id: '3',
      name: 'Pediatrics',
      category: 'Primary Care',
      description: 'Dedicated care for infants, children, and adolescents, focusing on physical growth, developmental milestones, and…',
      doctorsCount: 6,
      icon: Baby
    },
    {
      id: '4',
      name: 'Dermatology',
      category: 'Clinical',
      description: 'Advanced skincare solutions ranging from medical dermatology for chronic conditions to state-of-the-art cosmetic',
      doctorsCount: 3,
      icon: Sparkles
    },
    {
      id: '5',
      name: 'Orthopedics',
      category: 'Specialty',
      description: 'Specialized care for bones, joints, ligaments, tendons, and muscles, including joint replacement surgeries…',
      doctorsCount: 5,
      icon: Activity
    },
    {
      id: '6',
      name: 'Ophthalmology',
      category: 'Clinical',
      description: 'Comprehensive eye care and surgical expertise for vision restoration, glaucoma treatment, and advanced…',
      doctorsCount: 4,
      icon: Eye
    }
  ];

  const filteredDepts = departments.filter(dept => {
    const matchesFilter = selectedFilter === 'All' || dept.category === selectedFilter;
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dept.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col items-center w-full bg-brand-bg-light relative min-h-screen font-sans antialiased text-[#42474F]">
      
      {/* Header NAVBAR */}
      <PublicNavbar />

      {/* Main departments portal body */}
      <main className="w-full bg-[#F8F9FF] flex flex-col justify-start items-center relative pt-[81px]">
        
        {/* =============== HERO SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] py-16 md:py-[128px] px-6 md:px-16 border-b border-[#C2C7D1]/10 flex justify-center shrink-0">
          <div className="w-full max-w-[1152px] flex flex-col items-center justify-center gap-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-[48px] md:leading-[56px] font-[700] text-brand-blue tracking-[-0.96px]">
              Our Specialized Departments
            </h1>
            <p className="max-w-[672px] text-sm sm:text-base md:text-[18px] md:leading-[29px] font-[450] text-[#42474F]">
              Access world-class healthcare through our integrated departments. We combine
              cutting-edge technology with compassionate care to provide specialized
              treatments tailored to your needs.
            </p>
          </div>
        </section>

        {/* =============== SEARCH & GRID SECTION =============== */}
        <section className="w-full py-16 md:py-[128px] px-6 md:px-16 flex justify-center min-h-[824px] bg-[#F8F9FF]">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 md:gap-16">
            
            {/* Search bar & Dropdown Filters row */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-8 min-h-[50px]">
              
              {/* Input Left */}
              <div className="w-full sm:w-[384px] h-[50px] relative">
                <Search className="absolute left-4 top-[16px] w-[18px] h-[18px] text-[#727780]" />
                <input 
                  type="text" 
                  placeholder="Search for a department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-12 pr-4 bg-[#F8F9FF] border border-[#C2C7D1] rounded-[8px] text-[16px] leading-[22px] text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition placeholder-[#6B7280]"
                />
              </div>

              {/* Custom Selector Dropdown Right */}
              <div className="relative z-30 w-full sm:w-[220px]">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-[50px] bg-white border border-[#C2C7D1] rounded-[8px] px-4 flex justify-between items-center cursor-pointer text-sm font-[600] text-[#42474F] focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                >
                  <span>{selectedFilter === 'All' ? 'All Care Categories' : selectedFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-[#727780] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-[56px] right-0 w-full sm:w-[220px] bg-white border border-[#C2C7D1]/30 rounded-[8px] shadow-lg flex flex-col overflow-hidden">
                    {['All', 'Primary Care', 'Specialty', 'Clinical'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-xs font-[600] transition select-none cursor-pointer ${
                          selectedFilter === filter 
                            ? 'bg-[#E6EEFF] text-brand-blue font-[700]' 
                            : 'text-brand-dark hover:bg-brand-bg-light font-[500]'
                        }`}
                      >
                        {filter === 'All' ? 'All Care Categories' : filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Dynamic Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
              {filteredDepts.length > 0 ? (
                filteredDepts.map((dept) => (
                  <div 
                    key={dept.id}
                    className="bg-white border border-[#C2C7D1]/50 rounded-[8px] p-6 sm:p-8 flex flex-col gap-3 min-h-[343px] shadow-sm hover:shadow-md transition duration-200"
                  >
                    {/* Icon Block */}
                    <div className="w-[56px] h-[56px] bg-[#E6EEFF] rounded-[4px] flex items-center justify-center shrink-0">
                      <dept.icon className="w-7 h-7 text-brand-blue" />
                    </div>

                    {/* Title */}
                    <h3 className="text-[24px] leading-[32px] font-[600] text-brand-blue pt-3 text-left">
                      {dept.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-[16px] sm:leading-[24px] font-[400] text-[#42474F] min-h-[72px] overflow-hidden ellipsis text-left">
                      {dept.description}
                    </p>

                    {/* Divider and Details Row */}
                    <div className="border-t border-[#C2C7D1]/30 pt-6 mt-auto flex justify-between items-center text-xs w-full">
                      
                      {/* Dr. count */}
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-[600] text-[#516161] tracking-[0.6px] uppercase">
                          {dept.doctorsCount} DOCTORS
                        </span>
                      </div>

                      {/* Explore Link */}
                      <Link 
                        href={`/departments/${dept.name.toLowerCase()}`}
                        className="flex items-center gap-1 font-[700] text-[16px] text-brand-blue hover:text-brand-blue/80 transition"
                      >
                        Explore <ArrowRight className="w-4 h-4" />
                      </Link>

                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 md:col-span-3 py-16 text-center text-brand-muted bg-white border border-dashed border-[#C2C7D1]/30 rounded-lg">
                  No matching clinics found under this category.
                </div>
              )}
            </div>

          </div>
        </section>

        {/* =============== CTA HOTLINE BANNER =============== */}
        <section className="w-full bg-[#00355F] py-16 md:py-20 px-6 md:px-16 flex justify-center text-white shrink-0">
          <div className="w-full max-w-[1152px] flex flex-col gap-6 items-center text-center">
            
            <h2 className="text-xl sm:text-[24px] font-[600] text-white tracking-[-0.32px]">
              Need Immediate Assistance?
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-[28px] max-w-[588px]">
              Our central reception and emergency department are available 24/7 to guide you to the right specialist.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <a 
                href="tel:911"
                className="w-full sm:w-auto px-10 py-[17px] h-[58px] bg-white text-brand-blue font-[700] text-[16px] leading-[24px] rounded-lg shadow-sm flex items-center justify-center hover:bg-white/90 transition"
              >
                Call Emergency 911
              </a>
              <Link 
                href="/support"
                className="w-full sm:w-auto px-10 py-4 h-[58px] bg-[#0F4C81]/40 border border-white/30 text-white font-[700] text-[16px] rounded-lg flex items-center justify-center hover:bg-white/5 transition"
              >
                Contact Us
              </Link>
            </div>

          </div>
        </section>

        {/* =============== GETTING READY FOR YOUR VISIT =============== */}
        <section className="w-full bg-white py-16 md:py-20 px-6 md:px-16 flex justify-center border-t border-b border-[#C2C7D1]/10">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 items-center">
            
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-xl sm:text-[24px] font-[600] text-[#00355F] tracking-[-0.32px]">
                Preparing For Your Appointment
              </h2>
              <p className="text-xs sm:text-sm text-[#42474F] max-w-sm">
                Three simple steps to ensure a seamless checkout and consult experience at Clinq.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              
              {/* Step 1 */}
              <div className="bg-[#F8F9FF] border border-[#C2C7D1]/20 rounded-lg p-6 sm:p-8 flex flex-col gap-3 min-h-[220px] text-left">
                <div className="w-8 h-8 rounded-lg bg-[#E6EEFF] text-brand-blue flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-brand-blue" />
                </div>
                <h3 className="text-base sm:text-lg font-[600] text-brand-blue mt-2">
                  1. Mapped Specialists
                </h3>
                <p className="text-xs sm:text-sm text-[#42474F] leading-5">
                  Verify credentials, check consulting details, and review pricing on practitioner slots.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#F8F9FF] border border-[#C2C7D1]/20 rounded-lg p-6 sm:p-8 flex flex-col gap-3 min-h-[220px] text-left">
                <div className="w-8 h-8 rounded-lg bg-[#E6EEFF] text-brand-blue flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-brand-blue" />
                </div>
                <h3 className="text-base sm:text-lg font-[600] text-brand-blue mt-2">
                  2. Reserve Slot
                </h3>
                <p className="text-xs sm:text-sm text-[#42474F] leading-5">
                  Confirm your appointment timing, check HMO co-pay amounts, and lock in session slots.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#F8F9FF] border border-[#C2C7D1]/20 rounded-lg p-6 sm:p-8 flex flex-col gap-3 min-h-[220px] text-left">
                <div className="w-8 h-8 rounded-lg bg-[#E6EEFF] text-brand-blue flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-brand-blue" />
                </div>
                <h3 className="text-base sm:text-lg font-[600] text-brand-blue mt-2">
                  3. Digital Check-in
                </h3>
                <p className="text-xs sm:text-sm text-[#42474F] leading-5">
                  Complete registration and health details in your patient portal to bypass physical wait queues.
                </p>
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
