'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  HeartPulse, Brain, Baby, Sparkles, Activity, Eye, Stethoscope,
  ClipboardCheck, ShieldCheck, Search, ArrowLeft, ArrowUpRight, Star, Clock,
  MapPin, ChevronRight,
} from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PulseField from '@/components/landing/PulseField';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import { BTN_PRIMARY, CONTAINER, CheckItem, H1, H3, LABEL, Portrait } from '@/components/landing/ui';

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

const FEATURES = [
  'HIPAA Compliant Patient Files',
  'On-Site Laboratory Diagnostics',
  'Telehealth Remote Sessions',
  'Direct HMO Invoicing Support',
];

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

  return (
    <div className="relative w-full min-h-screen bg-canvas font-sans antialiased text-steel transition-colors duration-300">
      <PublicNavbar />

      <main>
        {/* =============== HEADER =============== */}
        <section className="relative overflow-hidden bg-canvas pt-16 border-b border-line">
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <PulseField baseline={0.62} fadeFrom={0.5} spikeAt={0.8} />
          </div>
          <div className={`relative ${CONTAINER} py-14 md:py-20 flex flex-col gap-8`}>
            <Link
              href="/departments"
              className="self-start text-[14px] font-[500] text-steel hover:text-navy inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All departments
            </Link>

            {isLoading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-12 w-2/3 rounded-[8px] bg-surface border border-line" />
                <div className="h-6 w-1/2 rounded-[8px] bg-surface border border-line" />
              </div>
            ) : department ? (
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="flex flex-col gap-5 max-w-[720px]">
                  <h1 className={H1}>Department of {department.name}</h1>
                  <p className="flex items-center gap-2 text-[15px] text-steel">
                    {React.createElement(getIcon(department.icon_name), { className: "w-[18px] h-[18px] text-teal-ink" })}
                    {department.category} care · {department.doctors_count} lead specialists
                  </p>
                </div>
                <Link href="/patient/appointments/book" className={`${BTN_PRIMARY} self-start lg:self-auto`}>
                  Book in-office slot
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* =============== DETAILS =============== */}
        {isLoading ? (
          <div className={`${CONTAINER} py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse`}>
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="h-5 rounded bg-surface border border-line" />
              <div className="h-5 w-5/6 rounded bg-surface border border-line" />
              <div className="h-5 w-4/5 rounded bg-surface border border-line" />
            </div>
            <div className="lg:col-span-5 h-[260px] rounded-[12px] bg-surface border border-line" />
          </div>
        ) : department ? (
          <>
            <section className="bg-canvas">
              <div className={`${CONTAINER} py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12`}>
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <h2 className={H3}>Clinical overview &amp; services</h2>
                  <p className="text-[17px] leading-[1.7] text-steel">
                    {department.detailed_content || department.description || "No detailed clinical overview provided for this department yet. Please consult our 24/7 reception desk for assistance."}
                  </p>
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {FEATURES.map((feat) => (
                      <CheckItem key={feat}>{feat}</CheckItem>
                    ))}
                  </ul>
                </div>

                <aside className="lg:col-span-5">
                  <div className="rounded-[12px] bg-surface border border-line shadow-[var(--shadow-product)] overflow-hidden">
                    <div className="px-6 h-11 flex items-center bg-canvas border-b border-line text-[13px] font-[600] text-ink">
                      Clinic admission details
                    </div>
                    <dl className="divide-y divide-line">
                      {[
                        { icon: Clock, label: 'Working shifts', value: '08:00 AM – 08:00 PM (Clinical)' },
                        { icon: MapPin, label: 'Hospital campus location', value: 'Clinq Center HQ, Floors 2 & 4' },
                        { icon: Stethoscope, label: 'Unit staff count', value: `${department.doctors_count} Lead Specialists` },
                      ].map((row) => (
                        <div key={row.label} className="px-6 py-4 flex items-start gap-4">
                          <row.icon className="w-4 h-4 mt-0.5 text-teal-ink shrink-0" />
                          <div>
                            <dt className="text-[13px] text-steel">{row.label}</dt>
                            <dd className="text-[15px] font-[600] text-ink">{row.value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                </aside>
              </div>
            </section>

            {/* =============== PRACTITIONERS =============== */}
            <section className="bg-surface border-t border-line">
              <div className={`${CONTAINER} py-16 md:py-24`}>
                <div className="flex flex-col gap-3 max-w-[620px]">
                  <h2 className={H3}>
                    Active practitioners in {department.name}
                  </h2>
                  <p className="text-[15px] leading-[1.55] text-steel">
                    Consultations are bookable hour-by-hour, Monday to Friday. Check credentials and reserve your appointment slot.
                  </p>
                </div>

                <div className="mt-10 rounded-[12px] border border-line bg-surface shadow-[var(--shadow-hair)] overflow-hidden">
                  <div className={`hidden md:grid grid-cols-12 gap-4 px-6 h-10 items-center bg-canvas border-b border-line ${LABEL}`}>
                    <span className="col-span-5">Specialist</span>
                    <span className="col-span-3">Experience</span>
                    <span className="col-span-2">Availability</span>
                    <span className="col-span-2 text-right">Rating</span>
                  </div>
                  {filteredSpecialists.length > 0 ? (
                    <ul className="divide-y divide-line">
                      {filteredSpecialists.map((doc) => (
                        <li key={doc.id}>
                          <Link
                            href="/patient/appointments/book"
                            className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center transition-colors hover:bg-canvas"
                          >
                            <span className="md:col-span-5 flex items-center gap-3.5 min-w-0">
                              <Portrait src={doc.image_url} alt={doc.full_name} initials={doc.initials || "MD"} className="w-10 h-10 rounded-full shrink-0" />
                              <span className="min-w-0">
                                <span className="block text-[15px] font-[600] text-ink truncate">{doc.full_name}</span>
                                <span className="block text-[13px] text-steel truncate">{doc.specialty}</span>
                              </span>
                            </span>
                            <span className="md:col-span-3 text-[13px] text-ink">{doc.experience}</span>
                            <span className="md:col-span-2 flex items-center gap-2 text-[13px] text-ink">
                              <span className={`w-1.5 h-1.5 rounded-full ${doc.is_available ? 'bg-teal' : 'bg-fog'}`} />
                              {doc.availability_text}
                            </span>
                            <span className="md:col-span-2 flex items-center md:justify-end gap-4">
                              <span className="flex items-center gap-1 text-[13px] font-[600] text-ink tabular-nums">
                                <Star className="w-3.5 h-3.5 fill-teal text-teal" />
                                {doc.rating.toFixed(1)}
                              </span>
                              <span className="w-8 h-8 rounded-[8px] border border-line flex items-center justify-center text-navy transition-colors group-hover:bg-action group-hover:text-action-fg group-hover:border-transparent">
                                <ArrowUpRight className="w-4 h-4" />
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-6 py-14 text-center text-[14px] text-steel">
                      No active specialists currently logged under this department.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="bg-canvas">
            <div className={`${CONTAINER} py-24 flex justify-center`}>
              <div className="w-full max-w-[460px] rounded-[12px] border border-dashed border-line bg-surface p-10 flex flex-col items-center text-center gap-3">
                <Stethoscope className="w-10 h-10 text-fog" />
                <h3 className="text-[18px] font-[600] text-navy">Department not found</h3>
                <p className="text-[14px] leading-[1.55] text-steel">
                  The clinical department &quot;{slug}&quot; was not found in our records.
                </p>
                <Link href="/departments" className="mt-2 text-[14px] font-[600] text-navy inline-flex items-center gap-1">
                  Browse our care units <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
