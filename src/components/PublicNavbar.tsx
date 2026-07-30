'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

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

    // Track theme state reactively
    setIsDark(document.documentElement.classList.contains("dark"));
    const handleThemeChange = (e: Event) => {
      const customTheme = (e as CustomEvent).detail as "light" | "dark";
      if (customTheme) {
        setIsDark(customTheme === "dark");
      } else {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };
    window.addEventListener("clinq-theme-change", handleThemeChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("clinq-theme-change", handleThemeChange);
    };
  }, []);

  const toggleTheme = async () => {
    try {
      const nextTheme = isDark ? "light" : "dark";
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setIsDark(nextTheme === "dark");

      window.dispatchEvent(new CustomEvent("clinq-theme-change", { detail: nextTheme }));

      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        if (currentUser) {
          supabase.auth.updateUser({
            data: { theme: nextTheme }
          }).catch(err => {
            console.error("Error updating user metadata theme preference:", err);
          });
        }
      });
    } catch (err) {
      console.error("Error toggling public theme:", err);
    }
  };

  const dashboardHref = user
    ? (user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'clinician' ? '/admin' : '/patient')
    : '/login';

  const getLinkClass = (path: string, isMobile = false) => {
    const isActive = pathname === path;
    if (isMobile) {
      return `text-lg w-full py-3 border-b border-[#E2E8F0] dark:border-[#22354A] transition font-[600] flex items-center ${
        isActive 
          ? 'text-brand-blue dark:text-white border-brand-blue dark:border-white' 
          : 'text-[#516161] dark:text-[#A5AAB5] hover:text-brand-blue dark:hover:text-white'
      }`;
    }
    return `text-base flex items-center h-[21px] transition ${
      isActive 
        ? 'text-brand-blue dark:text-white font-[600] border-b-2 border-brand-blue dark:border-white' 
        : 'text-[#516161] dark:text-[#A5AAB5] hover:text-brand-blue dark:hover:text-white font-[400]'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[81px] bg-brand-bg-light/90 dark:bg-[#0D1C2E]/90 border-b border-brand-muted/10 dark:border-[#22354A] backdrop-blur-[6px] z-50 flex items-center transition-colors duration-300">
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 flex justify-between items-center h-20">
        
        {/* Clinq Logo */}
        <Link href="/" className="text-2xl font-extrabold text-brand-blue dark:text-white tracking-[-0.6px] font-[800]">
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
        <div className="hidden md:flex items-center gap-6">
          {/* Day/Night Theme Switcher Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <Link 
              href={dashboardHref} 
              className="text-sm font-[700] text-brand-blue dark:text-[#EFF4FF] hover:text-brand-blue/80 dark:hover:text-[#EFF4FF]/80 transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-[700] text-brand-blue dark:text-[#EFF4FF] hover:text-brand-blue/80 dark:hover:text-[#EFF4FF]/80 transition"
            >
              Sign In
            </Link>
          )}
          <Link 
            href="/patient/appointments/book" 
            className="w-[193px] h-[36px] bg-[#0F4C81] dark:bg-[#5F9EA0] hover:bg-[#0F4C81]/95 dark:hover:bg-[#5F9EA0]/95 text-[#EFF4FF] dark:text-[#0D1C2E] font-[700] text-base rounded-[4px] shadow-sm flex items-center justify-center transition"
          >
            Book Appointment
          </Link>
        </div>

        {/* Hamburger Menu Toggle / Controls (Mobile) */}
        <div className="flex md:hidden items-center gap-4">
          {/* Day/Night Theme Switcher Toggle Button (Mobile) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex text-brand-blue dark:text-[#5F9EA0] focus:outline-none p-1"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Slide-over Navigation Drawer (Mobile) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[81px] bg-white dark:bg-[#0D1C2E] z-40 flex flex-col px-6 py-8 h-[calc(100vh-81px)] w-full border-t border-[#E2E8F0] dark:border-[#22354A] overflow-y-auto animate-fade-in animate-duration-200">
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
                className="w-full h-12 border border-brand-blue dark:border-[#5F9EA0] text-brand-blue dark:text-[#5F9EA0] font-[700] text-base rounded-[4px] flex items-center justify-center transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full h-12 border border-brand-blue dark:border-[#5F9EA0] text-brand-blue dark:text-[#5F9EA0] font-[700] text-base rounded-[4px] flex items-center justify-center transition"
              >
                Sign In
              </Link>
            )}
            <Link 
              href="/patient/appointments/book" 
              onClick={() => setIsOpen(false)}
              className="w-full h-12 bg-[#0F4C81] dark:bg-[#5F9EA0] hover:bg-[#0F4C81]/95 dark:hover:bg-[#5F9EA0]/95 text-[#EFF4FF] dark:text-[#0D1C2E] font-[700] text-base rounded-[4px] flex items-center justify-center transition shadow-sm"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


