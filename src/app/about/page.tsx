'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PulseField from '@/components/landing/PulseField';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import {
  BTN_ON_DARK, BTN_OUTLINE, BTN_PRIMARY, CONTAINER, ClosingBand, H1, H2, H3, LEDE, Portrait,
} from '@/components/landing/ui';

interface LeaderCard {
  name: string;
  role: string;
  initials: string;
  imageUrl?: string;
}

const LEADERS: LeaderCard[] = [
  {
    name: 'Dr. Sarah Bloom',
    role: 'Chief Medical Officer',
    initials: 'SB',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Marcus Vane',
    role: 'Chief Executive Officer',
    initials: 'MV',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Dr. Elena Rodriguez',
    role: 'Director of AI Research',
    initials: 'ER',
    imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'James Sterling',
    role: 'Chief Operations Officer',
    initials: 'JS',
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
  },
];

const HISTORY = [
  {
    year: '1998',
    title: 'A single cardiology clinic',
    body: 'Clinq was founded as a single cardiology clinic in Seattle, aiming to set new standards in diagnostic care.',
  },
  {
    year: '2010',
    title: 'Fully paperless records',
    body: "Major digital transformation: implementing the region's first fully paperless patient records system.",
  },
  {
    year: '2024',
    title: 'Global expansion and AI',
    body: 'Global expansion and AI integration: launching predictive care models for clinical diagnostics assistance.',
  },
];

export default function AboutPage() {
  const { data } = usePlatformData();
  const totalSpecialists = data?.stats?.totalSpecialists ?? 150;
  const totalPatients = data?.stats?.totalPatients ?? 10000;

  const patientsLabel = totalPatients >= 1000 ? `${(totalPatients / 1000).toFixed(0)}k` : `${totalPatients}`;

  return (
    <div className="relative w-full min-h-screen bg-canvas font-sans antialiased text-steel transition-colors duration-300">
      <PublicNavbar />

      <main>
        {/* =============== HERO =============== */}
        <section className="relative overflow-hidden bg-canvas pt-16">
          <div className="absolute inset-x-0 top-[50%] bottom-0 lg:inset-0 pointer-events-none">
            <PulseField baseline={0.58} fadeFrom={0.32} spikeAt={0.5} />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-canvas" />
          </div>
          <div className={`relative ${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center py-16 md:py-24 lg:min-h-[640px]`}>
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <h1 className={H1}>Pioneering the future of healthcare.</h1>
              <p className={`max-w-[540px] ${LEDE}`}>
                Clinq&apos;s commitment to clinical excellence has defined our journey for over two decades. We merge human compassion with groundbreaking technology to deliver world-class care.
              </p>
              <p className="max-w-[540px] text-[15px] leading-[1.6] text-steel">
                Today that means <span className="text-ink font-[600]">{totalSpecialists}+ specialists</span> caring for{" "}
                <span className="text-ink font-[600]">{patientsLabel}+ patients</span>, with paperless records since 2010.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/specialists" className={BTN_PRIMARY}>
                  Find a specialist
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/departments" className={BTN_OUTLINE}>
                  Our departments
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* =============== MISSION & VISION =============== */}
        <section className="bg-surface border-y border-line">
          <div className={`${CONTAINER} py-20 md:py-28 grid grid-cols-1 md:grid-cols-2`}>
            {[
              {
                label: 'Our mission',
                body: 'Providing patient-centric, technology-driven care that prioritizes recovery and comfort above all else. We leverage high-density data analytics to ensure every clinical decision is backed by precision.',
              },
              {
                label: 'Our vision',
                body: "To be the global standard for medical precision. We aim to redefine the boundaries of what's possible in modern medicine through relentless innovation and a sterile focus on patient outcomes.",
              },
            ].map((item, i) => (
              <article
                key={item.label}
                className={`flex flex-col gap-5 py-10 md:py-0 ${i === 0 ? 'md:pr-12 border-b md:border-b-0 md:border-r border-line' : 'md:pl-12'}`}
              >
                <h2 className={H3}>{item.label}</h2>
                <p className="text-[17px] md:text-[18px] leading-[1.65] text-ink">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* =============== HISTORY =============== */}
        <section className="bg-canvas">
          <div className={`${CONTAINER} py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12`}>
            <div className="lg:col-span-4 lg:sticky lg:top-24 self-start flex flex-col gap-4">
              <h2 className={H2}>Our history.</h2>
              <p className="text-[16px] leading-[1.55] text-steel">A history of medical breakthroughs and patient trust.</p>
            </div>
            <ol className="lg:col-span-7 lg:col-start-6 relative border-l border-line ml-1.5">
              {HISTORY.map((h) => (
                <li
                  key={h.year}
                  className="relative pl-8 md:pl-10 pb-12 last:pb-0"
                >
                  <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-teal ring-4 ring-canvas" />
                  <time className="text-[15px] font-[600] text-teal-ink tabular-nums">{h.year}</time>
                  <h3 className="mt-2 text-[22px] font-[600] tracking-[-0.02em] text-navy">{h.title}</h3>
                  <p className="mt-2 text-[16px] leading-[1.6] text-steel max-w-[520px]">{h.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* =============== LEADERSHIP =============== */}
        <section className="bg-surface border-t border-line">
          <div className={`${CONTAINER} py-20 md:py-28`}>
            <div className="flex flex-col gap-4 max-w-[560px]">
              <h2 className={H2}>Our leadership.</h2>
              <p className="text-[17px] leading-[1.55] text-steel">The minds guiding the evolution of Clinq.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LEADERS.map((leader) => (
                <figure
                  key={leader.name}
                  className="group flex flex-col gap-4"
                >
                  <div className="relative aspect-[4/5] rounded-[12px] overflow-hidden border border-line bg-canvas">
                    <Portrait
                      src={leader.imageUrl}
                      alt={leader.name}
                      initials={leader.initials}
                      fill
                      imgClassName="grayscale-[0.25] transition-all duration-700 ease-[var(--ease-out-soft)] group-hover:grayscale-0 group-hover:scale-[1.03]"
                      textClassName="text-[40px]"
                    />
                  </div>
                  <figcaption>
                    <p className="text-[17px] font-[600] tracking-[-0.01em] text-navy">{leader.name}</p>
                    <p className="mt-0.5 text-[14px] text-steel">{leader.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* =============== CTA =============== */}
        <ClosingBand
          title="Experience clinical precision."
          body="Our specialists are ready to provide you with the most advanced medical care available today. Join the thousands who trust Clinq."
        >
          <Link href="/specialists" className={BTN_ON_DARK}>
            Find a specialist
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </ClosingBand>
      </main>

      <PublicFooter />
    </div>
  );
}
