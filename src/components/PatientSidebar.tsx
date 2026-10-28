import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, FileText, Settings, LogOut, Plus, X, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PatientSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavLink =
  { href: string; label: string; icon?: React.ElementType; svgIcon?: string | null };

const PrescriptionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M5.5 14.5H8.5V12H11V9H8.5V6.5H5.5V9H3V12H5.5V14.5ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V5C0 4.45 0.195833 3.97917 0.5875 3.5875C0.979167 3.19583 1.45 3 2 3H12C12.55 3 13.0208 3.19583 13.4125 3.5875C13.8042 3.97917 14 4.45 14 5V16C14 16.55 13.8042 17.0208 13.4125 17.4125C13.0208 17.8042 12.55 18 12 18H2ZM2 16H12V5H2V16ZM1 2V0H13V2H1ZM2 5V16V5Z" fill="currentColor" />
  </svg>
);

const LabResultIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M0 19V17H5V15C3.61667 15 2.4375 14.5125 1.4625 13.5375C0.4875 12.5625 0 11.3833 0 10C0 8.98333 0.279167 8.05833 0.8375 7.225C1.39583 6.39167 2.15 5.78333 3.1 5.4C3.23333 4.83333 3.52917 4.375 3.9875 4.025C4.44583 3.675 4.96667 3.5 5.55 3.5L5 1.95L5.95 1.6L5.6 0.7L7.5 0L7.8 0.95L8.75 0.6L11.5 8.1L10.55 8.45L10.9 9.4L9 10.1L8.7 9.15L7.75 9.5L7.15 7.85C6.9 8.08333 6.6125 8.25833 6.2875 8.375C5.9625 8.49167 5.63333 8.53333 5.3 8.5C4.93333 8.46667 4.59167 8.35417 4.275 8.1625C3.95833 7.97083 3.68333 7.73333 3.45 7.45C3 7.71667 2.64583 8.075 2.3875 8.525C2.12917 8.975 2 9.46667 2 10C2 10.8333 2.29167 11.5417 2.875 12.125C3.45833 12.7083 4.16667 13 5 13H13V15H8V17H14V19H0ZM8.65 7.55L9.55 7.2L7.85 2.5L6.9 2.85L8.65 7.55ZM5.5 7C5.78333 7 6.02083 6.90417 6.2125 6.7125C6.40417 6.52083 6.5 6.28333 6.5 6C6.5 5.71667 6.40417 5.47917 6.2125 5.2875C6.02083 5.09583 5.78333 5 5.5 5C5.21667 5 4.97917 5.09583 4.7875 5.2875C4.59583 5.47917 4.5 5.71667 4.5 6C4.5 6.28333 4.59583 6.52083 4.7875 6.7125C4.97917 6.90417 5.21667 7 5.5 7Z" fill="currentColor" />
  </svg>
);

const MessagesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2ZM10 9L2 4V14H18V4L10 9ZM10 7L18 2H2L10 7ZM2 4V2V4V14V4Z" fill="currentColor" />
  </svg>
);

const BillingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M13 9C12.1667 9 11.4583 8.70833 10.875 8.125C10.2917 7.54167 10 6.83333 10 6C10 5.16667 10.2917 4.45833 10.875 3.875C11.4583 3.29167 12.1667 3 13 3C13.8333 3 14.5417 3.29167 15.125 3.875C15.7083 4.45833 16 5.16667 16 6C16 6.83333 15.7083 7.54167 15.125 8.125C14.5417 8.70833 13.8333 9 13 9ZM6 12C5.45 12 4.97917 11.8042 4.5875 11.4125C4.19583 11.0208 4 10.55 4 10V2C4 1.45 4.19583 0.979167 4.5875 0.5875C4.97917 0.195833 5.45 0 6 0H20C20.55 0 21.0208 0.195833 21.4125 0.5875C21.8042 0.979167 22 1.45 22 2V10C22 10.55 21.8042 11.4125 21.4125 11.4125C21.0208 11.8042 20.55 12 20 12H6ZM8 10H18C18 9.45 18.1958 8.97917 18.5875 8.5875C18.9792 8.19583 19.45 8 20 8V4C19.45 4 18.9792 3.80417 18.5875 3.4125C18.1958 3.02083 18 2.55 18 2H8C8 2.55 7.80417 3.02083 7.4125 3.4125C7.02083 3.80417 6.55 4 6 4V8C6.55 8 7.02083 8.19583 7.4125 8.5875C7.80417 8.97917 8 9.45 8 10ZM19 16H2C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V3H2V14H19V16ZM6 10V2V10Z" fill="currentColor" />
  </svg>
);

const customSvgIcons: Record<string, React.ElementType> = {
  "/prescription.svg": PrescriptionIcon,
  "/lab-result.svg": LabResultIcon,
  "/messages.svg": MessagesIcon,
  "/billing.svg": BillingIcon,
};

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

/** Menu labels are stored upper-case; show them in sentence case ("MEDICAL RECORDS" → "Medical records"). */
function toSentenceCase(label: string) {
  const lower = label.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

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

  const itemClass = (isActive: boolean) =>
    `group relative flex items-center gap-3 h-10 px-3 rounded-[8px] text-[14px] tracking-[-0.01em] transition-colors select-none ${
      isActive
        ? "bg-canvas text-navy font-[600]"
        : "text-steel font-[500] hover:text-navy hover:bg-canvas/70"
    }`;

  const iconClass = (isActive: boolean) =>
    `w-[17px] h-[17px] shrink-0 transition-colors ${isActive ? "text-teal-ink" : "text-fog group-hover:text-steel"}`;

  const renderContent = () => (
    <div className="flex flex-col h-full bg-surface transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
        <Link href="/" className="text-[21px] font-[800] tracking-[-0.04em] text-brand-blue dark:text-white">
          Clinq
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-[8px] text-steel hover:text-navy hover:bg-canvas"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex flex-col flex-grow justify-between overflow-y-auto">
        <nav aria-label="Patient portal" className="flex flex-col px-3 pt-5">
          <p className="px-3 pb-2 text-[12px] font-[500] text-fog">Menu</p>
          <div className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname === link.href + "/book";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={itemClass(isActive)}
                >
                  {(() => {
                    if (link.svgIcon && customSvgIcons[link.svgIcon]) {
                      const IconComp = customSvgIcons[link.svgIcon];
                      return <IconComp className={iconClass(isActive)} />;
                    }
                    if (link.svgIcon) {
                      return (
                        <Image
                          src={link.svgIcon}
                          alt=""
                          width={17}
                          height={17}
                          className={`shrink-0 ${isActive ? "" : "opacity-60"} dark:invert`}
                        />
                      );
                    }
                    if (link.icon) {
                      return <link.icon className={iconClass(isActive)} />;
                    }
                    return null;
                  })()}
                  <span>{toSentenceCase(link.label)}</span>
                </Link>
              );
            })}
          </div>

          {/* Book Appointment Button */}
          <div className="pt-5 px-1">
            <Link
              href="/patient/appointments/book"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-[8px] bg-action text-action-fg text-[14px] font-[600] shadow-[var(--shadow-btn)] transition-colors hover:bg-action-hover select-none"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
              Book appointment
            </Link>
          </div>
        </nav>

        {/* Bottom Links */}
        <div className="px-3 pb-4 pt-6">
          <p className="px-3 pb-2 text-[12px] font-[500] text-fog">Account</p>
          <div className="flex flex-col gap-0.5">
            {bottomLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={(e) => handleBottomLinkClick(e, href, label)}
                  aria-current={isActive ? "page" : undefined}
                  className={itemClass(isActive)}
                >
                  <Icon className={iconClass(isActive)} />
                  <span>{toSentenceCase(label)}</span>
                </Link>
              );
            })}
          </div>
          <p className="mt-5 mx-3 pt-4 border-t border-line flex items-center gap-2 text-[12px] text-steel">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-ink" />
            HIPAA compliant, 256-bit encrypted
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-30 hidden md:flex flex-col w-[256px] border-r border-line bg-surface transition-colors duration-300">
        {renderContent()}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div onClick={onClose} className="absolute inset-0 bg-[#0D1C2E]/40 backdrop-blur-sm" />
          <div className="relative flex flex-col w-[272px] h-full shadow-[var(--shadow-float)] border-r border-line">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
