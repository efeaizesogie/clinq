"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  Plus,
  X
} from "lucide-react";

interface PatientSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navLinks = [
  { href: "/patient", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/patient/appointments", label: "APPOINTMENTS", icon: Calendar },
  { href: "/patient/records", label: "MEDICAL RECORDS", icon: FileText },
  { href: "/patient/prescriptions", label: "PRESCRIPTIONS", icon: Pill },
  { href: "/patient/billing", label: "BILLING", icon: CreditCard },
  { href: "/patient/messages", label: "MESSAGES", icon: MessageSquare },
];

const bottomLinks = [
  { href: "/patient/settings", label: "SETTINGS", icon: Settings },
  { href: "/login", label: "LOGOUT", icon: LogOut },
];

export default function PatientSidebar({ isOpen, onClose }: PatientSidebarProps) {
  const pathname = usePathname();

  const renderContent = () => (
    <div className="flex flex-col h-full bg-[#EFF4FF]">
      {/* HorizontalBorder Header */}
      <div className="flex items-center justify-between px-6 py-4 h-[65px] border-b border-[#C2C7D1] shrink-0">
        <span className="text-[24px] font-[700] leading-8 tracking-[-0.6px] text-[#00355F] font-sans">
          Clinq
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center p-1 rounded-lg text-[#42474F] hover:bg-[#D9E6F8]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Margin Container */}
      <div className="flex flex-col flex-grow justify-between py-2 overflow-y-auto">
        {/* Main Nav Links & Action Button */}
        <div className="flex flex-col px-4 gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname === href + "/book";
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-4 py-3 rounded-[8px] h-[42px] transition-colors cursor-pointer select-none ${
                  isActive
                    ? "bg-[#0F4C81] text-[#D9E6F8]"
                    : "text-[#42474F] hover:bg-[#D9E6F8]/30"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? "text-[#D9E6F8]" : "text-[#42474F]"
                  }`}
                />
                <span className="text-[12px] font-[600] tracking-[0.6px] font-sans">
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Book Appointment Action Button Container */}
          <div className="pt-4 px-2">
            <Link
              href="/patient/appointments/book"
              className="flex items-center justify-center gap-2 w-full h-[48px] bg-[#00355F] hover:bg-[#002645] text-white rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,53,95,0.2),_0px_4px_6px_-4px_rgba(0,53,95,0.2)] transition-colors font-sans select-none justify-center items-center"
            >
              <Plus className="w-[14px] h-[14px] stroke-[2.5]" />
              <span className="text-[16px] font-[700] leading-6 tracking-[0.2px]">
                Book Appointment
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Section (Settings & Logout) */}
        <div className="mt-8 border-t border-[#C2C7D1] pt-4 px-4 flex flex-col gap-1 pb-4">
          {bottomLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-4 py-3 rounded-[8px] h-[42px] transition-colors cursor-pointer select-none ${
                  isActive
                    ? "bg-[#0F4C81] text-[#D9E6F8]"
                    : "text-[#42474F] hover:bg-[#D9E6F8]/30"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? "text-[#D9E6F8]" : "text-[#42474F]"
                  }`}
                />
                <span className="text-[12px] font-[600] tracking-[0.6px] font-sans">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="fixed left-0 top-0 bottom-0 z-30 hidden md:flex flex-col w-[256px] border-r border-[#C2C7D1] bg-[#EFF4FF]">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Sidebar Layout */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Drawer Backdrop overlay */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          {/* Drawer content sliding from left */}
          <div className="relative flex flex-col w-[256px] h-full shadow-2xl border-r border-[#C2C7D1] animate-slide-in">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
