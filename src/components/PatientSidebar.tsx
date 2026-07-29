import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, FileText, Settings, LogOut, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PatientSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavLink =
  { href: string; label: string; icon?: React.ElementType; svgIcon?: string | null };

const defaultNavLinks: NavLink[] = [
  { href: "/patient", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/patient/appointments", label: "APPOINTMENTS", icon: Calendar },
  { href: "/patient/records", label: "MEDICAL RECORDS", icon: FileText },
  { href: "/patient/prescriptions", label: "PRESCRIPTIONS", svgIcon: "/prescription.svg" },
  { href: "/patient/lab-results", label: "LAB RESULTS", svgIcon: "/lab-result.svg" },
  { href: "/patient/messages", label: "MESSAGES", svgIcon: "/messages.svg" },
  { href: "/patient/billing", label: "BILLING", svgIcon: "/billing.svg" },
];

const bottomLinks = [
  { href: "/patient/settings", label: "SETTINGS", icon: Settings },
  { href: "/login", label: "LOGOUT", icon: LogOut },
];

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  LogOut,
};

export default function PatientSidebar({ isOpen, onClose }: PatientSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [navLinks, setNavLinks] = useState<NavLink[]>(defaultNavLinks);

  useEffect(() => {
    async function fetchMenus() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("patient_menus")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          const mapped: NavLink[] = data.map((item: any) => ({
            href: item.href,
            label: item.label,
            icon: item.icon ? iconMap[item.icon] : undefined,
            svgIcon: item.svg_icon
          }));
          setNavLinks(mapped);
        }
      } catch (err) {
        console.error("Error loading patient menus from database:", err);
      }
    }
    fetchMenus();
  }, []);

  const handleBottomLinkClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    label: string
  ) => {
    if (label === "LOGOUT") {
      e.preventDefault();
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
      } catch (err) {
        console.error("Logout error:", err);
        router.push("/login");
      }
    }
  };

  const renderContent = () => (
    <div className="flex flex-col h-full bg-[#EFF4FF]">
      {/* Header */}
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

      {/* Nav */}
      <div className="flex flex-col flex-grow justify-between py-2 overflow-y-auto">
        <div className="flex flex-col px-4 gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname === link.href + "/book";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-[8px] h-[42px] transition-colors cursor-pointer select-none ${
                  isActive
                    ? "bg-[#0F4C81] text-[#D9E6F8]"
                    : "text-[#42474F] hover:bg-[#D9E6F8]/30"
                }`}
              >
                {link.svgIcon ? (
                  <Image
                    src={link.svgIcon}
                    alt={link.label}
                    width={18}
                    height={18}
                    className={`shrink-0 ${isActive ? "brightness-[10]" : ""}`}
                  />
                ) : link.icon ? (
                  <link.icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? "text-[#D9E6F8]" : "text-[#42474F]"
                    }`}
                  />
                ) : null}
                <span className="text-[12px] font-[600] tracking-[0.6px] font-sans">
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* Book Appointment Button */}
          <div className="pt-4 px-2">
            <Link
              href="/patient/appointments/book"
              className="flex items-center justify-center gap-2 w-full h-[48px] bg-[#00355F] hover:bg-[#002645] text-white rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,53,95,0.2),_0px_4px_6px_-4px_rgba(0,53,95,0.2)] transition-colors font-sans select-none"
            >
              <Plus className="w-[14px] h-[14px] stroke-[2.5]" />
              <span className="text-[16px] font-[700] leading-6 tracking-[0.2px]">
                Book Appointment
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 border-t border-[#C2C7D1] pt-4 px-4 flex flex-col gap-1 pb-4">
          {bottomLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleBottomLinkClick(e, href, label)}
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
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-30 hidden md:flex flex-col w-[256px] border-r border-[#C2C7D1] bg-[#EFF4FF]">
        {renderContent()}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative flex flex-col w-[256px] h-full shadow-2xl border-r border-[#C2C7D1] animate-slide-in">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
