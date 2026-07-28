"use client";

import React, { useState } from "react";
import { User, Shield, Bell, CreditCard, Globe, Sun, Moon, Lock, Trash2 } from "lucide-react";

const settingsNav = [
  { id: "profile", label: "PROFILE SETTINGS", icon: User },
  { id: "security", label: "SECURITY", icon: Shield },
  { id: "notifications", label: "NOTIFICATIONS", icon: Bell },
  { id: "preferences", label: "PREFERENCES", icon: Globe },
];

type NotifRow = {
  label: string;
  desc: string;
  email: boolean;
  sms: boolean;
  push: boolean;
};

const notifRows: NotifRow[] = [
  { label: "Appointments", desc: "Reminders and scheduling updates", email: true, sms: true, push: true },
  { label: "Lab Results", desc: "Alerts when new reports are available", email: true, sms: false, push: true },
  { label: "Billing", desc: "Invoices and payment receipts", email: true, sms: false, push: false },
];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className={`w-[22px] h-[22px] rounded-[2px] flex items-center justify-center shrink-0 ${checked ? "bg-[#00355F]" : "bg-white border border-[#C2C7D1]"}`}>
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [twoFA, setTwoFA] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="w-full flex gap-6 px-6 py-6 bg-[#F8F9FF] font-[Manrope,sans-serif] text-[#42474F] min-h-screen">

      {/* ── Left Settings Nav ── */}
      <div className="flex flex-col gap-2 w-[220px] shrink-0">
        {settingsNav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-3 px-4 py-4 rounded-[8px] border text-left transition-colors ${
              activeSection === id
                ? "bg-white border-[#00355F] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] text-[#00355F]"
                : "bg-white border-[#C2C7D1] text-[#42474F] hover:border-[#00355F]/40"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${activeSection === id ? "text-[#00355F]" : "text-[#42474F]"}`} />
            <span className="text-[12px] font-[600] tracking-[0.6px]">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Settings Content ── */}
      <div className="flex flex-col gap-12 flex-1 min-w-0">

        {/* ── Profile Settings ── */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-[700] leading-8 text-[#00355F]">Profile Settings</h2>
            <button className="px-6 py-2 bg-[#00355F] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white hover:bg-[#002645] transition-colors">
              Save Changes
            </button>
          </div>

          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-8">
            <div className="flex items-start gap-12">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="w-32 h-32 rounded-[12px] border-4 border-[#DCE9FF] bg-[#DCE9FF] flex items-center justify-center overflow-hidden">
                  <span className="text-[32px] font-[700] text-[#00355F]">AS</span>
                </div>
                <button className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:underline">
                  Change Photo
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                {[
                  { label: "FULL NAME", value: "Alexander Sterling" },
                  { label: "EMAIL ADDRESS", value: "a.sterling@medcore.com" },
                  { label: "PHONE NUMBER", value: "+1 (555) 890-2431" },
                  { label: "DATE OF BIRTH", value: "11/12/1985" },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-2">
                    <label className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">
                      {field.label}
                    </label>
                    <input
                      defaultValue={field.value}
                      className="px-3 py-3 bg-white border border-[#C2C7D1] rounded-[4px] text-[16px] font-[400] text-[#0D1C2E] outline-none focus:border-[#00355F] transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Security ── */}
        <section className="flex flex-col gap-6">
          <h3 className="text-[18px] font-[700] leading-8 text-[#00355F]">Security</h3>
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)]">
            {/* Password Row */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-[#C2C7D1]">
              <div className="flex flex-col gap-1">
                <span className="text-[18px] font-[700] leading-7 text-[#0D1C2E]">Password</span>
                <span className="text-[14px] font-[400] leading-5 text-[#42474F]">Last changed 3 months ago</span>
              </div>
              <button className="px-6 py-2 border border-[#00355F] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:bg-[#EFF4FF] transition-colors whitespace-nowrap">
                Change Password
              </button>
            </div>

            {/* 2FA Row */}
            <div className="flex items-center justify-between px-8 py-8">
              <div className="flex flex-col gap-1">
                <span className="text-[18px] font-[700] leading-7 text-[#0D1C2E]">Two-Factor Authentication</span>
                <span className="text-[14px] font-[400] leading-5 text-[#42474F]">Add an extra layer of security to your account</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F]">
                  {twoFA ? "Enabled" : "Disabled"}
                </span>
                <button
                  onClick={() => setTwoFA(!twoFA)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${twoFA ? "bg-[#00355F]" : "bg-[#D5E3FC]"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white border border-[#D1D5DB] rounded-full shadow transition-transform ${twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-[12px] font-[700] tracking-[0.6px] text-[#00355F]">
                  {twoFA ? "Enabled" : "Enable"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Notification Preferences ── */}
        <section className="flex flex-col gap-6">
          <h3 className="text-[18px] font-[700] leading-8 text-[#00355F]">Notification Preferences</h3>
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#EFF4FF] grid grid-cols-[1fr_auto_auto_auto]">
              <div className="px-4 py-4 text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">Notification</div>
              <div className="px-4 py-4 text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] text-center w-[108px]">Email</div>
              <div className="px-4 py-4 text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] text-center w-[92px]">SMS</div>
              <div className="px-4 py-4 text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F] text-center w-[103px]">Push</div>
            </div>

            {/* Table Body */}
            {notifRows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_auto_auto_auto] items-center ${idx > 0 ? "border-t border-[#C2C7D1]" : ""}`}
              >
                <div className="px-4 py-4 flex flex-col gap-1">
                  <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">{row.label}</span>
                  <span className="text-[14px] font-[400] leading-5 text-[#42474F]">{row.desc}</span>
                </div>
                <div className="flex justify-center items-center w-[108px] py-4"><Checkbox checked={row.email} /></div>
                <div className="flex justify-center items-center w-[92px] py-4"><Checkbox checked={row.sms} /></div>
                <div className="flex justify-center items-center w-[103px] py-4"><Checkbox checked={row.push} /></div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Account Preferences ── */}
        <section className="flex flex-col gap-6">
          <h3 className="text-[18px] font-[700] leading-8 text-[#00355F]">Account Preferences</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Language Card */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#00355F]" />
                <span className="text-[18px] font-[700] leading-7 text-[#00355F]">Language</span>
              </div>
              <div className="relative">
                <select className="w-full px-3 py-3 bg-white border border-[#C2C7D1] rounded-[4px] text-[16px] font-[400] text-[#0D1C2E] appearance-none outline-none focus:border-[#00355F] transition-colors">
                  <option>English (United States)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-[14px] font-[400] leading-5 text-[#42474F]">
                This will change the interface language across the portal.
              </p>
            </div>

            {/* Theme Card */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Sun className="w-[18px] h-[18px] text-[#00355F]" />
                <span className="text-[18px] font-[700] leading-7 text-[#00355F]">Display Theme</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#EFF4FF] rounded-[4px]">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[2px] text-[12px] tracking-[0.6px] transition-all ${
                    theme === "light"
                      ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-[700] text-[#00355F]"
                      : "font-[600] text-[#42474F]"
                  }`}
                >
                  <Sun className="w-[22px] h-[22px]" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[2px] text-[12px] tracking-[0.6px] transition-all ${
                    theme === "dark"
                      ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-[700] text-[#00355F]"
                      : "font-[600] text-[#42474F]"
                  }`}
                >
                  <Moon className="w-[18px] h-[18px]" />
                  Dark
                </button>
              </div>
              <p className="text-[14px] font-[400] leading-5 text-[#42474F]">
                Switch between light and dark clinical interface styles.
              </p>
            </div>
          </div>

          {/* Privacy Card */}
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-[19px] h-[22px] text-[#00355F]" />
                <span className="text-[18px] font-[700] leading-7 text-[#00355F]">Data Privacy Options</span>
              </div>
              <button className="text-[12px] font-[700] tracking-[0.6px] text-[#BA1A1A] hover:underline">
                Download My Data
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: "Allow anonymized data for research", desc: "Help improve clinical outcomes by sharing de-identified health data", checked: true },
                { label: "Share data with connected providers", desc: "Allow your care team to access records across affiliated clinics", checked: false },
              ].map((item) => (
                <label key={item.label} className="flex items-start gap-4 p-4 border border-[#C2C7D1] rounded-[4px] cursor-pointer">
                  <div className="pt-0.5 shrink-0">
                    <Checkbox checked={item.checked} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">{item.label}</span>
                    <span className="text-[14px] font-[400] leading-5 text-[#42474F]">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ── Destructive Actions ── */}
        <section className="border-t border-[#C2C7D1] pt-12">
          <div className="flex items-center justify-between bg-[rgba(255,218,214,0.2)] border border-[rgba(186,26,26,0.2)] rounded-[8px] px-8 py-8">
            <div className="flex flex-col gap-2">
              <span className="text-[18px] font-[700] leading-7 text-[#BA1A1A]">Delete Account</span>
              <p className="text-[14px] font-[400] leading-5 text-[#42474F] max-w-[511px]">
                Permanently delete your Clinq account and all associated health records. This action cannot be undone.
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-[#BA1A1A] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white hover:bg-[#9b1515] transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
