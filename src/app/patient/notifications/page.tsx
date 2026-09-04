"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  FlaskConical,
  Pill,
  MessageSquare,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  Settings as SettingsIcon,
  Trash2,
  CheckCheck,
  ChevronRight,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface NotificationItem {
  id: string;
  category: 'appointment' | 'lab' | 'prescription' | 'message' | 'billing' | 'system';
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
  severity: 'info' | 'warning' | 'success' | 'urgent';
  actionUrl: string;
  actionLabel?: string;
}

export default function NotificationsCenterPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load persistent read IDs
  useEffect(() => {
    try {
      const stored = localStorage.getItem("clinq_read_notifications");
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patient/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const clearReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !readIds.has(n.id)));
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const filteredNotifications = notifications.filter((notif) => {
    const matchesCategory = activeCategory === "all" || notif.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-[#00355F] dark:text-[#5F9EA0]" />;
      case 'lab':
        return <FlaskConical className="w-5 h-5 text-[#0F4C81] dark:text-[#8EBDF9]" />;
      case 'prescription':
        return <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-[#1B6CA8] dark:text-[#8EBDF9]" />;
      case 'billing':
        return <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#00355F] dark:text-[#5F9EA0]" />;
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

  const categories = [
    { id: "all", label: "All Alerts", count: notifications.length },
    { id: "appointment", label: "Appointments", count: notifications.filter(n => n.category === 'appointment').length },
    { id: "lab", label: "Labs & Tests", count: notifications.filter(n => n.category === 'lab').length },
    { id: "prescription", label: "Prescriptions", count: notifications.filter(n => n.category === 'prescription').length },
    { id: "message", label: "Messages", count: notifications.filter(n => n.category === 'message').length },
    { id: "billing", label: "Billing", count: notifications.filter(n => n.category === 'billing').length },
  ];

  return (
    <div className="w-full px-4 py-4 md:p-6 lg:p-8 flex flex-col gap-8 bg-[#F8F9FF] dark:bg-[#080F18] font-sans antialiased text-[#42474F] dark:text-[#A5AAB5] min-h-screen transition-colors duration-300">
      {/* ── Header Row ── */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
        <div className="flex flex-col gap-2 max-w-[672px]">
          <div className="flex items-center gap-3">
            <h2 className="text-[24px] font-[600] leading-10 tracking-[-0.8px] text-[#00355F] dark:text-white font-sans transition-colors">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-[#BA1A1A] text-white text-[12px] font-[700] rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-[16px] font-[400] leading-6 text-[#42474F] dark:text-[#A5AAB5] transition-colors">
            Real-time clinical updates, scheduling reminders, diagnostic alerts, and billing activity synced with your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 px-4 h-[42px] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg text-[13px] font-[600] text-[#00355F] dark:text-[#5F9EA0] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 h-[42px] bg-[#00355F] dark:bg-[#1B6CA8] hover:bg-[#002645] dark:hover:bg-[#2582C7] disabled:opacity-50 text-white rounded-lg text-[13px] font-[600] transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </section>

      {/* ── Toolbar & Categories ── */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-[600] whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00355F] dark:bg-[#1B6CA8] text-white shadow-sm'
                    : 'bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] text-[#42474F] dark:text-[#A5AAB5] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A]'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-[700] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#EFF4FF] dark:bg-[#1E2D4A] text-[#00355F] dark:text-[#5F9EA0]'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#42474F] dark:text-[#A5AAB5]" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg text-[14px] text-[#0D1C2E] dark:text-white placeholder-[#727780] dark:placeholder-[#A5AAB5]/60 focus:outline-none focus:border-[#00355F] dark:focus:border-[#1B6CA8] transition-colors"
          />
        </div>
      </section>

      {/* ── Notifications List ── */}
      <section className="flex flex-col gap-4 w-full">
        {loading ? (
          <div className="p-16 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-xl flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-10 h-10 border-4 border-[#00355F] dark:border-[#1B6CA8] border-t-transparent rounded-full animate-spin" />
            <span className="text-[14px] font-[600] text-[#00355F] dark:text-[#5F9EA0]">
              Loading dynamic notification feeds...
            </span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-xl flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EFF4FF] dark:bg-[#1E2D4A] flex items-center justify-center text-[#00355F] dark:text-[#5F9EA0]">
              <CheckCircle2 className="w-7 h-7 stroke-[2]" />
            </div>
            <h4 className="text-[18px] font-[700] text-[#0D1C2E] dark:text-white font-sans">
              All Caught Up!
            </h4>
            <p className="text-[14px] text-[#42474F] dark:text-[#A5AAB5] max-w-sm">
              You have no active alerts matching this filter. New notifications will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {filteredNotifications.map((item) => {
              const isRead = readIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
                    !isRead
                      ? 'bg-white dark:bg-[#121E2C] border-[#00355F]/30 dark:border-[#1B6CA8]/40 shadow-[0px_4px_20px_rgba(15,76,129,0.04)]'
                      : 'bg-white/70 dark:bg-[#121E2C]/60 border-[#C2C7D1]/60 dark:border-[#22354A] opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Left detail area */}
                  <div className="flex items-start gap-4 flex-grow min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-[#DCE9FF] dark:bg-[#1E2D4A] flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-[16px] font-sans text-[#0D1C2E] dark:text-white ${!isRead ? 'font-[700]' : 'font-[500]'}`}>
                          {item.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-[700] uppercase tracking-wide ${getSeverityBadge(item.severity)}`}>
                          {item.category}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#00355F] dark:bg-[#1B6CA8]" />
                        )}
                      </div>
                      <p className="text-[14px] leading-relaxed text-[#42474F] dark:text-[#A5AAB5]">
                        {item.description}
                      </p>
                      <span className="text-[12px] text-[#727780] dark:text-[#A5AAB5]/60 mt-0.5">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {item.actionLabel && item.actionUrl && (
                      <Link
                        href={item.actionUrl}
                        className="px-4 py-2 bg-[#00355F] dark:bg-[#1B6CA8] hover:bg-[#002645] dark:hover:bg-[#2582C7] text-white rounded-lg text-[13px] font-[600] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>{item.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {!isRead ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        title="Mark as read"
                        className="p-2 text-[#42474F] dark:text-[#A5AAB5] hover:text-[#00355F] dark:hover:text-white rounded-lg hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Quick Footer Navigation Bar ── */}
      <section className="p-6 bg-[#EFF4FF] dark:bg-[#1E2D4A] border border-[#C2C7D1]/50 dark:border-[#22354A] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-[#00355F] dark:text-[#5F9EA0]" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[700] text-[#00355F] dark:text-white">
              Notification Preferences
            </span>
            <span className="text-[12px] text-[#42474F] dark:text-[#A5AAB5]">
              Configure which email, SMS, and push notification alerts you receive.
            </span>
          </div>
        </div>
        <Link
          href="/patient/settings#notifications"
          className="px-5 py-2.5 bg-white dark:bg-[#0D1C2E] text-[#00355F] dark:text-white border border-[#C2C7D1] dark:border-[#22354A] rounded-lg text-[13px] font-[600] uppercase tracking-wide hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A] transition-colors whitespace-nowrap"
        >
          Manage Preferences
        </Link>
      </section>
    </div>
  );
}
