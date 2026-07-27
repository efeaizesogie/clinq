'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicNavbar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `text-base flex items-center h-[21px] transition ${
      isActive 
        ? 'text-brand-blue font-[600] border-b-2 border-brand-blue' 
        : 'text-[#516161] hover:text-brand-blue font-[400]'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[81px] bg-brand-bg-light/90 border-b border-brand-muted/10 backdrop-blur-[6px] z-50 flex items-center">
      <div className="w-[1280px] max-w-[1280px] mx-auto px-16 flex justify-between items-center h-20">
        
        {/* Clinq Logo */}
        <Link href="/" className="text-2xl font-extrabold text-brand-blue tracking-[-0.6px] font-[800]">
          Clinq
        </Link>

        {/* Navigation Middle Links */}
        <nav className="flex items-center gap-10 h-[23px]">
          <Link href="/" className={getLinkClass('/')}>
            Home
          </Link>
          <Link href="/departments" className={getLinkClass('/departments')}>
            Departments
          </Link>
          <Link href="/specialists" className={getLinkClass('/specialists')}>
            Specialists
          </Link>
          <Link href="/about" className={getLinkClass('/about')}>
            About Us
          </Link>
        </nav>

        {/* Right Book Appointment Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-[700] text-brand-blue hover:text-brand-blue/80 transition"
          >
            Sign In
          </Link>
          <Link 
            href="/patient/appointments/book" 
            className="w-[193px] h-[36px] bg-[#0F4C81] hover:bg-[#0F4C81]/95 text-[#EFF4FF] font-[700] text-base rounded-[4px] shadow-sm flex items-center justify-center transition"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </header>
  );
}

