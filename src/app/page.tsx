'use client';

import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { 
  staticDepartments, 
  staticDoctors, 
  staticBlogs, 
  Department, 
  Doctor 
} from '@/lib/mockData';
import { 
  Calendar, Check, ChevronDown, ChevronRight, Stethoscope, 
  Baby, HeartPulse, Search, MapPin, Phone, Mail, Award, 
  UsersRound, ShieldCheck, Heart, User, ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  // Safe Interactive States
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const faqs = [
    {
      q: 'How do I book an appointment?',
      a: 'Simply click the "Book Appointment" button on the navigation bar, choose your preferred clinician, pick a date and slot, and confirm. Your records will sync immediately.'
    },
    {
      q: 'Can I manage my family\'s records?',
      a: 'Yes, after creating a patient profile, you can register dependents under a unified account portal and track their health sheets, vitals, and consultation logs.'
    },
    {
      q: 'Is my medical data secure?',
      a: 'Clinq complies fully with HIPAA standards. All medical charts, diagnostic history, and patient-doctor consult chats are protected with 256-bit encryption.'
    }
  ];

  // Filter Specialists
  const filteredDoctors = staticDoctors.filter(doc => {
    const matchesDept = selectedDeptId === 'all' || doc.department_name.toLowerCase().includes(selectedDeptId.toLowerCase());
    const matchesSearch = doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="flex flex-col items-start p-0 isolation-isolate relative w-full overflow-y-auto bg-brand-bg-light font-sans antialiased text-[#42474F]">
      
      {/* Absolute/Fixed Header */}
      <PublicNavbar />

      {/* Main Container starts from top-80px for offset */}
      <main className="w-full flex flex-col items-start pt-[81px] bg-brand-bg-light">
        
        {/* =============== HERO SECTION =============== */}
        <section className="w-full bg-white py-[128px] px-16 flex items-center justify-center border-b border-[#C2C7D1]/10">
          <div className="w-[1152px] flex flex-row items-center justify-between gap-10">
            
            {/* Left Content Container */}
            <div className="w-[516px] flex flex-col items-start gap-6">
              
              <div className="pt-2">
                <h1 className="text-[48px] leading-[60px] font-[700] text-brand-blue tracking-[-0.96px]">
                  Healthcare that fits your life.
                </h1>
              </div>

              <div className="max-w-[512px]">
                <p className="text-[18px] leading-[28px] font-[400] text-[#42474F]">
                  Instantly book consultations with top medical specialists, secure your lab reports, check pharmacy supplies, and message doctors via a clean virtual portal.
                </p>
              </div>

              <div className="flex flex-row items-start gap-4 pt-4">
                <Link 
                  href="/patient/appointments/book" 
                  className="w-[208px] h-[58px] bg-brand-blue hover:bg-brand-blue/90 text-white font-[700] text-base rounded-[4px] shadow flex items-center justify-center transition"
                >
                  Book Now
                </Link>
                <Link 
                  href="/about" 
                  className="w-[173px] h-[58px] border border-[#727780] hover:bg-brand-bg-light text-brand-blue font-[700] text-base rounded-[4px] flex items-center justify-center transition"
                >
                  Learn More
                </Link>
              </div>

            </div>

            {/* Right Interactive Mockup Graphic */}
           
            <img src="/hero-img.svg" alt="clinq patient dashboard illustration" />

          </div>
        </section>

        {/* =============== STATS SECTION =============== */}
        <section className="w-full bg-white py-20 border-b border-t border-[#C2C7D1]/10 flex justify-center">
          <div className="w-[1280px] px-16 flex flex-row justify-between gap-12">
            
            <div className="w-[252px] flex flex-col items-center gap-1">
              <div className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">15+</div>
              <div className="text-xs font-[600] text-[#42474F] tracking-[0.6px] uppercase">Specialists</div>
            </div>

            <div className="w-[252px] flex flex-col items-center gap-1">
              <div className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">10k+</div>
              <div className="text-xs font-[600] text-[#42474F] tracking-[0.6px] uppercase">Happy Patients</div>
            </div>

            <div className="w-[252px] flex flex-col items-center gap-1">
              <div className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">99%</div>
              <div className="text-xs font-[600] text-[#42474F] tracking-[0.6px] uppercase">Satisfaction</div>
            </div>

            <div className="w-[252px] flex flex-col items-center gap-1">
              <div className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">24/7</div>
              <div className="text-xs font-[600] text-[#42474F] tracking-[0.6px] uppercase">Hours Support</div>
            </div>

          </div>
        </section>

        {/* =============== INSURANCE PARTNERS SECTION =============== */}
        <section className="w-full bg-white py-12 border-b border-[#C2C7D1]/10 flex justify-center">
          <div className="w-[1152px] flex flex-col gap-10 items-center">
            
            {/* Headline */}
            <div className="text-center">
              <span className="text-xs font-[600] text-[#42474F] tracking-[1.2px] uppercase">
                Our Trusted Insurance Partners
              </span>
            </div>

            {/* Logo Strips */}
            <div className="flex flex-row justify-center items-center gap-16 opacity-60 bg-white min-h-7">
              <span className="text-xl font-[700] text-[#42474F]">Aetna</span>
              <span className="text-xl font-[700] text-[#42474F]">BlueCross</span>
              <span className="text-xl font-[700] text-[#42474F]">UnitedHealthcare</span>
              <span className="text-xl font-[700] text-[#42474F]">Cigna</span>
              <span className="text-xl font-[700] text-[#42474F]">Axa</span>
              <span className="text-xl font-[700] text-[#42474F]">Medicare</span>
            </div>

          </div>
        </section>

        {/* =============== FEATURES SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] py-[128px] flex justify-center">
          <div className="w-[1152px] flex flex-col gap-24">
            
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                Why Choose Clinq?
              </h2>
              <p className="max-w-[672px] text-base text-[#42474F] leading-6">
                Clinq bridges the gap between active patients and clinical coordination teams, removing scheduling limits and paper files.
              </p>
            </div>

            {/* Feature lists */}
            <div className="flex flex-row justify-center items-start gap-8">
              
              <div className="w-[362px] h-[231px] bg-[#F8F9FF] border border-[#C2C7D1]/20 rounded-lg p-8 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-[600] text-brand-blue mt-2">
                  Real-time Availability
                </h3>
                <p className="text-sm text-[#42474F] leading-5">
                  See exactly when your preferred specialists are free and secure your slot instantly.
                </p>
              </div>

              <div className="w-[362px] h-[231px] bg-[#F8F9FF] border border-[#C2C7D1]/20 rounded-lg p-8 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-[600] text-brand-blue mt-2">
                  Seamless Check-ins
                </h3>
                <p className="text-sm text-[#42474F] leading-5">
                  Reduce paperwork and wait times with our digital registration and check-in process.
                </p>
              </div>

              <div className="w-[362px] h-[231px] bg-[#F8F9FF] border border-[#C2C7D1]/20 rounded-lg p-8 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-[600] text-brand-blue mt-2">
                  Personalized Care
                </h3>
                <p className="text-sm text-[#42474F] leading-5">
                  Manage your health history and upcoming visits in one secure, easy-to-access portal.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =============== PATIENT TESTIMONIALS SECTION =============== */}
        <section className="w-full bg-white py-[128px] flex justify-center border-b border-[#C2C7D1]/10">
          <div className="w-[1152px] flex flex-col gap-16">
            
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                Patient Testimonials
              </h2>
              <p className="text-base text-[#42474F] leading-6 max-w-sm">
                Hear from patients who use Clinq daily.
              </p>
            </div>

            {/* testimonial Grid */}
            <div className="flex flex-row justify-center items-start gap-8">
              
              {/* Card 1 */}
              <div className="w-[362px] h-[237px] bg-[#EFF4FF] border border-[#C2C7D1]/10 rounded-[16px] p-8 flex flex-col justify-between">
                <div className="flex gap-1 text-brand-blue">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="w-4 h-4 fill-brand-blue text-brand-blue" />
                  ))}
                </div>
                <p className="text-sm text-brand-dark font-[400] leading-5 italic">
                  "The digital check-in saved me so much time. I was seen by Dr. Sharma within 5 minutes of arriving."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-[12px] bg-[#D2E4FF] text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                    MS
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-dark">Marcus Sharma</div>
                    <div className="text-[10px] text-[#42474F] tracking-[0.5px] uppercase">Patient</div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="w-[362px] h-[237px] bg-[#EFF4FF] border border-[#C2C7D1]/10 rounded-[16px] p-8 flex flex-col justify-between">
                <div className="flex gap-1 text-brand-blue">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="w-4 h-4 fill-brand-blue text-brand-blue" />
                  ))}
                </div>
                <p className="text-sm text-brand-dark font-[400] leading-5 italic">
                  "The portal makes managing my family's appointments so simple. Everything is in one place."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-[12px] bg-[#D4E6E5] text-[#516161] flex items-center justify-center font-bold text-sm shrink-0">
                    LC
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-dark">Lisa Chen</div>
                    <div className="text-[10px] text-[#42474F] tracking-[0.5px] uppercase">Patient</div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="w-[362px] h-[237px] bg-[#EFF4FF] border border-[#C2C7D1]/10 rounded-[16px] p-8 flex flex-col justify-between">
                <div className="flex gap-1 text-brand-blue">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="w-4 h-4 fill-brand-blue text-brand-blue" />
                  ))}
                </div>
                <p className="text-sm text-brand-dark font-[400] leading-5 italic">
                  "Expert care and a very clean facility. The cardiology team at Clinq is truly world-class."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-[12px] bg-[#E0E3E5] text-[#313436] flex items-center justify-center font-bold text-sm shrink-0">
                    JM
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-dark">James Miller</div>
                    <div className="text-[10px] text-[#42474F] tracking-[0.5px] uppercase">Patient</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =============== SERVICES/ADVANCED TOOLS SECTION =============== */}
        <section className="w-full bg-white py-[68px] px-16 flex justify-center border-b border-[#C2C7D1]/10">
          <div className="w-[1152px] flex flex-row items-center justify-between gap-16">
            
            {/* Left list details */}
            <div className="w-[544px] flex flex-col items-start gap-8">
              <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                Advanced tools for our internal medical standards.
              </h2>
              <dl className="flex flex-col gap-6 w-full">
                <div className="flex items-start gap-4 h-6">
                  <div className="w-5 h-5 rounded-full bg-[#EFF4FF] text-brand-blue flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <dd className="text-base font-[500] text-brand-dark">
                    State-of-the-art diagnostic equipment for precise testing.
                  </dd>
                </div>

                <div className="flex items-start gap-4 h-6">
                  <div className="w-5 h-5 rounded-full bg-[#EFF4FF] text-brand-blue flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <dd className="text-base font-[500] text-brand-dark">
                    Comprehensive digital medical records available instantly.
                  </dd>
                </div>

                <div className="flex items-start gap-4 h-6">
                  <div className="w-5 h-5 rounded-full bg-[#EFF4FF] text-brand-blue flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <dd className="text-base font-[500] text-brand-dark">
                    Integrated telehealth platform for remote consultation.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right clinical dashboard mockup */}
           <img src="/advanced-tool.svg" alt="clinq patient dashboard illustration" />

          </div>
        </section>

        {/* =============== FAQ SECTION =============== */}
        <section className="w-full bg-white py-[128px] px-[256px] flex justify-center border-b border-[#C2C7D1]/10">
          <div className="w-[768px] flex flex-col gap-16">
            
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-[#42474F] leading-6 max-w-sm">
                Get quick answers about Clinq features.
              </p>
            </div>

            {/* Accordion container */}
            <div className="flex flex-col gap-4 w-full">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-[#EFF4FF] border border-[#C2C7D1]/10 rounded-lg overflow-hidden transition-all duration-200"
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-[24px] flex items-center justify-between text-left font-[700] text-base text-brand-blue"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-brand-dark transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-6 text-sm text-[#42474F] leading-6 animate-fade-in font-[400] border-t border-[#C2C7D1]/5 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =============== NUMERIC BANNER HIGHLIGHTS SECTION =============== */}
        <section className="w-full bg-[#0F4C81] py-[128px] flex justify-center text-white">
          <div className="w-[1024px] px-16 flex flex-col gap-20">
            
            <div className="flex flex-col items-center text-center">
              <h2 className="text-[32px] font-[600] leading-10 text-white tracking-[-0.32px] max-w-md">
                By the numbers.
              </h2>
            </div>

            <div className="flex flex-row justify-center items-start gap-16">
              
              <div className="flex-1 flex flex-col items-center text-center gap-2">
                <div className="text-[36px] font-[800] leading-10 opacity-40">01</div>
                <h4 className="text-2xl font-[600] text-white">Active Specialists</h4>
                <p className="text-sm text-white/70 leading-5">
                  Over 50+ board-certified medical experts across 12 departments.
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center text-center gap-2">
                <div className="text-[36px] font-[800] leading-10 opacity-40">02</div>
                <h4 className="text-2xl font-[600] text-white">Total Consultations</h4>
                <p className="text-sm text-white/70 leading-5">
                  Over 10,000+ completed check-ins and successful treatments.
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center text-center gap-2">
                <div className="text-[36px] font-[800] leading-10 opacity-40">03</div>
                <h4 className="text-2xl font-[600] text-white">Satisfaction Rate</h4>
                <p className="text-sm text-white/70 leading-5">
                  99.4% patient satisfaction rating across all clinical feedback.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =============== HEALTH RESOURCES / BLOG SECTION =============== */}
        <section className="w-full bg-[#F8F9FF] py-[128px] flex justify-center border-b border-[#C2C7D1]/10">
          <div className="w-[1152px] flex flex-col gap-16">
            
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                  Health Resources
                </h2>
                <p className="text-base text-[#42474F] mt-2">
                  Stay informed with our latest news and wellness articles.
                </p>
              </div>
              <Link href="/resources" className="text-base font-[700] text-brand-blue my-auto flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Blog Cards */}
            <div className="flex flex-row justify-center items-start gap-8">
              {staticBlogs.map((blog) => (
                <article key={blog.id} className="w-[362px] h-[390px] flex flex-col gap-3 pb-1">
                  <div className="w-full h-[204px] bg-[#E6EEFF] rounded-lg relative overflow-hidden flex flex-col justify-end p-4 shadow-sm border border-[#C2C7D1]/10">
                    <div className="absolute top-4 left-4 bg-brand-blue/5 border border-brand-blue/10 text-brand-blue font-[700] text-[10px] tracking-[1px] uppercase px-2 py-0.5 rounded-[2px]">
                      {blog.category}
                    </div>
                    {/* Mock illustration inside placeholder */}
                    <div className="w-full h-24 flex items-center justify-center text-brand-blue opacity-40">
                      <ClipboardCheck className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-[600] text-brand-blue mt-2 leading-8">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-[#42474F] leading-5">
                    {blog.description}
                  </p>
                  <Link href={`/resources/${blog.id}`} className="text-xs font-[700] text-brand-blue mt-auto hover:underline">
                    Read More
                  </Link>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* =============== CARDIOLOGY TESTIMONIAL QUOTE SECTION =============== */}
        <section className="w-full bg-white py-[128px] px-[256px] flex justify-center">
          <div className="w-[768px] flex flex-col items-center gap-8">
            
            <div className="text-brand-blue opacity-30">
              <span className="text-6xl font-serif">“</span>
            </div>

            <blockquote className="text-[24px] leading-[39px] font-[600] text-brand-blue text-center max-w-[630px]">
              "Expert care and a very clean facility. The cardiology team at Clinq is truly world-class."
            </blockquote>

            <div className="text-center">
              <cite className="text-base font-[700] text-brand-dark not-italic block">
                Dr. Arya Sharma
              </cite>
              <span className="text-sm font-[400] text-[#42474F] block mt-1">
                Senior Cardiologist
              </span>
            </div>

          </div>
        </section>

        {/* =============== FIND YOUR SPECIALIST SECTION =============== */}
        <section id="specialists-section" className="w-full bg-[#EFF4FF] py-[128px] flex justify-center">
          <div className="w-[1152px] flex flex-col gap-20">
            
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                Find Your Specialist
              </h2>
              <p className="text-base text-[#42474F] leading-6 max-w-2xl">
                Search our verified Practitioner directory by clinical specialty or medical unit.
              </p>
            </div>

            {/* Main Interactive Directory layout */}
            <div className="flex flex-row justify-center items-start gap-16">
              
              {/* Left Column: Departments Filter */}
              <div className="w-[544px] flex flex-col items-start gap-8">
                
                {/* Section Header */}
                <div className="flex items-center gap-4 h-8">
                  <Stethoscope className="w-5 h-4.5 text-brand-blue shrink-0" />
                  <h3 className="text-2xl font-[600] text-brand-blue leading-8">
                    Departments
                  </h3>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  {/* Option All */}
                  <button 
                    onClick={() => setSelectedDeptId('all')}
                    className={`w-full p-6 border rounded-lg flex items-center justify-between text-left transition ${
                      selectedDeptId === 'all' 
                        ? 'bg-[#E6EEFF] border-brand-blue/30 shadow-xs' 
                        : 'bg-white border-[#C2C7D1]/20 hover:border-brand-blue/20'
                    }`}
                  >
                    <div>
                      <div className="text-base font-[700] text-brand-dark">All Specialities</div>
                      <div className="text-sm text-[#42474F] mt-1">Show clinicians from all departments</div>
                    </div>
                    <span className="text-sm font-[700] text-brand-blue shrink-0">View All</span>
                  </button>

                  {staticDepartments.map((dept) => (
                    <button 
                      key={dept.id}
                      onClick={() => setSelectedDeptId(dept.name)}
                      className={`w-full p-6 border rounded-lg flex items-center justify-between text-left transition ${
                        selectedDeptId === dept.name 
                          ? 'bg-[#E6EEFF] border-brand-blue/30 shadow-xs' 
                          : 'bg-white border-[#C2C7D1]/20 hover:border-brand-blue/20'
                      }`}
                    >
                      <div>
                        <div className="text-base font-[700] text-brand-dark">{dept.name}</div>
                        <div className="text-sm text-[#42474F] mt-1">{dept.description}</div>
                      </div>
                      <span className="text-sm font-[700] text-brand-blue shrink-0">Select</span>
                    </button>
                  ))}
                </div>

              </div>

              {/* Right Column: Specialists List & Search */}
              <div className="w-[544px] flex flex-col items-start gap-8">
                
                {/* Search Bar */}
                <div className="w-full flex items-center gap-4 h-8">
                  <Search className="w-5 h-4.5 text-brand-blue shrink-0" />
                  <h3 className="text-2xl font-[600] text-brand-blue leading-8">
                    Specialists
                  </h3>
                </div>

                <div className="w-full relative">
                  <input 
                    type="text"
                    placeholder="Search doctor names or titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#C2C7D1]/20 rounded-lg px-4 py-[14px] text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                {/* Doctor listing */}
                <div className="flex flex-col gap-4 w-full">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <div 
                        key={doc.id}
                        className="bg-white border border-[#C2C7D1]/20 rounded-lg p-6 flex flex-row items-center gap-6"
                      >
                        <div className="w-[64px] h-[64px] bg-brand-blue text-white rounded-lg flex items-center justify-center font-[700] text-xl shrink-0">
                          {doc.full_name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div className="flex-1 flex flex-col items-start gap-1">
                          <h4 className="text-base font-[700] text-brand-dark">{doc.full_name}</h4>
                          <span className="text-sm text-[#42474F] font-[400]">{doc.specialty}</span>
                        </div>
                        <Link 
                          href="/patient/appointments/book"
                          className="w-[88px] h-8 bg-brand-blue hover:bg-brand-blue/90 text-white font-[700] text-xs rounded-[4px] flex items-center justify-center transition shrink-0"
                        >
                          Book Now
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center bg-white border border-dashed border-[#C2C7D1]/40 rounded-lg w-full text-sm text-[#727780]">
                      No matching specialist records found in this category.
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =============== MOBILE SECTION =============== */}
        <section className="w-full bg-white py-[128px] px-16 flex justify-center border-b border-[#C2C7D1]/10">
          <div className="w-[1152px] flex flex-row items-center justify-between gap-20">
            
            {/* Left Phone Mockup Graphic */}
            <img src="/appointment-booked.svg" alt="clinq patient dashboard illustration" />

            {/* Right details */}
            <div className="w-[534px] flex flex-col items-start gap-6">
              <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                Better care, Everytime.
              </h2>
              <p className="text-base text-[#42474F] leading-6-max-w-md">
                Book appointment in just few clicks. Choose your doctor, pick a time that works for you and we’ll take care of the rest
              </p>
              
              <div className="flex flex-row items-start gap-4 pt-4">
                <Link 
                  href="/patient/appointments/book" 
                  className="w-[144px] h-[48px] bg-brand-blue hover:bg-brand-blue/90 text-white font-[700] text-sm rounded-[4px] flex items-center justify-center transition shadow-sm"
                >
                  Book Now
                </Link>
                <Link 
                  href="/login" 
                  className="w-[144px] h-[48px] border border-brand-blue hover:bg-brand-bg-light text-brand-blue font-[700] text-sm rounded-[4px] flex items-center justify-center transition"
                >
                  Login
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* =============== LOCATION & CAMPUS SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] py-[128px] px-64 flex justify-center">
          <div className="w-[1152px] bg-white border border-[#C2C7D1]/10 rounded-[24px] shadow-sm p-12 flex flex-row items-center justify-between gap-12 relative overflow-hidden">
            
            {/* Left address details */}
            <div className="w-[551px] flex flex-col justify-center items-start gap-6">
              
              <div className="flex items-start gap-2 h-7 bg-brand-blue/5 border border-brand-blue/10 px-3 py-1 rounded">
                <MapPin className="w-4 h-4 text-brand-blue shrink-0 my-auto" />
                <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider">Clinq Campus</span>
              </div>

              <div>
                <h2 className="text-[32px] font-[600] leading-10 text-brand-blue tracking-[-0.32px]">
                  Visit Our Campus
                </h2>
                <p className="text-base text-[#42474F] mt-4 leading-6">
                  Centrally located in the medical district, with 24/7 emergency access and ample parking for patients and visitors.
                </p>
              </div>

              <dl className="flex flex-col gap-6 pt-2 w-full text-sm">
                
                <div className="flex flex-row items-center gap-4">
                  <div className="w-5 h-5 text-brand-blue flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <dt className="font-[700] text-brand-dark text-base">Main Campus Address</dt>
                    <dd className="text-sm text-[#42474F] mt-0.5">123 Healthcare Blvd, Medical District</dd>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-4">
                  <div className="w-5 h-5 text-brand-blue flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <dt className="font-[700] text-brand-dark text-base">Contact Telephone Line</dt>
                    <dd className="text-sm text-[#42474F] mt-0.5">+1 (555) 019-2834</dd>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-4">
                  <div className="w-5 h-5 text-brand-blue flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <dt className="font-[700] text-brand-dark text-base">Electronic Communications Mail</dt>
                    <dd className="text-sm text-[#42474F] mt-0.5">info@clinq.healthcare</dd>
                  </div>
                </div>

              </dl>

            </div>

            {/* Right Map Mockup Layout */}
            <div className="w-[450px] h-[380px] bg-[#EFF4FF] rounded-2xl relative overflow-hidden border border-[#C2C7D1]/10 shrink-0 shadow-inner flex items-center justify-center">
              
              {/* Grid map overlays */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00355F_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-transparent pointer-events-none" />

              {/* Pulsing home address marker */}
              <div className="relative">
                <span className="absolute -left-3 -top-3 w-10 h-10 bg-brand-blue/20 rounded-full animate-ping" />
                <div className="w-4 h-4 bg-brand-blue border-2 border-white rounded-full shadow relative z-10" />
              </div>

              {/* Small location popup label */}
              <div className="absolute bottom-6 bg-white border border-[#C2C7D1]/20 px-3.5 py-2 rounded-lg shadow-sm text-center">
                <div className="text-[10px] font-bold text-brand-blue">CLINQ MAIN MEDICAL HQ</div>
                <div className="text-[8px] text-[#727780] font-sans font-[500] uppercase mt-0.5 tracking-wider">24/7 Access Gateway</div>
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
