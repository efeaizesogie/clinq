'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Star, Calendar, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import type { Specialist } from '@/lib/types';
import {
  BTN_ON_DARK, BTN_OUTLINE_ON_DARK, CONTAINER, ClosingBand, H3, INPUT, LABEL,
  PageHeader, Portrait, Segmented, SelectMenu,
} from '@/components/landing/ui';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PAGE_SIZE = 9;

/** "NEXT SLOT: TOMORROW" → "Next slot: tomorrow" */
function sentenceCase(text: string) {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Compute rolling availability text and whether the doctor works today */
function getDynamicAvailability(doc: Specialist): { text: string; isToday: boolean } {
  const days = doc.availability_days;
  if (!days || days.length === 0) return { text: doc.availability_text, isToday: doc.is_available };
  const todayDow = new Date().getDay();
  if (days.includes(todayDow)) return { text: 'AVAILABLE TODAY', isToday: true };
  for (let offset = 1; offset <= 7; offset++) {
    const nextDow = (todayDow + offset) % 7;
    if (days.includes(nextDow)) {
      if (offset === 1) return { text: 'NEXT SLOT: TOMORROW', isToday: false };
      return { text: `NEXT SLOT: ${DAY_LABELS[nextDow]}`, isToday: false };
    }
  }
  return { text: doc.availability_text, isToday: doc.is_available };
}

type Availability = 'any' | 'today';
type ViewMode = 'grid' | 'list';

export default function SpecialistsPage() {
  const { data, isLoading } = usePlatformData();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [availability, setAvailability] = useState<Availability>('any');
  const [activePage, setActivePage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const specialists = data?.specialists ?? [];
  const departments = data?.departments ?? [];
  const departmentNames = ['All Departments', ...departments.map(d => d.name)];

  const filteredSpecialists = specialists.filter(doc => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = doc.full_name.toLowerCase().includes(q) ||
                          doc.specialty.toLowerCase().includes(q) ||
                          doc.bio.toLowerCase().includes(q);
    const matchesDept = selectedDept === 'All Departments' || (doc.department_name || '') === selectedDept;
    const matchesAvailability = availability === 'any' || getDynamicAvailability(doc).isToday;
    return matchesSearch && matchesDept && matchesAvailability;
  });

  const pageCount = Math.max(1, Math.ceil(filteredSpecialists.length / PAGE_SIZE));
  const page = Math.min(activePage, pageCount);
  const pageItems = filteredSpecialists.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p: number) => {
    setActivePage(p);
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookClick = (doc: Specialist) => {
    // Navigate directly to the booking wizard with this specialist pre-selected
    router.push(`/patient/appointments/book?doctor_id=${doc.id}&specialty=${encodeURIComponent(doc.specialty)}`);
  };

  return (
    <div className="relative w-full min-h-screen bg-canvas font-sans antialiased text-steel transition-colors duration-300">
      <PublicNavbar />

      <main>
        <PageHeader
          title="World-class medical specialists."
          lede="Our institution brings together the brightest minds in medicine. From pioneering surgeons to compassionate therapists, explore our directory of board-certified specialists dedicated to your well-being."
        />

        {/* =============== STICKY FILTER BAR =============== */}
        <div className="lg:sticky lg:top-16 z-30 bg-canvas/85 dark:bg-[#080f18]/85 backdrop-blur-xl border-b border-line">
          <div className={`${CONTAINER} py-4 flex flex-col lg:flex-row lg:items-center gap-3`}>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" />
              <input
                type="text"
                placeholder="Search by name or keyword"
                aria-label="Search specialists"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActivePage(1); }}
                className={`${INPUT} pl-10 pr-4`}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SelectMenu
                label="Department"
                value={selectedDept}
                options={departmentNames}
                onChange={(v) => { setSelectedDept(v); setActivePage(1); }}
                className="sm:w-[240px]"
              />
              <Segmented<Availability>
                label="Availability"
                value={availability}
                onChange={(v) => { setAvailability(v); setActivePage(1); }}
                options={[
                  { value: 'any', label: 'Any availability' },
                  { value: 'today', label: 'Available today' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* =============== DIRECTORY =============== */}
        <section id="directory" className="bg-canvas scroll-mt-36">
          <div className={`${CONTAINER} py-12 md:py-16`}>
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-line">
              <h2 className={H3} aria-live="polite">
                {isLoading ? 'Loading specialists' : `Found ${filteredSpecialists.length} specialists`}
              </h2>
              <Segmented<ViewMode>
                label="Layout"
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'grid', label: 'Grid' },
                  { value: 'list', label: 'List' },
                ]}
              />
            </div>

            <div className="mt-8">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[460px] rounded-[12px] bg-surface border border-line animate-pulse" />
                  ))}
                </div>
              ) : pageItems.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
                  {pageItems.map((doc) => {
                    const avail = getDynamicAvailability(doc);
                    return (
                      <article
                        key={doc.id}
                        className={`group rounded-[12px] bg-surface border border-line overflow-hidden flex transition-all duration-300 ease-[var(--ease-out-soft)] hover:shadow-[var(--shadow-product)] ${
                          viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row'
                        }`}
                      >
                        {/* Portrait */}
                        <div className={`relative shrink-0 bg-canvas overflow-hidden ${viewMode === 'grid' ? 'aspect-[4/3]' : 'aspect-[4/3] sm:aspect-auto sm:w-[240px]'}`}>
                          <Portrait
                            src={doc.image_url}
                            alt={doc.full_name}
                            initials={doc.initials || 'MD'}
                            fill
                            imgClassName="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                            textClassName="text-[32px]"
                          />
                          <span className="absolute top-3 left-3 h-7 px-3 rounded-full bg-white text-[12px] font-[500] text-[#0D1C2E] shadow-[var(--shadow-hair)] flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${avail.isToday ? 'bg-[#33797b]' : 'bg-[#9aa1ad]'}`} />
                            {sentenceCase(avail.text)}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-6 flex flex-col gap-4">
                          <div>
                            <h3 className="text-[18px] font-[600] tracking-[-0.02em] text-navy">{doc.full_name}</h3>
                            <p className="text-[14px] text-steel mt-0.5">{doc.specialty}</p>
                          </div>

                          <dl className="grid grid-cols-2 py-3 border-y border-line divide-x divide-line">
                            <div className="px-0 first:pr-4 last:pl-4">
                              <dt className={LABEL}>Experience</dt>
                              <dd className="text-[14px] font-[600] text-ink mt-0.5">{doc.experience}</dd>
                            </div>
                            <div className="px-0 first:pr-4 last:pl-4">
                              <dt className={LABEL}>Rating</dt>
                              <dd className="text-[14px] font-[600] text-ink mt-0.5 flex items-center gap-1 tabular-nums">
                                <Star className="w-3.5 h-3.5 fill-teal text-teal" /> {doc.rating}
                              </dd>
                            </div>
                          </dl>

                          <p className="text-[14px] leading-[1.55] text-steel line-clamp-2">{doc.bio}</p>

                          <button
                            onClick={() => handleBookClick(doc)}
                            className="mt-auto h-11 rounded-[8px] bg-action text-action-fg text-[14px] font-[600] flex items-center justify-center gap-2 shadow-[var(--shadow-btn)] transition-colors hover:bg-action-hover"
                          >
                            <Calendar className="w-4 h-4" />
                            Book appointment
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[12px] border border-dashed border-line bg-surface px-6 py-16 text-center">
                  <p className="text-[15px] font-[600] text-ink">No matching specialists found in this category.</p>
                  <p className="mt-1 text-[14px] text-steel">Try a different name, department or availability.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && pageCount > 1 && (
              <nav aria-label="Pagination" className="mt-12 pt-8 border-t border-line flex items-center justify-between gap-4">
                <span className="text-[14px] text-steel">
                  Page {page} of {pageCount}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="w-10 h-10 rounded-[8px] border border-line flex items-center justify-center text-navy transition-colors hover:bg-surface disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      aria-current={page === i + 1 ? 'page' : undefined}
                      className={`w-10 h-10 rounded-[8px] text-[14px] font-[600] tabular-nums transition-colors ${
                        page === i + 1 ? 'bg-action text-action-fg shadow-[var(--shadow-btn)]' : 'border border-line text-steel hover:text-navy hover:bg-surface'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === pageCount}
                    aria-label="Next page"
                    className="w-10 h-10 rounded-[8px] border border-line flex items-center justify-center text-navy transition-colors hover:bg-surface disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </nav>
            )}
          </div>
        </section>

        {/* =============== CAN'T FIND A SPECIALIST =============== */}
        <ClosingBand
          title="Can't find the right specialist?"
          body="Our patient coordinators are available 24/7 across 500+ specialists and 45 clinics to help you find the right match for your medical needs and insurance provider."
        >
          <Link href="/chat" className={BTN_ON_DARK}>
            <MessageCircle className="w-4 h-4" />
            Chat with us
          </Link>
          <Link href="/coordinator" className={BTN_OUTLINE_ON_DARK}>
            Request assistance
          </Link>
        </ClosingBand>
      </main>

      <PublicFooter />
    </div>
  );
}
