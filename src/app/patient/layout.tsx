"use client";

import React, { useState } from "react";
import PatientSidebar from "@/components/PatientSidebar";
import PatientTopNav from "@/components/PatientTopNav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FF] font-sans antialiased text-[#42474F]">
      {/* Sidebar Navigation */}
      <PatientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[256px] relative">
        {/* Top Header navbar */}
        <PatientTopNav onMenuToggle={() => setSidebarOpen(true)} />

        {/* Content Body Grid */}
        <main className="flex-grow w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
