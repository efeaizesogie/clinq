'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/departments', label: 'Departments' },
  { href: '/specialists', label: 'Specialists' },
  { href: '/about', label: 'About Us' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Transparent over the top of the page, solid once scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const solid = scrolled || isOpen;

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `h-8 px-3 rounded-[8px] flex items-center text-[14px] tracking-[-0.01em] transition-colors duration-200 ${
      isActive
        ? 'text-[#00355F] dark:text-white font-[600]'
        : 'text-[#5E6673] dark:text-[#A5AAB5] font-[500] hover:text-[#00355F] dark:hover:text-white hover:bg-[#00355F]/[0.04] dark:hover:bg-white/5'
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `w-full py-4 border-b border-[#E3E6EE] dark:border-[#1C2B3D] flex items-center justify-between text-[20px] font-[600] tracking-[-0.02em] transition ${
      isActive ? 'text-[#00355F] dark:text-white' : 'text-[#5E6673] dark:text-[#A5AAB5]'
    }`;
  };

  const iconBtnClass =
    'flex items-center justify-center w-9 h-9 rounded-[8px] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#00355F]/[0.05] dark:hover:bg-white/5 transition-colors cursor-pointer';

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center border-b transition-[background-color,border-color] duration-300 ${
        solid
          ? 'bg-white/90 dark:bg-[#080f18]/90 border-[#E3E6EE] dark:border-[#1C2B3D] backdrop-blur-xl'
          : 'bg-[#F8F9FF]/40 dark:bg-[#080f18]/40 border-transparent backdrop-blur-md'
      }`}
    >
      <div className="relative w-full max-w-[1200px] mx-auto px-5 md:px-8 flex items-center justify-between">

        {/* Clinq Logo */}
        <Link href="/" className="text-[21px] font-[800] text-brand-blue dark:text-white tracking-[-0.04em]">
          Clinq
        </Link>

        {/* Navigation Middle Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={getLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={iconBtnClass}
          >
            {isDark ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
          </button>

          <Link
            href={user ? dashboardHref : '/login'}
            className="h-9 px-3 rounded-[8px] flex items-center text-[14px] font-[500] text-[#00355F] dark:text-white hover:bg-[#00355F]/[0.04] dark:hover:bg-white/5 transition-colors"
          >
            {user ? 'Dashboard' : 'Sign in'}
          </Link>
          <Link
            href="/patient/appointments/book"
            className="group h-9 pl-4 pr-3 rounded-[8px] flex items-center gap-1 text-[14px] font-[600] bg-[#00355F] dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] shadow-[var(--shadow-btn)] hover:bg-[#0F4C81] dark:hover:bg-[#73B2B4] transition-colors"
          >
            Book appointment
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Controls (Mobile) */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={iconBtnClass}
          >
            {isDark ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={iconBtnClass}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation Sheet (Mobile) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white dark:bg-[#080f18] z-40 flex flex-col px-5 pt-4 pb-8 h-[calc(100dvh-64px)] overflow-y-auto">
          <nav className="flex flex-col w-full" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={getMobileLinkClass(link.href)}>
                {link.label}
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-8 flex flex-col gap-3">
            <Link
              href={user ? dashboardHref : '/login'}
              onClick={() => setIsOpen(false)}
              className="h-12 rounded-[8px] border border-[#00355F] dark:border-[#5F9EA0] text-[#00355F] dark:text-[#5F9EA0] font-[600] text-[15px] flex items-center justify-center"
            >
              {user ? 'Dashboard' : 'Sign in'}
            </Link>
            <Link
              href="/patient/appointments/book"
              onClick={() => setIsOpen(false)}
              className="h-12 rounded-[8px] bg-[#00355F] dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] font-[600] text-[15px] flex items-center justify-center gap-1 shadow-[var(--shadow-btn)]"
            >
              Book appointment <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
