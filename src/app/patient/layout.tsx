"use client";

import React, { useState, useEffect } from "react";
import PatientSidebar from "@/components/PatientSidebar";
import PatientTopNav from "@/components/PatientTopNav";
import { createClient } from "@/lib/supabase/client";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // 1. Initial theme load from localStorage (instant rendering)
    const cachedTheme = localStorage.getItem("clinq-theme") as "light" | "dark";
    if (cachedTheme) {
      setTheme(cachedTheme);
      if (cachedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    // 2. Fetch theme from Supabase auth session metadata
    async function loadThemeFromDB() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata?.theme) {
          const dbTheme = user.user_metadata.theme as "light" | "dark";
          setTheme(dbTheme);
          localStorage.setItem("clinq-theme", dbTheme);
          if (dbTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } catch (err) {
        console.error("Failed loading theme preference from user metadata:", err);
      }
    }
    loadThemeFromDB();

    // 3. Listen to reactive theme change events
    const handleThemeEvent = (e: Event) => {
      const customTheme = (e as CustomEvent).detail as "light" | "dark";
      if (customTheme) {
        setTheme(customTheme);
        localStorage.setItem("clinq-theme", customTheme);
        if (customTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("clinq-theme-change", handleThemeEvent);
    return () => {
      window.removeEventListener("clinq-theme-change", handleThemeEvent);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FF] dark:bg-[#080F18] font-sans antialiased text-[#42474F] dark:text-[#E3E3E3] transition-colors duration-300">
      {/* Sidebar Navigation */}
      <PatientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[256px] relative">
        {/* Top Header navbar */}
        <PatientTopNav onMenuToggle={() => setSidebarOpen(true)} />

        {/* Content Body Grid */}
        <main className="flex-grow w-full min-w-0 overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
