'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const dashboardHref = user
    ? (user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'clinician' ? '/admin' : '/patient')
    : '/login';

  const getLinkClass = (path: string, isMobile = false) => {
    const isActive = pathname === path;
    if (isMobile) {
      return `text-lg w-full py-3 border-b border-[#E2E8F0] transition font-[600] flex items-center ${
        isActive ? 'text-brand-blue border-brand-blue' : 'text-[#516161] hover:text-brand-blue'
      }`;
    }
    return `text-base flex items-center h-[21px] transition ${
      isActive 
        ? 'text-brand-blue font-[600] border-b-2 border-brand-blue' 
        : 'text-[#516161] hover:text-brand-blue font-[400]'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[81px] bg-brand-bg-light/90 border-b border-brand-muted/10 backdrop-blur-[6px] z-50 flex items-center">
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 flex justify-between items-center h-20">
        
        {/* Clinq Logo */}
        <Link href="/" className="text-2xl font-extrabold text-brand-blue tracking-[-0.6px] font-[800]">
          Clinq
        </Link>

        {/* Navigation Middle Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-10 h-[23px]">
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

        {/* Right Book Appointment Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link 
              href={dashboardHref} 
              className="text-sm font-[700] text-brand-blue hover:text-brand-blue/80 transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-[700] text-brand-blue hover:text-brand-blue/80 transition"
            >
              Sign In
            </Link>
          )}
          <Link 
            href="/patient/appointments/book" 
            className="w-[193px] h-[36px] bg-[#0F4C81] hover:bg-[#0F4C81]/95 text-[#EFF4FF] font-[700] text-base rounded-[4px] shadow-sm flex items-center justify-center transition"
          >
            Book Appointment
          </Link>
        </div>

        {/* Hamburger Menu Toggle (Mobile) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden text-brand-blue focus:outline-none p-1"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Slide-over Navigation Drawer (Mobile) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[81px] bg-white z-40 flex flex-col px-6 py-8 h-[calc(100vh-81px)] w-full border-t border-[#E2E8F0] overflow-y-auto animate-fade-in">
          <nav className="flex flex-col items-start w-full">
            <Link href="/" onClick={() => setIsOpen(false)} className={getLinkClass('/', true)}>
              Home
            </Link>
            <Link href="/departments" onClick={() => setIsOpen(false)} className={getLinkClass('/departments', true)}>
              Departments
            </Link>
            <Link href="/specialists" onClick={() => setIsOpen(false)} className={getLinkClass('/specialists', true)}>
              Specialists
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className={getLinkClass('/about', true)}>
              About Us
            </Link>
          </nav>

          <div className="flex flex-col gap-4 mt-8 w-full pt-6">
            {user ? (
              <Link 
                href={dashboardHref} 
                onClick={() => setIsOpen(false)}
                className="w-full h-12 border border-brand-blue text-brand-blue font-[700] text-base rounded-[4px] flex items-center justify-center transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full h-12 border border-brand-blue text-brand-blue font-[700] text-base rounded-[4px] flex items-center justify-center transition"
              >
                Sign In
              </Link>
            )}
            <Link 
              href="/patient/appointments/book" 
              onClick={() => setIsOpen(false)}
              className="w-full h-12 bg-[#0F4C81] hover:bg-[#0F4C81]/95 text-[#EFF4FF] font-[700] text-base rounded-[4px] flex items-center justify-center transition shadow-sm"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


