'use client';

import React, { use } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import { 
  HeartPulse, Brain, Baby, Sparkles, Activity, Eye, Stethoscope,
  ClipboardCheck, ShieldCheck, Search, ArrowLeft, Star, Clock, 
  MapPin, CheckCircle
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DepartmentDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data, isLoading } = usePlatformData();

  const departments = data?.departments ?? [];
  const specialists = data?.specialists ?? [];

  // Match department by slug
  const department = departments.find(d => d.slug.toLowerCase() === slug.toLowerCase() || d.name.toLowerCase() === slug.toLowerCase());

  // Filter specialists belonging to this department
  const filteredSpecialists = department
    ? specialists.filter(s => s.department_id === department.id || s.department_name?.toLowerCase() === department.name.toLowerCase())
    : [];

  const IconComponent = department ? getIcon(department.icon_name) : Stethoscope;

  return (
    <div className="flex flex-col items-center w-full bg-[#F8F9FF] dark:bg-[#0D1C2E] min-h-screen relative font-sans antialiased text-[#42474F] dark:text-[#A7ABB5] transition-colors duration-300">
      
      {/* Navbar header */}
      <PublicNavbar />

      <main className="w-full flex flex-col justify-start items-center relative pt-[81px]">
        
        {/* =============== HERO BREADCRUMB HEADER =============== */}
        <section className="w-full bg-[#EFF4FF] dark:bg-[#122338] py-12 md:py-16 px-6 md:px-16 border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 flex justify-center transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-6 items-start">
            <Link 
              href="/departments" 
              className="flex items-center gap-2 text-xs font-[700] uppercase tracking-wider text-brand-blue dark:text-[#5F9EA0] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Departments
            </Link>

            {isLoading ? (
              <div className="w-full flex flex-col gap-4 animate-pulse">
                <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            ) : department ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full mt-2">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 bg-[#E6EEFF] dark:bg-[#0D1C2E]/40 rounded-xl flex items-center justify-center shrink-0 border border-brand-blue/5">
                    <IconComponent className="w-8 h-8 text-brand-blue dark:text-[#5F9EA0]" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 text-[10px] font-[800] uppercase tracking-widest text-[#0F4C81] dark:text-[#5F9EA0] bg-[#E6EEFF] dark:bg-[#1E2D4A] rounded">
                      {department.category} Category
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-[40px] md:leading-[48px] font-[800] text-brand-blue dark:text-white tracking-[-0.96px] mt-1.5">
                      Department of {department.name}
                    </h1>
                  </div>
                </div>
                
                <Link 
                  href="/patient/appointments/book"
                  className="px-6 py-3 bg-brand-blue dark:bg-[#5F9EA0] hover:bg-brand-blue/90 dark:hover:bg-[#5F9EA0]/95 text-white dark:text-[#0D1C2E] font-[750] text-sm rounded-lg shadow-sm flex items-center justify-center transition shrink-0"
                >
                  Book In-Office Slot
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* =============== DETAILS CONTENT SECTION =============== */}
        {isLoading ? (
          <div className="w-full max-w-[1152px] py-16 px-6 md:px-16 grid grid-cols-1 lg:grid-cols-3 gap-12 animate-pulse">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
            </div>
            <div className="lg:col-span-1 h-[300px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        ) : department ? (
          <section className="w-full py-16 px-6 md:px-16 flex justify-center bg-[#F8F9FF] dark:bg-[#0D1C2E] transition-colors duration-300">
            <div className="w-full max-w-[1152px] flex flex-col gap-16">
              
              {/* Detailed Context Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
                
                {/* Detailed Narrative (Col 1 & 2) */}
                <div className="lg:col-span-2 flex flex-col gap-6 text-left">
                  <h2 className="text-xl sm:text-[24px] font-[755] text-brand-blue dark:text-white tracking-tight">
                    Clinical Overview & Services
                  </h2>
                  <p className="text-sm sm:text-base leading-7 text-[#42474F] dark:text-[#A7ABB5]">
                    {department.detailed_content || department.description || "No detailed clinical overview provided for this department yet. Please consult our 24/7 reception desk for assistance."}
                  </p>
                  
                  {/* General Features List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {[
                      'HIPAA Compliant Patient Files',
                      'On-Site Laboratory Diagnostics',
                      'Telehealth Remote Sessions',
                      'Direct HMO Invoicing Support'
                    ].map((feat, fi) => (
                      <div key={fi} className="flex items-center gap-2.5 text-sm text-[#42474F] dark:text-[#A7ABB5]">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Clinic Info Board (Col 3) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="bg-white dark:bg-[#122338] border border-[#C2C7D1]/30 dark:border-[#22354A]/30 rounded-xl p-6 sm:p-8 flex flex-col gap-4 text-left shadow-xs">
                    <h3 className="text-xs font-[800] uppercase tracking-widest text-[#00355F] dark:text-[#5F9EA0] pb-2 border-b border-[#C2C7D1]/15 dark:border-[#22354A]/30">
                      Clinic Admission Details
                    </h3>
                    
                    <div className="flex flex-col gap-4 text-sm text-[#42474F] dark:text-[#A7ABB5]">
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0] shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-brand-blue dark:text-white font-[700]">Working Shifts</strong>
                          <span>08:00 AM - 08:00 PM (Clinical)</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0] shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-brand-blue dark:text-white font-[700]">Hospital Campus Location</strong>
                          <span>Clinq Center HQ, Floors 2 & 4</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Stethoscope className="w-4 h-4 text-brand-blue dark:text-[#5F9EA0] shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-brand-blue dark:text-white font-[700]">Unit Staff Count</strong>
                          <span>{department.doctors_count} Lead Specialists</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Specialists/practitioners of this Clinical Unit */}
              <div className="w-full flex flex-col gap-8">
                <div className="w-full border-t border-[#C2C7D1]/30 dark:border-[#22354A]/30 pt-12 flex flex-col items-start gap-2">
                  <h2 className="text-xl sm:text-[24px] font-[755] text-brand-blue dark:text-white tracking-tight">
                    Active Practitioners in {department.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#727780] dark:text-[#A7ABB5] leading-5">
                    Consultations are slots bookable hour-by-hour M-F. Check credentials and reserve your appointment slot.
                  </p>
                </div>

                {filteredSpecialists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                    {filteredSpecialists.map((doc) => (
                      <div 
                        key={doc.id}
                        className="bg-white dark:bg-[#122338] border border-[#C2C7D1]/15 dark:border-[#22354A]/30 rounded-xl p-6 flex flex-col items-center text-center transition hover:shadow-md relative"
                      >
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[20px] font-bold shadow-sm relative overflow-hidden mb-4 shrink-0 border-2 border-[#EFF4FF] dark:border-[#0D1C2E]">
                          {doc.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={doc.image_url} 
                              alt={doc.full_name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-blue/60 to-brand-blue dark:from-[#5F9EA0]/40 dark:to-[#5F9EA0] flex items-center justify-center text-white font-[700] text-lg">
                              {doc.initials || 'MD'}
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm sm:text-base leading-5 font-[750] text-[#0f3456] dark:text-[#EFF4FF] mb-1">
                          {doc.full_name}
                        </h4>
                        
                        <span className="text-xs text-[#727780] dark:text-[#A5AAB5] font-[450] mb-3">
                          {doc.specialty}
                        </span>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-5">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-brand-dark dark:text-white">{doc.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-[#727780] dark:text-[#A7ABB5]">({doc.experience})</span>
                        </div>

                        {/* Availability Pill */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-[800] uppercase tracking-wider mb-6 shrink-0 ${
                          doc.is_available 
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' 
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          {doc.availability_text}
                        </span>

                        {/* Booking Link */}
                        <Link 
                          href="/patient/appointments/book"
                          className="w-full py-2 bg-brand-blue dark:bg-[#5F9EA0] hover:bg-brand-blue/90 dark:hover:bg-[#5F9EA0]/95 text-white dark:text-[#0D1C2E] font-[700] text-xs sm:text-sm rounded-[6px] flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          Book consultation
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white dark:bg-[#122338] border border-dashed border-[#C2C7D1]/30 dark:border-[#22354A]/30 rounded-xl text-sm text-[#727780] dark:text-[#A7ABB5]">
                    No active specialists currently logged under this department.
                  </div>
                )}
              </div>

            </div>
          </section>
        ) : (
          <section className="w-full py-24 px-6 md:px-16 flex justify-center min-h-[500px]">
            <div className="w-full max-w-[500px] text-center bg-white dark:bg-[#122338] border border-dashed border-[#C2C7D1]/30 dark:border-[#22354A]/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
              <Stethoscope className="w-12 h-12 text-[#9CA3AF]" />
              <h3 className="text-lg font-[750] text-[#00355F] dark:text-white">Department Not Found</h3>
              <p className="text-xs sm:text-sm text-[#727780] dark:text-[#A7ABB5] leading-5">
                The clinical department key "{slug}" was not found in our database records.
              </p>
              <Link href="/departments" className="mt-2 text-sm font-bold text-brand-blue dark:text-[#5F9EA0] underline">
                Browse our care units
              </Link>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <PublicFooter />

    </div>
  );
}
