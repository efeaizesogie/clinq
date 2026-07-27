"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  Package,
  BarChart2,
  LogOut,
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/patients", label: "Patient Management", icon: Users },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/staff", label: "Staff Directory", icon: UserCog },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FF] font-sans antialiased">
      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-[256px] bg-[#F8F9FF] border-r border-[#C2C7D1] flex flex-col z-10">
        <div className="flex flex-col h-full px-4 py-6 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 pb-8">
            <div className="flex flex-col">
              <span className="text-[24px] font-[700] leading-8 tracking-[-0.6px] text-[#00355F]">
                Clinq
              </span>
              <span className="text-[10px] font-[400] leading-[15px] tracking-[0.5px] uppercase text-[#42474F]">
                Admin Terminal
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-[4px] h-10 transition-colors ${
                    isActive
                      ? "bg-[#D4E6E5] text-[#00355F] font-[700]"
                      : "text-[#42474F] font-[400] hover:bg-[#EFF4FF]"
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? "text-[#00355F]" : "text-[#42474F]"
                    }`}
                  />
                  <span className="text-[16px] leading-6">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-[#C2C7D1] pt-6">
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-[4px] h-10 text-[#42474F] hover:bg-[#EFF4FF] transition-colors"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0 text-[#42474F]" />
              <span className="text-[16px] leading-6 font-[400]">Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="ml-[256px] flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
