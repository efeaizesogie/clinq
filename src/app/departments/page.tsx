'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse, Brain, Baby, Sparkles, Activity, Eye, Stethoscope,
  Search, ChevronRight, ClipboardCheck, ShieldCheck, Phone,
} from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import {
  BTN_ON_DARK, BTN_OUTLINE_ON_DARK, CONTAINER, ClosingBand, H2, INPUT, LABEL,
  PageHeader, Segmented,
} from '@/components/landing/ui';

// Map icon_name strings from the database to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartPulse, Brain, Baby, Sparkles, Activity, Eye, Stethoscope,
  ClipboardCheck, ShieldCheck, Search,
};

function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || Stethoscope;
}

const CATEGORIES = [
  { value: 'All', label: 'All care categories' },
  { value: 'Primary Care', label: 'Primary care' },
  { value: 'Specialty', label: 'Specialty' },
  { value: 'Clinical', label: 'Clinical' },
];

const PREP_STEPS = [
  {
    title: 'Mapped specialists',
    body: 'Verify credentials, check consulting details, and review pricing on practitioner slots.',
  },
  {
    title: 'Reserve your slot',
    body: 'Confirm your appointment timing, check HMO co-pay amounts, and lock in session slots.',
  },
  {
    title: 'Digital check-in',
    body: 'Complete registration and health details in your patient portal to bypass physical wait queues.',
  },
];

export default function DepartmentsPage() {
  const { data, isLoading } = usePlatformData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const departments = data?.departments ?? [];

  const filteredDepts = departments.filter(dept => {
    const matchesFilter = selectedFilter === 'All' || dept.category === selectedFilter;
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dept.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="relative w-full min-h-screen bg-canvas font-sans antialiased text-steel transition-colors duration-300">
      <PublicNavbar />

      <main>
        <PageHeader
          title="Our specialized departments."
          lede="Access world-class healthcare through our integrated departments. We combine cutting-edge technology with compassionate care to provide specialized treatments tailored to your needs."
        />

        {/* =============== SEARCH & GRID =============== */}
        <section className="bg-canvas">
          <div className={`${CONTAINER} py-16 md:py-24 flex flex-col gap-10`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative w-full lg:w-[380px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" />
                <input
                  type="text"
                  placeholder="Search for a department"
                  aria-label="Search departments"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${INPUT} pl-10 pr-4`}
                />
              </div>
              <Segmented label="Care category" options={CATEGORIES} value={selectedFilter} onChange={setSelectedFilter} />
            </div>

            <p className="text-[14px] text-steel" aria-live="polite">
              {isLoading ? 'Loading departments…' : `Showing ${filteredDepts.length} of ${departments.length} departments`}
            </p>

            <div className="rounded-[12px] border border-line bg-surface shadow-[var(--shadow-hair)] overflow-hidden">
              <div className={`hidden md:grid grid-cols-12 gap-6 px-6 h-10 items-center bg-canvas border-b border-line ${LABEL}`}>
                <span className="col-span-4">Department</span>
                <span className="col-span-5">Focus</span>
                <span className="col-span-2">Category</span>
                <span className="col-span-1 text-right">Doctors</span>
              </div>
              {isLoading ? (
                <div className="divide-y divide-line">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[72px] px-6 flex items-center gap-4">
                      <span className="w-9 h-9 rounded-[8px] bg-canvas animate-pulse" />
                      <span className="h-3 w-56 rounded bg-canvas animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : filteredDepts.length > 0 ? (
                <ul className="divide-y divide-line">
                  {filteredDepts.map((dept) => (
                    <li key={dept.id}>
                      <Link
                        href={`/departments/${dept.name.toLowerCase()}`}
                        className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 px-6 py-5 items-center transition-colors hover:bg-canvas"
                      >
                        <span className="md:col-span-4 flex items-center gap-3.5">
                          <span className="w-9 h-9 rounded-[8px] bg-canvas border border-line text-teal-ink flex items-center justify-center shrink-0">
                            {React.createElement(getIcon(dept.icon_name), { className: "w-[18px] h-[18px]" })}
                          </span>
                          <span className="text-[17px] font-[600] tracking-[-0.01em] text-navy">{dept.name}</span>
                        </span>
                        <span className="md:col-span-5 text-[14px] leading-[1.5] text-steel md:line-clamp-2">{dept.description}</span>
                        <span className="md:col-span-2 text-[13px] text-steel">{dept.category}</span>
                        <span className="md:col-span-1 flex items-center md:justify-end gap-3 text-[14px] font-[600] text-ink tabular-nums">
                          {dept.doctors_count}
                          <ChevronRight className="w-4 h-4 text-steel transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-16 text-center">
                  <p className="text-[15px] font-[600] text-ink">No matching clinics found under this category.</p>
                  <p className="mt-1 text-[14px] text-steel">Try another search or choose a different care category.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =============== PREPARING FOR YOUR APPOINTMENT =============== */}
        <section className="bg-surface border-y border-line">
          <div className={`${CONTAINER} py-20 md:py-28`}>
            <div className="flex flex-col gap-4 max-w-[560px]">
              <h2 className={H2}>Preparing for your appointment.</h2>
              <p className="text-[17px] leading-[1.55] text-steel">
                Three simple steps to ensure a seamless checkout and consult experience at Clinq.
              </p>
            </div>
            <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 border-t border-line">
              {PREP_STEPS.map((step, i) => (
                <li key={step.title} className={`pt-8 pb-2 ${i === 0 ? 'md:pr-8' : 'md:px-8 md:border-l md:border-line'}`}>
                  <h3 className="text-[20px] font-[600] tracking-[-0.02em] text-navy">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-steel">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* =============== IMMEDIATE ASSISTANCE =============== */}
        <ClosingBand
          title="Need immediate assistance?"
          body="Our central reception and emergency department are available 24/7 to guide you to the right specialist."
        >
          <a href="tel:911" className={BTN_ON_DARK}>
            <Phone className="w-4 h-4" />
            Call emergency 911
          </a>
          <Link href="/support" className={BTN_OUTLINE_ON_DARK}>
            Contact us
          </Link>
        </ClosingBand>
      </main>

      <PublicFooter />
    </div>
  );
}
