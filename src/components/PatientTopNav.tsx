"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Search, Bell, Sun, Moon, Menu, Calendar, 
  FlaskConical, Pill, MessageSquare, CreditCard, 
  AlertCircle, CheckCircle2, ChevronRight, X
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

  const getCategoryIcon = (category: string) => {
    const cls = "w-4 h-4 text-teal-ink";
    switch (category) {
      case "appointment":
        return <Calendar className={cls} />;
      case "lab":
        return <FlaskConical className={cls} />;
      case "prescription":
        return <Pill className={cls} />;
      case "message":
        return <MessageSquare className={cls} />;
      case "billing":
        return <CreditCard className={cls} />;
      default:
        return <AlertCircle className={cls} />;
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

  const iconBtn =
    "relative flex items-center justify-center w-9 h-9 rounded-[8px] text-steel hover:text-navy hover:bg-canvas transition-colors cursor-pointer";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 w-full h-16 bg-surface/85 backdrop-blur-xl border-b border-line px-4 md:px-8 shrink-0 transition-colors duration-300">
      {/* Search Input Area */}
      <div className="flex items-center gap-2 flex-1 max-w-[360px]">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button onClick={onMenuToggle} className={`md:hidden ${iconBtn}`} aria-label="Toggle Menu">
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" />
          <input
            type="text"
            placeholder="Search records"
            aria-label="Search records"
            className="w-full h-9 pl-9 pr-3 rounded-[8px] bg-canvas border border-line text-[14px] text-ink placeholder:text-fog focus:outline-none focus:border-navy/40 focus:ring-4 focus:ring-teal/15 transition"
          />
        </div>

        {/* Small screen Search Button */}
        <button className={`sm:hidden ${iconBtn}`} aria-label="Search">
          <Search className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-1 relative" ref={dropdownRef}>
        {/* Bell Notify Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
          aria-expanded={isOpen}
          className={`${iconBtn} ${isOpen ? "bg-canvas text-navy" : ""}`}
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#BA1A1A] text-white text-[11px] font-[700] rounded-full leading-none ring-2 ring-surface">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* ── Clinq Notification Dropdown Popover ── */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-[340px] sm:w-[400px] bg-surface border border-line rounded-[12px] shadow-[var(--shadow-product)] overflow-hidden z-50 flex flex-col font-sans">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-5 h-12 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-[600] text-ink">Notifications</span>
                {unreadCount > 0 && (
                  <span className="h-5 px-2 rounded-full bg-teal/12 text-teal-ink text-[11px] font-[600] flex items-center">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="h-7 px-2 rounded-[6px] text-[12px] font-[600] text-navy hover:bg-canvas cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                  className="w-7 h-7 rounded-[6px] flex items-center justify-center text-steel hover:text-navy hover:bg-canvas"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-line bg-canvas overflow-x-auto">
              {(["all", "appointments", "clinical", "billing"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`h-7 px-2.5 rounded-[6px] text-[12px] font-[500] capitalize transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === tab
                      ? "bg-action text-action-fg"
                      : "text-steel hover:text-navy hover:bg-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notifications Scroll Area */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-line">
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
                      className={`px-5 py-4 flex gap-3.5 items-start hover:bg-canvas transition-colors cursor-pointer relative ${
                        !isRead ? "bg-canvas/60" : ""
                      }`}
                    >
                      {/* Left icon */}
                      <div className="w-8 h-8 rounded-[8px] bg-canvas border border-line flex items-center justify-center shrink-0 mt-0.5">
                        {getCategoryIcon(notif.category)}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-grow min-w-0 pr-2">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h5 className={`text-[13px] truncate text-ink ${!isRead ? "font-[700]" : "font-[500]"}`}>
                            {notif.title}
                          </h5>
                          <span className="font-mono text-[11px] text-fog shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-[12px] leading-[1.45] text-steel line-clamp-2">{notif.description}</p>
                        {notif.actionLabel && (
                          <span className="inline-flex items-center gap-0.5 text-[12px] font-[600] text-navy mt-1.5">
                            <span>{notif.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 mt-2" />}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-steel text-[13px] flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-ink" />
                  <span>No notifications in this category.</span>
                </div>
              )}
            </div>

            {/* Popover Footer */}
            <div className="px-5 h-11 border-t border-line bg-canvas flex items-center justify-between text-[12px]">
              <Link
                href="/patient/notifications"
                onClick={() => setIsOpen(false)}
                className="font-[600] text-navy inline-flex items-center gap-1"
              >
                View all notifications <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/patient/settings#notifications"
                onClick={() => setIsOpen(false)}
                className="text-steel hover:text-navy"
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
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={iconBtn}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <span aria-hidden="true" className="mx-2 h-6 w-px bg-line" />

        {/* User Profile */}
        <Link
          href="/patient/settings"
          aria-label="Account settings"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#5F9EA0] ring-2 ring-surface shadow-[var(--shadow-hair)] overflow-hidden cursor-pointer select-none"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[12px] font-[700] text-white">{initials || "..."}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
