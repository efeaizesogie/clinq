"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface PatientTopNavProps {
  onMenuToggle?: () => void;
}

export default function PatientTopNav({ onMenuToggle }: PatientTopNavProps) {
  const [initials, setInitials] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    async function fetchUserInitials() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase
          .from("patient_profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();
          
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
        if (profile?.full_name) {
          const nameParts = profile.full_name.split(" ");
          if (nameParts.length > 1) {
            setInitials(`${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`);
          } else {
            setInitials(nameParts[0].substring(0, 2).toUpperCase());
          }
        } else {
          // Fallback to email or generic
          const fb = user.email ? user.email.substring(0, 2).toUpperCase() : "PA";
          setInitials(fb);
        }
      } catch (err) {
        console.error("Error fetching patient initials:", err);
      }
    }
    fetchUserInitials();

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("patient_settings")
          .upsert({ patient_id: user.id, theme: nextTheme }, { onConflict: "patient_id" });
      }
    } catch (err) {
      console.error("Error toggling patient theme:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 bg-[#F8F9FF] dark:bg-[#0D1C2E] border-b border-[#C2C7D1] dark:border-[#22354A] px-4 md:px-[64px] shrink-0 transition-colors duration-300">
      {/* Search Input Area */}
      <div className="flex items-center gap-3 flex-1 max-w-[320px]">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onMenuToggle}
          className="flex md:hidden items-center justify-center p-2 rounded-lg text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#42474F] dark:text-[#A5AAB5]" />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full h-10 pl-10 pr-4 bg-[#EFF4FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] text-[16px] font-[400] text-[#6B7280] dark:text-[#E3E3E3] font-sans focus:outline-none focus:ring-1 focus:ring-[#00355F]/30"
          />
        </div>

        {/* Small screen Search Button (only replacement for input on xs screen) */}
        <button className="sm:hidden p-2 rounded-lg text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40]">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-6">
        {/* Bell Notify Button */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] transition-colors">
          <Bell className="w-4 h-5" />
          <span className="absolute top-[2px] right-[6px] w-[6px] h-[6px] bg-[#BA1A1A] rounded-full" />
        </button>

        {/* Day/Night Theme Switcher Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile Info Card */}
        <Link href="/patient/settings" className="flex items-center justify-center w-8 h-8 rounded-[12px] bg-[#D5E3FC] dark:bg-[#1E2D4A] border border-[#C2C7D1] dark:border-[#22354A] overflow-hidden cursor-pointer select-none">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[12px] font-[700] text-[#00355F] dark:text-white">{initials || "..."}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
