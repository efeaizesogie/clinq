'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="w-full bg-brand-blue py-16 text-white/60 font-sans border-t border-white/10 shrink-0">
      <div className="w-[1280px] max-w-[1280px] mx-auto px-16 flex flex-col gap-16">
        
        {/* Footer Top Grid */}
        <div className="flex justify-between items-start gap-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-6 w-[252px]">
            <Link href="/" className="text-2xl font-[800] text-white tracking-[-0.6px]">
              Clinq
            </Link>
            <p className="text-sm font-[400] text-white/60 leading-5">
              Internal Operating System for Clinq Medical Systems.
            </p>
          </div>

          {/* Module Links */}
          <div className="flex flex-col gap-6 w-[252px]">
            <h5 className="text-sm font-[700] text-white tracking-[1.4px] uppercase">
              Internal Modules
            </h5>
            <ul className="flex flex-col gap-3 font-[400] text-sm">
              <li>
                <Link href="/admin/staff" className="hover:text-white transition">
                  Staff Management
                </Link>
              </li>
              <li>
                <Link href="/admin/inventory" className="hover:text-white transition">
                  Inventory ERP
                </Link>
              </li>
              <li>
                <Link href="/admin/patients" className="hover:text-white transition">
                  Patient Flow
                </Link>
              </li>
            </ul>
          </div>

          {/* System Links */}
          <div className="flex flex-col gap-6 w-[252px]">
            <h5 className="text-sm font-[700] text-white tracking-[1.4px] uppercase">
              System
            </h5>
            <ul className="flex flex-col gap-3 font-[400] text-sm">
              <li>
                <Link href="/compliance" className="hover:text-white transition">
                  Compliance
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition">
                  IT Support
                </Link>
              </li>
              <li>
                <Link href="/updates" className="hover:text-white transition">
                  Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Links */}
          <div className="flex flex-col gap-6 w-[252px]">
            <h5 className="text-sm font-[700] text-white tracking-[1.4px] uppercase">
              Connect
            </h5>
            <div className="flex items-center gap-4">
              <a 
                href="#"
                className="w-8 h-8 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-white/20 transition hover:text-white"
                aria-label="Connect Link 1"
              >
                <svg className="w-2.5 h-3 fill-current" viewBox="0 0 320 512">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </a>
              <a 
                href="#"
                className="w-8 h-8 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-white/20 transition hover:text-white"
                aria-label="Connect Link 2"
              >
                <svg className="w-3.5 h-3 fill-current" viewBox="0 0 448 512">
                  <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom Border */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-start text-[10px] uppercase font-[400] text-white/40 tracking-[1px] h-12">
          © 2026 CLINQ MEDICAL SYSTEMS. ALL RIGHTS RESERVED.
        </div>

      </div>
    </footer>
  );
}
