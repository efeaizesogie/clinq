'use client';

import React from 'react';
import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Patient services',
    links: [
      { href: '/patient/appointments/book', label: 'Book Appointment' },
      { href: '/specialists', label: 'Find Specialists' },
      { href: '/departments', label: 'Medical Units' },
    ],
  },
  {
    title: 'Clinq Hospital',
    links: [
      { href: '/about', label: 'About Our Medical Center' },
      { href: '/login', label: 'Patient Portal Login' },
      { href: '/resources', label: 'Wellness Resources & Blog' },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="w-full bg-brand-blue dark:bg-[#0D1C2E] text-white/60 font-sans border-t border-white/10 dark:border-[#1C2B3D] shrink-0 transition-colors duration-300">
      <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 pt-16 md:pt-20 pb-8 flex flex-col gap-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-4 max-w-[340px]">
            <Link href="/" className="text-[22px] font-[800] text-white tracking-[-0.04em]">
              Clinq
            </Link>
            <p className="text-[14px] leading-[1.6] text-[#c9d8e8]">
              Empowering patients and clinicians with smart, secure, real-time healthcare booking and digital medical charts.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-3 flex flex-col gap-4">
              <h5 className="text-[13px] font-[600] text-white">{col.title}</h5>
              <ul className="flex flex-col gap-2.5 text-[14px]">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#c9d8e8] hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect Links */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <h5 className="text-[13px] font-[600] text-white">Connect</h5>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="w-9 h-9 rounded-[8px] border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition"
                aria-label="Clinq on Facebook"
              >
                <svg className="w-2.5 h-3.5 fill-current" viewBox="0 0 320 512" aria-hidden="true">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-[8px] border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition"
                aria-label="Clinq on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 448 512" aria-hidden="true">
                  <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px] text-[#a9bed3]">
          <span>© {new Date().getFullYear()} Clinq Medical Systems. All rights reserved.</span>
          <span>HIPAA compliant · 256-bit encryption</span>
        </div>
      </div>
    </footer>
  );
}
