'use client';

import React from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import { 
  Target, Eye, Award, Users, 
  HeartHandshake
} from 'lucide-react';
import Link from 'next/link';

interface LeaderCard {
  name: string;
  role: string;
  initials: string;
  colorGrad: string;
}

export default function AboutPage() {
  const { data } = usePlatformData();
  const totalSpecialists = data?.stats?.totalSpecialists ?? 150;
  const totalPatients = data?.stats?.totalPatients ?? 10000;

  const leaders: LeaderCard[] = [
    {
      name: 'Dr. Sarah Bloom',
      role: 'CHIEF MEDICAL OFFICER',
      initials: 'SB',
      colorGrad: 'from-blue-600 to-cyan-500'
    },
    {
      name: 'Marcus Vane',
      role: 'CHIEF EXECUTIVE OFFICER',
      initials: 'MV',
      colorGrad: 'from-slate-700 to-[#00355F]'
    },
    {
      name: 'Dr. Elena Rodriguez',
      role: 'DIRECTOR OF AI RESEARCH',
      initials: 'ER',
      colorGrad: 'from-indigo-600 to-purple-500'
    },
    {
      name: 'James Sterling',
      role: 'CHIEF OPERATIONS OFFICER',
      initials: 'JS',
      colorGrad: 'from-[#0F4C81] to-blue-800'
    }
  ];

  return (
    <div className="flex flex-col items-center w-full bg-brand-bg-light relative min-h-screen font-sans antialiased text-[#42474F]">
      
      {/* Header NAVBAR */}
      <PublicNavbar />

      {/* Main portal body */}
      <main className="w-full bg-[#F8F9FF] flex flex-col justify-start items-center relative pt-[81px]">
        
        {/* =============== HERO SECTION =============== */}
        <section className="w-full relative flex justify-center items-center overflow-hidden py-20 md:py-[128px] px-6 md:px-16 min-h-[450px] md:min-h-[600px] shrink-0">
          
          {/* Background image & gradient overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 md:opacity-100"
            style={{ backgroundImage: "url('/hero-img.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F8F9FF] via-[#F8F9FF]/95 to-transparent z-1" />

          {/* Centered content block */}
          <div className="w-full max-w-[1152px] flex items-center justify-start relative z-10">
            <div className="max-w-[672px] flex flex-col gap-6 items-start text-left">
              <h1 className="text-3xl sm:text-4xl md:text-[48px] md:leading-[60px] font-[700] text-[#0D1C2E] tracking-[-0.96px]">
                Pioneering the Future of Healthcare
              </h1>
              <p className="text-sm sm:text-base md:text-[18px] md:leading-[28px] font-[400] text-[#42474F]">
                Clinq's commitment to clinical excellence has defined our journey for over two decades. We merge human compassion with groundbreaking technology to deliver world-class care.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 w-full sm:w-auto">
                <Link 
                  href="/specialists"
                  className="px-8 h-[42px] bg-brand-blue text-white font-[600] text-xs uppercase tracking-[0.6px] rounded-[4px] shadow-sm flex items-center justify-center hover:bg-brand-blue/95 transition select-none"
                >
                  Find a Specialist
                </Link>
                <Link 
                  href="/departments"
                  className="px-8 h-[42px] border border-brand-blue text-brand-blue font-[600] text-xs uppercase tracking-[0.6px] rounded-[4px] flex items-center justify-center hover:bg-brand-blue/5 transition select-none"
                >
                  Our Departments
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =============== SECTION - IMPACT NUMBERS =============== */}
        <section className="w-full bg-[#E6EEFF] py-12 md:py-16 px-6 md:px-16 flex justify-center border-b border-[#C2C7D1]/10">
          <div className="w-full max-w-[1152px] flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 h-full">
            
            {/* Stat 1 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
              <span className="text-2xl sm:text-[32px] sm:leading-[40px] font-[700] text-brand-blue tracking-[-0.96px]">20+</span>
              <span className="text-[10px] sm:text-[12px] font-[600] uppercase text-[#42474F] tracking-[0.6px] mt-2">YEARS OF EXCELLENCE</span>
            </div>

            {/* Stat 2 with dynamic borders */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-2 border-t border-b md:border-t-0 md:border-b-0 md:border-l md:border-r border-[#C2C7D1]/40 py-4 md:py-0 w-full md:w-auto">
              <span className="text-2xl sm:text-[32px] sm:leading-[40px] font-[700] text-brand-blue tracking-[-0.96px]">{totalSpecialists}+</span>
              <span className="text-[10px] sm:text-[12px] font-[600] uppercase text-[#42474F] tracking-[0.6px] mt-2">SPECIALISTS</span>
            </div>

            {/* Stat 3 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
              <span className="text-2xl sm:text-[32px] sm:leading-[40px] font-[700] text-brand-blue tracking-[-0.96px]">{totalPatients >= 1000 ? `${(totalPatients / 1000).toFixed(0)}k` : totalPatients}+</span>
              <span className="text-[10px] sm:text-[12px] font-[600] uppercase text-[#42474F] tracking-[0.6px] mt-2">PATIENTS SERVED</span>
            </div>

          </div>
        </section>

        {/* =============== SECTION - MISSION & VISION =============== */}
        <section className="w-full py-16 md:py-[96px] px-6 md:px-16 flex justify-center bg-[#F8F9FF] border-b border-[#C2C7D1]/10">
          <div className="w-full max-w-[1152px] flex flex-col md:flex-row items-stretch justify-center gap-6">
            
            {/* Card 1 - Mission */}
            <div className="flex-1 bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-6 sm:p-12 flex flex-col gap-4 min-h-[354px] w-full text-left">
              <div className="w-16 h-16 bg-[#0F4C81]/10 rounded-xl flex items-center justify-center text-brand-blue shrink-0">
                <Target className="w-[30px] h-[30px] text-brand-blue" />
              </div>
              <h2 className="text-xl sm:text-[24px] font-[600] text-brand-dark tracking-[-0.32px] mt-3">
                Our Mission
              </h2>
              <p className="text-sm sm:text-[16px] sm:leading-[26px] font-[400] text-[#42474F]">
                Providing patient-centric, technology-driven care that prioritizes recovery and comfort above all else. We leverage high-density data analytics to ensure every clinical decision is backed by precision.
              </p>
            </div>

            {/* Card 2 - Vision */}
            <div className="flex-1 bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-6 sm:p-12 flex flex-col gap-4 min-h-[354px] w-full text-left">
              <div className="w-16 h-16 bg-[#0F4C81]/10 rounded-xl flex items-center justify-center text-brand-blue shrink-0">
                <Eye className="w-[33px] h-[22.5px] text-brand-blue" />
              </div>
              <h2 className="text-xl sm:text-[24px] font-[600] text-brand-dark tracking-[-0.32px] mt-3">
                Our Vision
              </h2>
              <p className="text-sm sm:text-[16px] sm:leading-[26px] font-[400] text-[#42474F]">
                To be the global standard for medical precision. We aim to redefine the boundaries of what's possible in modern medicine through relentless innovation and a sterile focus on patient outcomes.
              </p>
            </div>

          </div>
        </section>

        {/* =============== SECTION - OUR HISTORY (TIMELINE) =============== */}
        <section className="w-full py-16 md:py-[96px] px-6 md:px-16 flex flex-col items-center bg-[#EFF4FF] overflow-hidden shrink-0">
          
          <div className="w-full max-w-[1152px] flex flex-col gap-4 items-center text-center pb-12">
            <h2 className="text-xl sm:text-[24px] font-[600] text-[#0D1C2E] tracking-[-0.32px]">
              Our History
            </h2>
            <p className="text-xs sm:text-[16px] text-[#42474F] max-w-xs">
              A history of medical breakthroughs and patient trust.
            </p>
          </div>

          {/* Timeline Nodes Grid */}
          <div className="w-full max-w-[896px] relative px-4 flex flex-col">
            
            {/* Centered vertical connector bar */}
            <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[1px] bg-[#C2C7D1] md:transform md:-translate-x-1/2" />

            <div className="flex flex-col gap-12 md:gap-16 relative z-10 w-full">
              
              {/* Year 1998 */}
              <div className="flex flex-col md:flex-row items-start md:items-center w-full justify-between gap-4 md:gap-0 relative">
                {/* Left content block */}
                <div className="w-full md:w-[360px] pl-8 md:pl-0 flex flex-col gap-2 items-start md:items-end text-left md:text-right">
                  <h3 className="text-lg font-[600] text-brand-blue">1998</h3>
                  <p className="text-sm sm:text-[16px] sm:leading-[24px] text-[#42474F] max-w-[341px]">
                    Clinq was founded as a single cardiology clinic in Seattle, aiming to set new standards in diagnostic care.
                  </p>
                </div>
                
                {/* Dot */}
                <div className="absolute left-3 md:relative md:left-auto w-4 h-4 bg-brand-blue border-4 border-[#F8F9FF] rounded-full z-20" />

                {/* Right empty placeholder */}
                <div className="hidden md:block w-[360px]" />
              </div>

              {/* Year 2010 */}
              <div className="flex flex-col md:flex-row items-start md:items-center w-full justify-between gap-4 md:gap-0 relative">
                {/* Left empty placeholder */}
                <div className="hidden md:block w-[360px]" />

                {/* Dot */}
                <div className="absolute left-3 md:relative md:left-auto w-4 h-4 bg-brand-blue border-4 border-[#F8F9FF] rounded-full z-20" />

                {/* Right content block */}
                <div className="w-full md:w-[360px] pl-8 md:pl-0 flex flex-col gap-2 items-start text-left">
                  <h3 className="text-lg font-[600] text-brand-blue">2010</h3>
                  <p className="text-sm sm:text-[16px] sm:leading-[24px] text-[#42474F] max-w-[341px]">
                    Major digital transformation: Implementing the region's first fully paperless patient records system.
                  </p>
                </div>
              </div>

              {/* Year 2024 */}
              <div className="flex flex-col md:flex-row items-start md:items-center w-full justify-between gap-4 md:gap-0 relative">
                {/* Left content block */}
                <div className="w-full md:w-[360px] pl-8 md:pl-0 flex flex-col gap-2 items-start md:items-end text-left md:text-right">
                  <h3 className="text-lg font-[600] text-brand-blue">2024</h3>
                  <p className="text-sm sm:text-[16px] sm:leading-[24px] text-[#42474F] max-w-[358px]">
                    Global expansion and AI integration: launching predictive care models for clinical diagnostics assistance.
                  </p>
                </div>
                
                {/* Dot */}
                <div className="absolute left-3 md:relative md:left-auto w-4 h-4 bg-brand-blue border-4 border-[#F8F9FF] rounded-full z-20" />

                {/* Right empty placeholder */}
                <div className="hidden md:block w-[360px]" />
              </div>

            </div>

          </div>
        </section>

        {/* =============== LEADERSHIP DIRECTORY =============== */}
        <section className="w-full py-16 md:py-[96px] px-6 md:px-16 bg-[#F8F9FF] border-b border-[#C2C7D1]/10 flex justify-center">
          <div className="w-full max-w-[1152px] flex flex-col gap-12 md:gap-16">
            
            <div className="flex flex-col gap-4 items-center text-center">
              <h2 className="text-xl sm:text-[24px] font-[600] text-brand-dark tracking-[-0.32px]">
                Our Leadership
              </h2>
              <p className="text-sm sm:text-[16px] text-[#42474F] max-w-sm">
                The minds guiding the evolution of Clinq.
              </p>
            </div>

            {/* Grid of leader profile cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {leaders.map((leader, index) => (
                <div key={index} className="flex flex-col items-center md:items-start text-center md:text-left gap-4 w-full">
                  
                  {/* Photo Gradient placeholder Block */}
                  <div className="w-full aspect-[270/337.5] sm:w-[270px] sm:h-[337.5px] max-w-[270px] rounded-lg bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center border border-[#E2E8F0] shadow-xs relative overflow-hidden shrink-0">
                    {/* Visual gradient backdrop */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${leader.colorGrad} opacity-90`} />
                    <span className="text-white text-5xl font-extrabold tracking-tight select-none relative z-10">
                      {leader.initials}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 pt-2 w-full">
                    <h4 className="text-[18px] font-[600] text-brand-blue leading-8">
                      {leader.name}
                    </h4>
                    <span className="text-xs uppercase font-[600] text-[#727780] tracking-[0.6px]">
                      {leader.role}
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =============== EXPERIENCE CLINICAL PRECISION CTA ================ */}
        <section className="w-full bg-[#F8F9FF] py-16 md:py-[96px] px-6 md:px-16 flex justify-center">
          <div className="w-full max-w-[1152px] bg-[#0F4C81] rounded-[24px] py-12 px-6 sm:px-20 flex flex-col gap-6 items-center text-center relative overflow-hidden min-h-[350px] shadow-lg justify-center">
            
            {/* Absolute layout borders */}
            {/* <div className="absolute top-[-128px] right-[-128px] w-[256px] h-[256px] bg-white text-white/5 rounded-xl pointer-events-none" /> */}

            <h2 className="text-2xl sm:text-[32px] font-[700] text-white tracking-[-0.96px] leading-normal sm:leading-[48px]">
              Experience Clinical Precision
            </h2>

            <p className="text-sm sm:text-[18px] text-blue-100/90 leading-[28px] max-w-[636px]">
              Our specialists are ready to provide you with the most advanced medical care available today. Join the thousands who trust Clinq.
            </p>

            <Link 
              href="/specialists"
              className="px-10 py-[16px] bg-white text-brand-blue font-[600] text-[16px] rounded-lg shadow-sm hover:bg-blue-50 transition mt-4 select-none"
            >
              Find a Specialist
            </Link>

          </div>
        </section>

      </main>

      {/* Global Footer */}
      <PublicFooter />

    </div>
  );
}
