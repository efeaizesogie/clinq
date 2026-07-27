'use client';

import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import type { Specialist } from '@/lib/types';
import { 
  Search, ChevronDown, Star, Calendar, 
  Grid, List, Check, HeartPulse
} from 'lucide-react';
import Link from 'next/link';

export default function SpecialistsPage() {
  const { data, isLoading } = usePlatformData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedAvailability, setSelectedAvailability] = useState('Any Availability');
  
  const [activePage, setActivePage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isAvailDropdownOpen, setIsAvailDropdownOpen] = useState(false);
  
  // Book Appointment dialog state
  const [bookingDoctor, setBookingDoctor] = useState<Specialist | null>(null);
  const [bookingStep, setBookingStep] = useState(1);

  const specialists = data?.specialists ?? [];
  const departments = data?.departments ?? [];

  // Build unique department names for the dropdown filter
  const departmentNames = ['All Departments', ...departments.map(d => d.name)];

  const filteredSpecialists = specialists.filter(doc => {
    const matchesSearch = doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const deptName = doc.department_name || '';
    const matchesDept = selectedDept === 'All Departments' || deptName === selectedDept;

    let matchesAvailability = true;
    if (selectedAvailability === 'Available Today') {
      matchesAvailability = doc.is_available === true;
    }

    return matchesSearch && matchesDept && matchesAvailability;
  });

  const handleBookClick = (doc: Specialist) => {
    setBookingDoctor(doc);
    setBookingStep(1);
  };

  const confirmBooking = () => {
    setBookingStep(2);
  };

  return (
    <div className="flex flex-col items-center w-full bg-brand-bg-light relative min-h-screen font-sans antialiased text-[#42474F]">
      
      {/* Header NAVBAR */}
      <PublicNavbar />

      {/* Main portal body */}
      <main className="w-full bg-[#F8F9FF] flex flex-col justify-start items-center relative pt-[81px]">
        
        {/* =============== HERO SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] py-16 md:py-[128px] px-6 md:px-16 flex justify-center items-center relative overflow-hidden">
          
          {/* Right Decorative Graphic */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center opacity-10 pointer-events-none">
            <HeartPulse className="w-[333px] h-[333px] text-brand-blue" />
          </div>

          <div className="w-full max-w-[1152px] flex flex-col items-start gap-6 text-left relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-[48px] md:leading-[56px] font-[700] text-brand-blue tracking-[-0.96px] max-w-[672px]">
              World-Class Medical Specialists
            </h1>
            <p className="max-w-[672px] text-sm sm:text-base md:text-[18px] md:leading-[29px] font-[450] text-[#42474F]">
              Our institution brings together the brightest minds in medicine. From pioneering surgeons to compassionate therapists, explore our directory of board-certified specialists dedicated to your well-being.
            </p>
          </div>
        </section>

        {/* =============== SEARCH & DOUBLE FILTERS BAR =============== */}
        <section className="w-full bg-white/95 border-b border-[#C2C7D1]/30 backdrop-blur-[6px] py-4 md:py-[24px] px-6 md:px-16 flex justify-center sticky top-[81px] z-30 shrink-0">
          <div className="w-full max-w-[1152px] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 h-full">
            
            {/* Search Input Left */}
            <div className="w-full md:w-auto md:flex-1 h-[50px] relative">
              <Search className="absolute left-4 top-[16px] w-[18px] h-[18px] text-[#727780]" />
              <input 
                type="text" 
                placeholder="Search by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full pl-12 pr-4 bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] text-[16px] text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/20 placeholder-[#6B7280]"
              />
            </div>

            {/* Department dropdown selector */}
            <div className="relative w-full md:w-auto">
              <button 
                onClick={() => {
                  setIsDeptDropdownOpen(!isDeptDropdownOpen);
                  setIsAvailDropdownOpen(false);
                }}
                className="w-full md:w-[276px] h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 flex justify-between items-center text-[16px] font-[400] text-brand-dark cursor-pointer focus:outline-none"
              >
                <span>{selectedDept}</span>
                <ChevronDown className="w-[12px] h-[12px] text-[#727780]" />
              </button>

              {isDeptDropdownOpen && (
                <div className="absolute top-[56px] left-0 w-full md:w-[276px] bg-white border border-[#C2C7D1]/30 rounded-[4px] shadow-lg flex flex-col z-50">
                  {departmentNames.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDept(dept);
                        setIsDeptDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-xs font-[500] text-brand-dark hover:bg-brand-bg-light transition cursor-pointer select-none"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Availability dropdown selector */}
            <div className="relative w-full md:w-auto">
              <button 
                onClick={() => {
                  setIsAvailDropdownOpen(!isAvailDropdownOpen);
                  setIsDeptDropdownOpen(false);
                }}
                className="w-full md:w-[276px] h-[50px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] px-4 flex justify-between items-center text-[16px] font-[400] text-brand-dark cursor-pointer focus:outline-none"
              >
                <span>{selectedAvailability === 'Any Availability' ? 'Availability' : selectedAvailability}</span>
                <ChevronDown className="w-[12px] h-[12px] text-[#727780]" />
              </button>

              {isAvailDropdownOpen && (
                <div className="absolute top-[56px] left-0 w-full md:w-[276px] bg-white border border-[#C2C7D1]/30 rounded-[4px] shadow-lg flex flex-col z-50">
                  {['Any Availability', 'Available Today'].map((avail) => (
                    <button
                      key={avail}
                      onClick={() => {
                        setSelectedAvailability(avail);
                        setIsAvailDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-xs font-[500] text-brand-dark hover:bg-brand-bg-light transition cursor-pointer select-none"
                    >
                      {avail}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* =============== GRID TITLE / VIEW MODE TOGGLES =============== */}
        <section className="w-full pt-12 md:pt-20 pb-4 px-6 md:px-16 flex justify-center bg-[#F8F9FF]">
          <div className="w-full max-w-[1152px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C2C7D1]/30 pb-4 min-h-10">
            
            <h2 className="text-2xl sm:text-[32px] font-[600] text-brand-blue tracking-[-0.32px] text-left">
              Found {filteredSpecialists.length} Specialists
            </h2>

            {/* Grid/List layout toggle triggers */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 border rounded-sm flex items-center justify-center transition cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'border-brand-blue bg-[#EFF4FF] text-brand-blue' 
                    : 'border-[#C2C7D1] text-[#516161] hover:bg-white'
                }`}
              >
                <Grid className="w-[18px] h-[18px]" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`w-9 h-9 border rounded-sm flex items-center justify-center transition cursor-pointer ${
                  viewMode === 'list' 
                    ? 'border-brand-blue bg-[#EFF4FF] text-brand-blue' 
                    : 'border-[#C2C7D1] text-[#516161] hover:bg-white'
                }`}
              >
                <List className="w-[18px] h-[14px]" />
              </button>
            </div>

          </div>
        </section>

        {/* =============== DOCTORS LIST DIRECTORY GRID =============== */}
        <section className="w-full pb-16 md:pb-20 px-6 md:px-16 justify-center bg-[#F8F9FF] flex min-h-[582px]">
          <div className="w-full max-w-[1152px]">
            {filteredSpecialists.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
                  : "flex flex-col gap-6 w-full"
              }>
                {filteredSpecialists.map((doc) => (
                  <div 
                    key={doc.id}
                    className={`bg-white border border-[#C2C7D1]/30 rounded-lg overflow-hidden shadow-sm flex transition duration-200 ${
                      viewMode === 'grid' 
                        ? 'flex-col w-full min-h-[582px]' 
                        : 'flex-col sm:flex-row w-full min-h-[240px]'
                    }`}
                  >
                    
                    {/* Visual Graphic Block (Fills top/left) */}
                    <div className={`relative bg-gradient-to-br ${doc.color_grad} flex items-center justify-center shrink-0 ${
                      viewMode === 'grid' ? 'w-full h-[256px]' : 'w-full sm:w-[240px] h-[200px] sm:h-auto'
                    }`}>
                      
                      {/* Doctor Initials */}
                      <span className="text-white text-5xl font-extrabold tracking-tight select-none">
                        {doc.initials}
                      </span>
                      
                      {/* Availability status badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1 flex items-center gap-1 rounded-full text-xs font-[600] tracking-[0.6px] uppercase ${
                        doc.is_available 
                          ? 'bg-[#D4E6E5] text-[#576867]' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${doc.is_available ? 'bg-[#576867]' : 'bg-amber-500'}`} />
                        <span>{doc.availability_text}</span>
                      </div>

                    </div>

                    {/* Information detail context */}
                    <div className={`flex flex-col justify-between p-6 flex-1 gap-4`}>
                      
                      {/* Top title area */}
                      <div className="flex flex-col gap-1 text-left">
                        <h3 className="text-[18px] leading-[32px] font-[600] text-brand-blue">
                          {doc.full_name}
                        </h3>
                        <p className="text-sm font-[450] text-[#516161]">
                          {doc.specialty}
                        </p>
                      </div>

                      {/* Middle experience indicators row */}
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 bg-[#EFF4FF] rounded p-2 text-center">
                          <div className="text-[10px] uppercase font-[600] tracking-[0.6px] text-[#727780]">
                            EXPERIENCE
                          </div>
                          <div className="text-sm sm:text-base font-[700] text-brand-blue mt-1">
                            {doc.experience}
                          </div>
                        </div>

                        <div className="flex-1 bg-[#EFF4FF] rounded p-2 text-center">
                          <div className="text-[10px] uppercase font-[600] tracking-[0.6px] text-[#727780]">
                            RATING
                          </div>
                          <div className="text-sm sm:text-base font-[700] text-brand-blue flex items-center justify-center gap-1 mt-1">
                            <Star className="w-3.5 h-3.5 fill-[#00355F] text-[#00355F]" /> {doc.rating}
                          </div>
                        </div>
                      </div>

                      {/* Biography synopsis */}
                      <p className="text-sm text-[#42474F] leading-5 h-[40px] overflow-hidden ellipsis text-left">
                        {doc.bio}
                      </p>

                      {/* Action book button */}
                      <button 
                        onClick={() => handleBookClick(doc)}
                        className="w-full h-12 bg-brand-blue hover:bg-brand-blue/95 text-white font-[500] text-[16px] rounded flex items-center justify-center gap-2 mt-2 transition cursor-pointer select-none"
                      >
                        <Calendar className="w-4.5 h-5 text-white animate-pulse" />
                        <span>Book Appointment</span>
                      </button>

                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 py-16 text-center text-brand-muted bg-white border border-dashed border-[#C2C7D1]/30 rounded-lg">
                No matching specialists found in this category.
              </div>
            )}
          </div>
        </section>

        {/* =============== NUMERIC DIRECTORY PAGINATION =============== */}
        {filteredSpecialists.length > 0 && (
          <section className="w-full pb-16 md:pb-[128px] px-6 md:px-16 flex justify-center bg-[#F8F9FF]">
            <div className="w-full max-w-[1152px] flex flex-wrap justify-center items-center gap-2 sm:gap-4 h-auto border-t border-[#C2C7D1]/20 pt-8">
              
              {/* Back trigger */}
              <button 
                onClick={() => setActivePage(1)}
                className="w-10 h-10 border border-[#C2C7D1] rounded-xl flex items-center justify-center text-[#516161] hover:bg-white transition cursor-pointer disabled:opacity-50"
                disabled={activePage === 1}
              >
                <span>&lt;</span>
              </button>

              {/* Page 1 */}
              <button 
                onClick={() => setActivePage(1)}
                className={`w-10 h-10 rounded-xl font-[500] flex items-center justify-center transition cursor-pointer ${
                  activePage === 1 
                    ? 'bg-brand-blue text-white' 
                    : 'border border-[#C2C7D1] text-[#516161] hover:bg-white'
                }`}
              >
                1
              </button>

              {/* Page 2 */}
              <button 
                onClick={() => setActivePage(2)}
                className={`w-10 h-10 rounded-xl font-[500] flex items-center justify-center transition cursor-pointer ${
                  activePage === 2 
                    ? 'bg-brand-blue text-white' 
                    : 'border border-[#C2C7D1] text-[#516161] hover:bg-white'
                }`}
              >
                2
              </button>

              {/* Page 3 */}
              <button 
                onClick={() => setActivePage(3)}
                className={`w-10 h-10 rounded-xl font-[500] flex items-center justify-center transition cursor-pointer ${
                  activePage === 3 
                    ? 'bg-brand-blue text-white' 
                    : 'border border-[#C2C7D1] text-[#516161] hover:bg-white'
                }`}
              >
                3
              </button>

              <span className="text-[#727780] tracking-wide select-none">...</span>

              {/* Forward trigger */}
              <button 
                onClick={() => setActivePage(3)}
                className="w-10 h-10 border border-[#C2C7D1] rounded-xl flex items-center justify-center text-[#516161] hover:bg-white transition cursor-pointer disabled:opacity-50"
                disabled={activePage === 3}
              >
                <span>&gt;</span>
              </button>

            </div>
          </section>
        )}

        {/* =============== FLOATING CAN'T FIND SPECIALIST CTA CARD =============== */}
        <section className="w-full bg-[#F8F9FF] pb-16 md:pb-[128px] px-6 md:px-16 flex justify-center">
          <div className="w-full max-w-[1152px] bg-[#00355F] rounded-2xl py-12 px-6 sm:px-16 lg:px-[80px] flex flex-col lg:flex-row justify-between items-stretch lg:items-center text-white min-h-[362px] gap-10 lg:gap-[54.9px] shadow-lg">
            
            {/* Context Left */}
            <div className="flex flex-col gap-4 w-full lg:max-w-[570px] text-left">
              <h2 className="text-xl sm:text-[24px] font-[600] text-white tracking-[-0.32px] uppercase">
                Can't find the right specialist?
              </h2>
              <p className="text-sm sm:text-base text-blue-100 leading-[28px] w-full lg:max-w-[510px]">
                Our patient coordinators are available 24/7 to help you find the perfect match for your specific medical needs and insurance provider.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
                <Link 
                  href="/chat"
                  className="w-full sm:w-auto px-8 py-[17px] h-[58px] bg-white text-brand-blue font-[700] text-[16px] rounded-[4px] shadow-sm flex items-center justify-center hover:bg-white/90 transition select-none"
                >
                  Chat With Us
                </Link>
                <Link 
                  href="/coordinator"
                  className="w-full sm:w-auto px-8 py-4 h-[58px] bg-transparent border border-white/30 text-white font-[700] text-[16px] rounded-[4px] flex items-center justify-center hover:bg-white/5 transition select-none"
                >
                  Request Assistance
                </Link>
              </div>
            </div>

            {/* Stats Right */}
            <div className="flex items-center justify-center gap-4 w-full lg:w-auto">
              
              {/* Stat 1 */}
              <div className="flex-1 sm:flex-none sm:w-[172.53px] h-[114px] bg-white/10 border border-white/20 backdrop-blur-[6px] rounded-lg p-6 flex flex-col gap-1 items-center justify-center text-center">
                <span className="text-[24px] font-[700] text-white leading-10">500+</span>
                <span className="text-[12px] sm:text-[14px] uppercase text-white/80 font-[400] tracking-[-0.7px]">SPECIALISTS</span>
              </div>

              {/* Stat 2 */}
              <div className="flex-1 sm:flex-none sm:w-[172.53px] h-[114px] bg-white/10 border border-white/20 backdrop-blur-[6px] rounded-lg p-6 flex flex-col gap-1 items-center justify-center text-center">
                <span className="text-[24px] font-[700] text-white leading-10">45</span>
                <span className="text-[12px] sm:text-[14px] uppercase text-white/80 font-[400] tracking-[-0.7px]">CLINICS</span>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Global Footer */}
      <PublicFooter />

      {/* =============== MODAL BOOKING DIALOG (UX Interaction) =============== */}
      {bookingDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[450px] mx-4 p-6 sm:p-8 flex flex-col gap-4 relative animate-scale-up">
            
            {/* Close */}
            <button 
              onClick={() => setBookingDoctor(null)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-dark text-xl font-bold cursor-pointer"
            >
              &times;
            </button>

            {bookingStep === 1 ? (
              <>
                <h3 className="text-lg sm:text-xl font-[600] text-brand-blue border-b border-[#C2C7D1]/30 pb-3 text-left">
                  Book with {bookingDoctor.full_name}
                </h3>
                
                <div className="flex items-center gap-3 bg-[#EFF4FF] p-3 rounded-lg border border-brand-blue/10">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bookingDoctor.color_grad} flex items-center justify-center text-white text-xs font-bold`}>
                    {bookingDoctor.initials}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-brand-dark">{bookingDoctor.full_name}</div>
                    <div className="text-[10px] text-[#516161]">{bookingDoctor.specialty}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 text-sm text-left">
                  <div>
                    <label className="block text-xs font-bold text-[#727780] uppercase mb-1">Select Consultation Day</label>
                    <select className="w-full h-[46px] border border-[#C2C7D1] rounded p-2 bg-white text-brand-dark focus:outline-none">
                      <option>Today, Afternoon Session</option>
                      <option>Tomorrow, Morning Session</option>
                      <option>Next available weekday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#727780] uppercase mb-1">HMO Provider</label>
                    <select className="w-full h-[46px] border border-[#C2C7D1] rounded p-2 bg-white text-brand-dark focus:outline-none">
                      <option>Gold Cross HMO</option>
                      <option>Aetna Health</option>
                      <option>Universal Assurance</option>
                      <option>Direct Co-Pay (No HMO)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={confirmBooking}
                  className="w-full h-12 bg-brand-blue hover:bg-brand-blue/95 text-white font-[700] rounded mt-4 cursor-pointer select-none"
                >
                  Confirm Appointment
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold select-none">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <h3 className="text-xl font-[600] text-brand-blue">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-[#42474F] max-w-[280px]">
                  Your request has been logged successfully. An officer will notify you of details shortly.
                </p>
                <button 
                  onClick={() => setBookingDoctor(null)}
                  className="w-full h-12 border border-brand-blue/30 text-brand-blue hover:bg-brand-bg-light font-[600] rounded mt-4 cursor-pointer select-none"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
