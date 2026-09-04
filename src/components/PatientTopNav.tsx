"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Search, Bell, Sun, Moon, Menu, Calendar, 
  FlaskConical, Pill, MessageSquare, CreditCard, 
  AlertCircle, CheckCircle2, ChevronRight, X, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PatientTopNavProps {
  onMenuToggle?: () => void;
}

export interface NotificationItem {
  id: string;
  category: 'appointment' | 'lab' | 'prescription' | 'message' | 'billing' | 'system';
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
  severity: 'info' | 'warning' | 'success' | 'urgent';
  actionUrl: string;
  actionLabel?: string;
  isRead?: boolean;
}

export default function PatientTopNav({ onMenuToggle }: PatientTopNavProps) {
  const router = useRouter();
  const [initials, setInitials] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(false);

  // Notification states
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'appointments' | 'clinical' | 'billing'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("clinq_read_notifications");
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  // Fetch notifications from database-backed API
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/patient/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.auth.updateUser({
            data: { theme: nextTheme }
          }).catch(err => {
            console.error("Error updating user metadata theme preference:", err);
          });
        }
      });
    } catch (err) {
      console.error("Error toggling patient theme:", err);
    }
  };

  const markAsRead = (id: string) => {
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    try {
      localStorage.setItem("clinq_read_notifications", JSON.stringify(Array.from(updated)));
    } catch {}
  };

  const markAllAsRead = () => {
    const updated = new Set(readIds);
    notifications.forEach(n => updated.add(n.id));
    setReadIds(updated);
    try {
      localStorage.setItem("clinq_read_notifications", JSON.stringify(Array.from(updated)));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'appointments') return n.category === 'appointment';
    if (activeFilter === 'clinical') return n.category === 'lab' || n.category === 'prescription' || n.category === 'message';
    if (activeFilter === 'billing') return n.category === 'billing';
    return true;
  });

  const getCategoryIcon = (category: string, severity: string) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[#00355F] dark:text-[#5F9EA0]" />;
      case 'lab':
        return <FlaskConical className="w-4 h-4 text-[#0F4C81] dark:text-[#8EBDF9]" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-[#1B6CA8] dark:text-[#8EBDF9]" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#00355F] dark:text-[#5F9EA0]" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50';
      case 'success':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50';
      default:
        return 'bg-[#EFF4FF] text-[#00355F] dark:bg-[#1E2D4A] dark:text-[#8EBDF9] border border-[#C2C7D1]/30 dark:border-[#22354A]';
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

        {/* Small screen Search Button */}
        <button className="sm:hidden p-2 rounded-lg text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40]">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-6 relative" ref={dropdownRef}>
        {/* Bell Notify Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
          className={`relative flex items-center justify-center w-8 h-8 rounded-lg text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2E40] transition-colors cursor-pointer ${isOpen ? 'bg-[#EFF4FF] dark:bg-[#1E2E40]' : ''}`}
        >
          <Bell className="w-4 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-[2px] right-[4px] flex items-center justify-center min-w-[14px] h-[14px] px-1 bg-[#BA1A1A] text-white text-[9px] font-[700] rounded-full leading-none shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* ── Clinq Notification Dropdown Popover ── */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-[340px] sm:w-[400px] bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-xl shadow-[0px_10px_35px_rgba(15,76,129,0.12)] dark:shadow-none overflow-hidden z-50 flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#C2C7D1]/60 dark:border-[#22354A] bg-[#EFF4FF] dark:bg-[#1E2D4A]">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-[700] text-[#00355F] dark:text-white uppercase tracking-[0.6px]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#00355F] dark:bg-[#1B6CA8] text-white rounded-full text-[11px] font-[700]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-[600] text-[#00355F] dark:text-[#5F9EA0] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-[#42474F] dark:text-[#A5AAB5] hover:text-[#0D1C2E] dark:hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-[#C2C7D1]/40 dark:border-[#22354A] bg-[#F8F9FF] dark:bg-[#0D1C2E]/60 overflow-x-auto text-[11px] font-[600] uppercase tracking-wide">
              {(['all', 'appointments', 'clinical', 'billing'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === tab
                      ? 'bg-[#00355F] dark:bg-[#1B6CA8] text-white'
                      : 'text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notifications Scroll Area */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#C2C7D1]/30 dark:divide-[#22354A]">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => {
                  const isRead = readIds.has(notif.id);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.actionUrl) {
                          setIsOpen(false);
                          router.push(notif.actionUrl);
                        }
                      }}
                      className={`p-4 flex gap-3.5 items-start hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A]/50 transition-colors cursor-pointer relative ${
                        !isRead ? 'bg-[#EFF4FF]/40 dark:bg-[#1E2D4A]/20' : ''
                      }`}
                    >
                      {/* Left icon circle */}
                      <div className="w-8 h-8 rounded-lg bg-[#DCE9FF] dark:bg-[#1C2C3E] flex items-center justify-center shrink-0 mt-0.5">
                        {getCategoryIcon(notif.category, notif.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-grow min-w-0 pr-2">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h5 className={`text-[13px] font-[700] truncate text-[#0D1C2E] dark:text-white ${!isRead ? 'font-extrabold' : 'font-normal'}`}>
                            {notif.title}
                          </h5>
                          <span className="text-[10px] text-[#727780] dark:text-[#A5AAB5]/70 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[12px] leading-[17px] text-[#42474F] dark:text-[#A5AAB5] line-clamp-2">
                          {notif.description}
                        </p>
                        {notif.actionLabel && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-[700] text-[#00355F] dark:text-[#5F9EA0] mt-1.5 hover:underline">
                            <span>{notif.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#00355F] dark:bg-[#1B6CA8] shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-[#727780] dark:text-[#A5AAB5] text-[13px] flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <span>No notifications in this category.</span>
                </div>
              )}
            </div>

            {/* Popover Footer */}
            <div className="p-3 border-t border-[#C2C7D1]/60 dark:border-[#22354A] bg-[#EFF4FF]/60 dark:bg-[#1E2D4A]/60 flex items-center justify-between text-[12px]">
              <Link
                href="/patient/notifications"
                onClick={() => setIsOpen(false)}
                className="font-[700] text-[#00355F] dark:text-[#5F9EA0] hover:underline uppercase tracking-[0.6px]"
              >
                View All Center
              </Link>
              <Link
                href="/patient/settings#notifications"
                onClick={() => setIsOpen(false)}
                className="text-[#42474F] dark:text-[#A5AAB5] hover:underline text-[11px]"
              >
                Settings
              </Link>
            </div>
          </div>
        )}

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
