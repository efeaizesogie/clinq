'use client';

import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import { 
  HeartPulse, Brain, Baby, Sparkles, Activity, Eye, Stethoscope,
  Search, ArrowRight, ChevronDown, ClipboardCheck, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

// Map icon_name strings from the database to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartPulse, Brain, Baby, Sparkles, Activity, Eye, Stethoscope,
  ClipboardCheck, ShieldCheck, Search,
};

function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || Stethoscope;
}

export default function DepartmentsPage() {
  const { data, isLoading } = usePlatformData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const departments = data?.departments ?? [];

  const filteredDepts = departments.filter(dept => {
    const matchesFilter = selectedFilter === 'All' || dept.category === selectedFilter;
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dept.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col items-center w-full bg-brand-bg-light dark:bg-[#0D1C2E] relative min-h-screen font-sans antialiased text-[#42474F] dark:text-[#A7ABB5] transition-colors duration-300">
      
      {/* Header NAVBAR */}
      <PublicNavbar />

      {/* Main departments portal body */}
      <main className="w-full bg-[#F8F9FF] dark:bg-[#0D1C2E] flex flex-col justify-start items-center relative pt-[81px] transition-colors duration-300">
        
        {/* =============== HERO SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] dark:bg-[#122338] py-16 md:py-[128px] px-6 md:px-16 border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 flex justify-center shrink-0 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col items-center justify-center gap-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-[48px] md:leading-[56px] font-[700] text-brand-blue dark:text-white tracking-[-0.96px]">
              Our Specialized Departments
            </h1>
            <p className="max-w-[672px] text-sm sm:text-base md:text-[18px] md:leading-[29px] font-[450] text-[#42474F] dark:text-[#A7ABB5]">
              Access world-class healthcare through our integrated departments. We combine
              cutting-edge technology with compassionate care to provide specialized
              treatments tailored to your needs.
            </p>
          </div>
        </section>

        {/* =============== SEARCH & GRID SECTION =============== */}
        <section className="w-full py-16 md:py-[128px] px-6 md:px-16 flex justify-center min-h-[824px] bg-[#F8F9FF] dark:bg-[#0D1C2E] transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 md:gap-16">
            
            {/* Search bar & Dropdown Filters row */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-8 min-h-[50px]">
              
              {/* Input Left */}
              <div className="w-full sm:w-[384px] h-[50px] relative">
                <Search className="absolute left-4 top-[16px] w-[18px] h-[18px] text-[#727780] dark:text-[#A7ABB5]" />
                <input 
                  type="text" 
                  placeholder="Search for a department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-12 pr-4 bg-[#F8F9FF] dark:bg-[#122338] border border-[#C2C7D1] dark:border-[#22354A]/30 rounded-[8px] text-[16px] leading-[22px] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition placeholder-[#6B7280]"
                />
              </div>

              {/* Custom Selector Dropdown Right */}
              <div className="relative z-30 w-full sm:w-[220px]">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-[50px] bg-white dark:bg-[#122338] border border-[#C2C7D1] rounded-[8px] px-4 flex justify-between items-center cursor-pointer text-sm font-[600] text-[#42474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                >
                  <span>{selectedFilter === 'All' ? 'All Care Categories' : selectedFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-[#727780] dark:text-[#A7ABB5] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-[56px] right-0 w-full sm:w-[220px] bg-white dark:bg-[#122338] border border-[#C2C7D1]/30 dark:border-[#22354A]/50 rounded-[8px] shadow-lg flex flex-col overflow-hidden">
                    {['All', 'Primary Care', 'Specialty', 'Clinical'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-xs font-[600] transition select-none cursor-pointer ${
                          selectedFilter === filter 
                            ? 'bg-[#E6EEFF] dark:bg-[#1E2D4A] text-brand-blue dark:text-[#5F9EA0] font-[700]' 
                            : 'text-brand-dark dark:text-white hover:bg-brand-bg-light dark:hover:bg-[#1E2D4A] font-[500]'
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
                    className="bg-white dark:bg-[#122338] border border-[#C2C7D1]/50 dark:border-[#22354A]/30 rounded-[8px] p-6 sm:p-8 flex flex-col gap-3 min-h-[343px] shadow-sm hover:shadow-md transition duration-200"
                  >
                    {/* Icon Block */}
                    {(() => { const Icon = getIcon(dept.icon_name); return (
                    <div className="w-[56px] h-[56px] bg-[#E6EEFF] dark:bg-[#0D1C2E]/40 rounded-[4px] flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 text-brand-blue dark:text-[#5F9EA0]" />
                    </div>
                    ); })()}

                    {/* Title */}
                    <h3 className="text-[24px] leading-[32px] font-[600] text-brand-blue dark:text-white pt-3 text-left">
                      {dept.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-[16px] sm:leading-[24px] font-[400] text-[#42474F] dark:text-[#A7ABB5] min-h-[72px] overflow-hidden ellipsis text-left">
                      {dept.description}
                    </p>

                    {/* Divider and Details Row */}
                    <div className="border-t border-[#C2C7D1]/30 dark:border-[#22354A]/30 pt-6 mt-auto flex justify-between items-center text-xs w-full">
                      
                      {/* Dr. count */}
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-[600] text-[#516161] dark:text-[#A7ABB5] tracking-[0.6px] uppercase">
                          {dept.doctors_count} DOCTORS
                        </span>
                      </div>

                      {/* Explore Link */}
                      <Link 
                        href={`/departments/${dept.name.toLowerCase()}`}
                        className="flex items-center gap-1 font-[700] text-[16px] text-brand-blue dark:text-[#5F9EA0] hover:text-brand-blue/80 dark:hover:text-[#5F9EA0]/80 transition"
                      >
                        Explore <ArrowRight className="w-4 h-4" />
                      </Link>

                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 md:col-span-3 py-16 text-center text-brand-muted dark:text-[#A7ABB5] bg-white dark:bg-[#122338] border border-dashed border-[#C2C7D1]/30 dark:border-[#22354A]/30 rounded-lg">
                  No matching clinics found under this category.
                </div>
              )}
            </div>

          </div>
        </section>

        {/* =============== CTA HOTLINE BANNER =============== */}
        <section className="w-full bg-[#00355F] dark:bg-[#122338] py-16 md:py-20 px-6 md:px-16 flex justify-center text-white shrink-0 border-t border-b border-blue-900/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-6 items-center text-center">
            
            <h2 className="text-xl sm:text-[24px] font-[600] text-white tracking-[-0.32px]">
              Need Immediate Assistance?
            </h2>

            <p className="text-sm sm:text-base text-white/80 dark:text-[#A7ABB5] leading-[28px] max-w-[588px]">
              Our central reception and emergency department are available 24/7 to guide you to the right specialist.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <a 
                href="tel:911"
                className="w-full sm:w-auto px-10 py-[17px] h-[58px] bg-white dark:bg-[#5F9EA0] text-brand-blue dark:text-[#0D1C2E] font-[700] text-[16px] leading-[24px] rounded-lg shadow-sm flex items-center justify-center hover:bg-white/90 dark:hover:bg-teal-50 transition"
              >
                Call Emergency 911
              </a>
              <Link 
                href="/support"
                className="w-full sm:w-auto px-10 py-4 h-[58px] bg-[#0F4C81]/40 dark:bg-transparent border border-white/30 dark:border-white/30 text-white dark:text-[#A7ABB5] font-[700] text-[16px] rounded-lg flex items-center justify-center hover:bg-white/5 transition"
              >
                Contact Us
              </Link>
            </div>

          </div>
        </section>

        {/* =============== GETTING READY FOR YOUR VISIT =============== */}
        <section className="w-full bg-white dark:bg-[#0D1C2E] py-16 md:py-20 px-6 md:px-16 flex justify-center border-t border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 items-center">
            
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-xl sm:text-[24px] font-[600] text-[#00355F] dark:text-white tracking-[-0.32px]">
                Preparing For Your Appointment
              </h2>
              <p className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] max-w-sm">
                Three simple steps to ensure a seamless checkout and consult experience at Clinq.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              
              {/* Step 1 */}
              <div className="bg-[#F8F9FF] dark:bg-[#122338] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 rounded-lg p-6 sm:p-8 flex flex-col gap-3 min-h-[220px] text-left">
                <div className="w-8 h-8 rounded-lg bg-[#E6EEFF] dark:bg-[#0D1C2E]/40 text-brand-blue dark:text-brand-blue flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0]" />
                </div>
                <h3 className="text-base sm:text-lg font-[600] text-brand-blue dark:text-white mt-2">
                  1. Mapped Specialists
                </h3>
                <p className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] leading-5">
                  Verify credentials, check consulting details, and review pricing on practitioner slots.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#F8F9FF] dark:bg-[#122338] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 rounded-lg p-6 sm:p-8 flex flex-col gap-3 min-h-[220px] text-left">
                <div className="w-8 h-8 rounded-lg bg-[#E6EEFF] dark:bg-[#0D1C2E]/40 text-brand-blue dark:text-brand-blue flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0]" />
                </div>
                <h3 className="text-base sm:text-lg font-[600] text-brand-blue dark:text-white mt-2">
                  2. Reserve Slot
                </h3>
                <p className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] leading-5">
                  Confirm your appointment timing, check HMO co-pay amounts, and lock in session slots.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#F8F9FF] dark:bg-[#122338] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 rounded-lg p-6 sm:p-8 flex flex-col gap-3 min-h-[220px] text-left">
                <div className="w-8 h-8 rounded-lg bg-[#E6EEFF] dark:bg-[#0D1C2E]/40 text-brand-blue dark:text-brand-blue flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0]" />
                </div>
                <h3 className="text-base sm:text-lg font-[600] text-brand-blue dark:text-white mt-2">
                  3. Digital Check-in
                </h3>
                <p className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] leading-5">
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
