"use client";

import React from "react";
import { Search, Bell, Settings, Menu } from "lucide-react";

interface PatientTopNavProps {
  onMenuToggle?: () => void;
}

export default function PatientTopNav({ onMenuToggle }: PatientTopNavProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 bg-[#F8F9FF] border-b border-[#C2C7D1] px-4 md:px-[64px] shrink-0">
      {/* Search Input Area */}
      <div className="flex items-center gap-3 flex-1 max-w-[320px]">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onMenuToggle}
          className="flex md:hidden items-center justify-center p-2 rounded-lg text-[#00355F] hover:bg-[#EFF4FF] transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#42474F]" />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full h-10 pl-10 pr-4 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[12px] text-[16px] font-[400] text-[#6B7280] font-sans focus:outline-none focus:ring-1 focus:ring-[#00355F]/30"
          />
        </div>

        {/* Small screen Search Button (only replacement for input on xs screen) */}
        <button className="sm:hidden p-2 rounded-lg text-[#42474F] hover:bg-[#EFF4FF]">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-6">
        {/* Bell Notify Button */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#00355F] hover:bg-[#EFF4FF] transition-colors">
          <Bell className="w-4 h-5" />
          <span className="absolute top-[2px] right-[6px] w-[6px] h-[6px] bg-[#BA1A1A] rounded-full" />
        </button>

        {/* Settings Button */}
        <button className="flex items-center justify-center w-8 h-8 rounded-lg text-[#00355F] hover:bg-[#EFF4FF] transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile Info Card */}
        <div className="flex items-center justify-center w-8 h-8 rounded-[12px] bg-[#D5E3FC] border border-[#C2C7D1] overflow-hidden cursor-pointer select-none">
          <span className="text-[12px] font-[700] text-[#00355F]">RH</span>
        </div>
      </div>
    </header>
  );
}
