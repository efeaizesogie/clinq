"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Shield, Bell, Globe, Sun, Moon, Lock, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import DownloadPDFButton, { drawPDFHeader, PDF_COLORS } from "@/components/DownloadPDFButton";

const settingsNav = [
  { id: "profile", label: "PROFILE SETTINGS", icon: User },
  { id: "security", label: "SECURITY", icon: Shield },
  { id: "notifications", label: "NOTIFICATIONS", icon: Bell },
  { id: "preferences", label: "PREFERENCES", icon: Globe },
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

function buildHealthPDF(profile: any, settings: any, notifications: any, preferences: any, privacy: any) {
  return (doc: jsPDF) => {
    const margin = 18;
    const W = 210;
    const contentW = W - margin * 2;
    let y = drawPDFHeader(doc, "Clinq Medical — Confidential Patient Record");

    // Section header: Profile Information
    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text("Profile Information", margin + 8, y + 7);
    y += 18;

    const row = (label: string, value: string) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...PDF_COLORS.dark);
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...PDF_COLORS.text);
      const lines = doc.splitTextToSize(value, contentW - 52);
      doc.text(lines, margin + 52, y);
      y += lines.length * 5 + 3;
    };

    row("Full Name:", profile.fullName);
    row("Email Address:", profile.email);
    row("Phone Number:", profile.phone || "—");
    row("Date of Birth:", profile.dob || "—");
    y += 8;

    // Section header: Security & Preferences
    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text("Security & Preferences", margin + 8, y + 7);
    y += 18;

    row("Two-Factor Auth:", settings.twoFA ? "Enabled" : "Disabled");
    row("Language:", preferences.language);
    row("Display Theme:", preferences.theme);
    y += 8;

    // Section header: Data Privacy
    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text("Data Privacy Settings", margin + 8, y + 7);
    y += 18;

    row("Anonymized Research:", privacy.research ? "Allowed" : "Not Allowed");
    row("Connected Providers:", privacy.providers ? "Shared" : "Not Shared");
    y += 8;

    // Section header: Notifications
    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(...PDF_COLORS.navy);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...PDF_COLORS.navy);
    doc.text("Notification Preferences", margin + 8, y + 7);
    y += 18;

    const notifStr = (n: { email: boolean; sms: boolean; push: boolean }) => {
      const parts = [];
      if (n.email) parts.push("Email");
      if (n.sms) parts.push("SMS");
      if (n.push) parts.push("Push");
      return parts.length > 0 ? parts.join(", ") : "None";
    };

    row("Appointments:", notifStr(notifications.appointments));
    row("Lab Results:", notifStr(notifications.labs));
    row("Billing Invoice:", notifStr(notifications.billing));
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeSection, setActiveSection] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Reusable custom modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "confirmDelete";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Form State
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    avatarUrl: "",
  });
  
  const [security, setSecurity] = useState({
    twoFA: false,
  });

  const [notifications, setNotifications] = useState({
    appointments: { email: true, sms: true, push: true },
    labs: { email: true, sms: false, push: true },
    billing: { email: true, sms: false, push: false },
  });

  const [preferences, setPreferences] = useState({
    language: "English (United States)",
    theme: "light" as "light" | "dark",
  });

  const [privacy, setPrivacy] = useState({
    research: false,
    providers: false
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }
        setSessionUser(user);

        // Fetch Profile
        const { data: profileData } = await supabase
          .from("patient_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile({
            fullName: profileData.full_name || "",
            email: user.email || "",
            phone: profileData.phone_number || "",
            dob: profileData.date_birth || "",
            avatarUrl: profileData.avatar_url || "",
          });
        }

        // Fetch Settings
        const { data: settingsData } = await supabase
          .from("patient_settings")
          .select("*")
          .eq("patient_id", user.id)
          .single();

        if (settingsData) {
          setSecurity({ twoFA: settingsData.two_factor_auth ?? false });
          setPreferences({
            language: settingsData.language || "English (United States)",
            theme: (settingsData.theme as "light" | "dark") || "light",
          });
          setNotifications({
            appointments: {
              email: settingsData.notif_appointments_email ?? true,
              sms: settingsData.notif_appointments_sms ?? true,
              push: settingsData.notif_appointments_push ?? true,
            },
            labs: {
              email: settingsData.notif_labs_email ?? true,
              sms: settingsData.notif_labs_sms ?? false,
              push: settingsData.notif_labs_push ?? true,
            },
            billing: {
              email: settingsData.notif_billing_email ?? true,
              sms: settingsData.notif_billing_sms ?? false,
              push: settingsData.notif_billing_push ?? false,
            }
          });
          setPrivacy({
            research: settingsData.privacy_research ?? false,
            providers: settingsData.privacy_providers ?? false,
          });
        }

      } catch (error) {
        console.error("Error fetching patient data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [router]);

  // Setup intersection observer to highlight side nav automatically on scroll
  useEffect(() => {
    if (isLoading) return;
    const sections = ["profile", "security", "notifications", "preferences"];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: "-100px 0px -60% 0px" }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach(obs => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [isLoading]);

  const handleToggleNotification = (category: keyof typeof notifications, type: "email" | "sms" | "push") => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type],
      }
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionUser) return;

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64String = uploadEvent.target?.result as string;
      if (!base64String) return;

      const supabase = createClient();
      
      // Update DB with image base64
      const { error } = await supabase
        .from("patient_profiles")
        .update({ avatar_url: base64String })
        .eq("id", sessionUser.id);

      if (error) {
        setModal({
          isOpen: true,
          type: "error",
          title: "Upload Failed",
          message: error.message,
        });
      } else {
        setProfile(prev => ({ ...prev, avatarUrl: base64String }));
        setModal({
          isOpen: true,
          type: "success",
          title: "Photo Updated",
          message: "Your profile picture was successfully uploaded and saved.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    if (!sessionUser) return;
    setIsSaving(true);
    try {
      const supabase = createClient();

      // Upsert profile
      const { error: profileError } = await supabase.from("patient_profiles").upsert({
        id: sessionUser.id,
        full_name: profile.fullName,
        phone_number: profile.phone,
        date_birth: profile.dob,
        avatar_url: profile.avatarUrl,
        gender: "Male"
      });
      if (profileError) throw profileError;

      // Upsert settings including privacy fields
      const settingsPayload: any = {
        patient_id: sessionUser.id,
        two_factor_auth: security.twoFA,
        theme: preferences.theme,
        language: preferences.language,
        notif_appointments_email: notifications.appointments.email,
        notif_appointments_sms: notifications.appointments.sms,
        notif_appointments_push: notifications.appointments.push,
        notif_labs_email: notifications.labs.email,
        notif_labs_sms: notifications.labs.sms,
        notif_labs_push: notifications.labs.push,
        notif_billing_email: notifications.billing.email,
        notif_billing_sms: notifications.billing.sms,
        notif_billing_push: notifications.billing.push,
        privacy_research: privacy.research,
        privacy_providers: privacy.providers,
      };

      const { error: settingsError } = await supabase.from("patient_settings").upsert(settingsPayload);
      
      if (settingsError) {
        // If columns do not exist in the database schema, try saving without the privacy fields
        const isColumnError = 
          settingsError.message?.includes("privacy_providers") || 
          settingsError.message?.includes("privacy_research") || 
          settingsError.message?.includes("column") || 
          settingsError.code === "P0002" ||
          settingsError.code === "42703";

        if (isColumnError) {
          console.warn("Privacy settings columns missing from database schema cache. Retrying settings upsert without privacy properties...");
          const { privacy_research, privacy_providers, ...fallbackPayload } = settingsPayload;
          const { error: retryError } = await supabase.from("patient_settings").upsert(fallbackPayload);
          if (retryError) throw retryError;
        } else {
          throw settingsError;
        }
      }

      setModal({
        isOpen: true,
        type: "success",
        title: "Settings Saved",
        message: "Your clinic dashboard settings have been successfully updated.",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: error.message || "An unexpected error occurred building update.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!profile.email) return;
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(profile.email);
      setModal({
        isOpen: true,
        type: "success",
        title: "Reset Link Sent",
        message: "A password reset email has been sent to " + profile.email,
      });
    } catch (error: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Reset Failed",
        message: "Failed to send reset email link.",
      });
    }
  };

  const handleDeleteAccount = () => {
    setModal({
      isOpen: true,
      type: "confirmDelete",
      title: "Delete Account Permanently",
      message: "Are you sure you want to permanently delete your Clinq account and all associated health records? This process is irreversible.",
      onConfirm: executeAccountDeletion,
    });
  };

  const executeAccountDeletion = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${data.session?.access_token}`,
        }
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to delete account");
      }
      
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: error.message,
      });
    }
  };

  const getUserInitials = () => {
    if (!profile.fullName) return "PA";
    const parts = profile.fullName.split(" ");
    if (parts.length > 1) return parts[0][0] + parts[parts.length - 1][0];
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };


  if (isLoading) {
    return <div className="p-12 text-center text-[#42474F]">Loading settings...</div>;
  }

  return (
    <div className="w-full flex gap-6 px-6 py-6 bg-[#F8F9FF] font-[Manrope,sans-serif] text-[#42474F] min-h-screen">

      {/* ── Left Settings Nav ── */}
      <div className="flex flex-col gap-2 w-[220px] shrink-0 sticky top-24 self-start">
        {settingsNav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleNavClick(id)}
            className={`flex items-center gap-3 px-4 py-4 rounded-[8px] border text-left transition-colors cursor-pointer ${
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
        <section id="profile" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-[700] leading-8 text-[#00355F]">Profile Settings</h2>
            <button 
              onClick={handleSaveChanges} 
              disabled={isSaving}
              className="px-6 py-2 bg-[#00355F] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white hover:bg-[#002645] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-8">
            <div className="flex items-start gap-12">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="w-32 h-32 rounded-[12px] border-4 border-[#DCE9FF] bg-[#DCE9FF] flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt="Patient Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[32px] font-[700] text-[#00355F]">{getUserInitials()}</span>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:underline cursor-pointer"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">FULL NAME</label>
                  <input
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="px-3 py-3 bg-white border border-[#C2C7D1] rounded-[4px] text-[16px] font-[400] text-[#0D1C2E] outline-none focus:border-[#00355F] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">EMAIL ADDRESS</label>
                  <input
                    value={profile.email}
                    readOnly
                    disabled
                    className="px-3 py-3 bg-[#F1F3F9] border border-[#C2C7D1] rounded-[4px] text-[16px] font-[400] text-[#767F8D] outline-none cursor-not-allowed select-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">PHONE NUMBER</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="px-3 py-3 bg-white border border-[#C2C7D1] rounded-[4px] text-[16px] font-[400] text-[#0D1C2E] outline-none focus:border-[#00355F] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-[600] tracking-[0.6px] uppercase text-[#42474F]">DATE OF BIRTH</label>
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    className="px-3 py-3 bg-white border border-[#C2C7D1] rounded-[4px] text-[16px] font-[400] text-[#0D1C2E] outline-none focus:border-[#00355F] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Security ── */}
        <section id="security" className="flex flex-col gap-6 scroll-mt-24">
          <h3 className="text-[18px] font-[700] leading-8 text-[#00355F]">Security</h3>
          <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)]">
            {/* Password Row */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-[#C2C7D1]">
              <div className="flex flex-col gap-1">
                <span className="text-[18px] font-[700] leading-7 text-[#0D1C2E]">Password</span>
                <span className="text-[14px] font-[400] leading-5 text-[#42474F]">Secure your account with a strong password</span>
              </div>
              <button onClick={handleResetPassword} className="px-6 py-2 border border-[#00355F] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#00355F] hover:bg-[#EFF4FF] transition-colors whitespace-nowrap cursor-pointer">
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
                  {security.twoFA ? "Enabled" : "Disabled"}
                </span>
                <button
                  onClick={() => setSecurity({ ...security, twoFA: !security.twoFA })}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${security.twoFA ? "bg-[#00355F]" : "bg-[#D5E3FC]"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white border border-[#D1D5DB] rounded-full shadow transition-transform ${security.twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-[12px] font-[700] tracking-[0.6px] text-[#00355F]">
                  {security.twoFA ? "Enabled" : "Enable"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Notification Preferences ── */}
        <section id="notifications" className="flex flex-col gap-6 scroll-mt-24">
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
            {[
              { label: "Appointments", desc: "Reminders and scheduling updates", key: "appointments" as const },
              { label: "Lab Results", desc: "Alerts when new reports are available", key: "labs" as const },
              { label: "Billing", desc: "Invoices and payment receipts", key: "billing" as const }
            ].map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_auto_auto_auto] items-center ${idx > 0 ? "border-t border-[#C2C7D1]" : ""}`}
              >
                <div className="px-4 py-4 flex flex-col gap-1">
                  <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">{row.label}</span>
                  <span className="text-[14px] font-[400] leading-5 text-[#42474F]">{row.desc}</span>
                </div>
                <button onClick={() => handleToggleNotification(row.key, "email")} className="flex justify-center items-center w-[108px] py-4 cursor-pointer"><Checkbox checked={notifications[row.key].email} /></button>
                <button onClick={() => handleToggleNotification(row.key, "sms")} className="flex justify-center items-center w-[92px] py-4 cursor-pointer"><Checkbox checked={notifications[row.key].sms} /></button>
                <button onClick={() => handleToggleNotification(row.key, "push")} className="flex justify-center items-center w-[103px] py-4 cursor-pointer"><Checkbox checked={notifications[row.key].push} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Account Preferences ── */}
        <section id="preferences" className="flex flex-col gap-6 scroll-mt-24">
          <h3 className="text-[18px] font-[700] leading-8 text-[#00355F]">Account Preferences</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Language Card */}
            <div className="bg-white border border-[#C2C7D1] rounded-[8px] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#00355F]" />
                <span className="text-[18px] font-[700] leading-7 text-[#00355F]">Language</span>
              </div>
              <div className="relative">
                <select 
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-3 py-3 bg-white border border-[#C2C7D1] rounded-[4px] text-[16px] font-[400] text-[#0D1C2E] appearance-none outline-none focus:border-[#00355F] transition-colors cursor-pointer"
                >
                  <option value="English (United States)">English (United States)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
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
                  onClick={() => setPreferences({ ...preferences, theme: "light" })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[2px] text-[12px] tracking-[0.6px] transition-all cursor-pointer ${
                    preferences.theme === "light"
                      ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-[700] text-[#00355F]"
                      : "font-[600] text-[#42474F]"
                  }`}
                >
                  <Sun className="w-[22px] h-[22px]" />
                  Light
                </button>
                <button
                  onClick={() => setPreferences({ ...preferences, theme: "dark" })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[2px] text-[12px] tracking-[0.6px] transition-all cursor-pointer ${
                    preferences.theme === "dark"
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
              <DownloadPDFButton
                filename={`clinq-personal-data-${profile.fullName.toLowerCase().replace(/\s+/g, "-")}`}
                label="Download My Data"
                className="text-[12px] font-[700] flex items-center gap-2 tracking-[0.6px] text-[#BA1A1A] hover:underline bg-transparent border-0 cursor-pointer p-0"
                buildDoc={buildHealthPDF(profile, security, notifications, preferences, privacy)}
              />
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setPrivacy({ ...privacy, research: !privacy.research })} 
                className="flex items-start gap-4 p-4 border border-[#C2C7D1] rounded-[4px] cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[#00355F]"
              >
                <div className="pt-0.5 shrink-0">
                  <Checkbox checked={privacy.research} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">Allow anonymized data for research</span>
                  <span className="text-[14px] font-[400] leading-5 text-[#42474F]">Help improve clinical outcomes by sharing de-identified health data</span>
                </div>
              </button>
              
              <button 
                onClick={() => setPrivacy({ ...privacy, providers: !privacy.providers })} 
                className="flex items-start gap-4 p-4 border border-[#C2C7D1] rounded-[4px] cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[#00355F]"
              >
                <div className="pt-0.5 shrink-0">
                  <Checkbox checked={privacy.providers} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E]">Share data with connected providers</span>
                  <span className="text-[14px] font-[400] leading-5 text-[#42474F]">Allow your care team to access records across affiliated clinics</span>
                </div>
              </button>
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
            <button onClick={handleDeleteAccount} className="flex items-center gap-2 px-6 py-2 bg-[#BA1A1A] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white hover:bg-[#9b1515] transition-colors shrink-0 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </section>

      </div>

      {/* ── Custom Dialog Modal ── */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#C2C7D1] rounded-[12px] shadow-2xl w-full max-w-[480px] p-8 flex flex-col gap-6 animate-scale-in">
            <div className="flex flex-col gap-2 border-b border-[#F1F3F9] pb-4">
              <h3 className={`text-[20px] font-[700] ${modal.type === "error" || modal.type === "confirmDelete" ? "text-[#BA1A1A]" : "text-[#00355F]"}`}>
                {modal.title}
              </h3>
            </div>
            <div className="text-[14px] leading-6 text-[#42474F]">
              {modal.message}
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-[#F1F3F9]">
              {modal.type === "confirmDelete" ? (
                <>
                  <button
                    onClick={() => setModal({ ...modal, isOpen: false })}
                    className="flex-grow py-2.5 border border-[#C2C7D1] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-[#42474F] hover:bg-[#F8F9FF] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setModal({ ...modal, isOpen: false });
                      if (modal.onConfirm) modal.onConfirm();
                    }}
                    className="flex-grow py-2.5 bg-[#BA1A1A] hover:bg-[#9b1515] rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white transition-colors cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className={`w-full py-2.5 rounded-[4px] text-[12px] font-[600] tracking-[0.6px] text-white transition-colors cursor-pointer ${
                    modal.type === "error" ? "bg-[#BA1A1A] hover:bg-[#9b1515]" : "bg-[#00355F] hover:bg-[#002645]"
                  }`}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
