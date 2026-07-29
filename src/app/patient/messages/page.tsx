"use client";

import React, { useState } from "react";
import { Phone, Video, Info, Plus, Smile, Send, Paperclip, FileText, Download, CreditCard } from "lucide-react";

const conversations = [
  {
    id: 1,
    name: "Dr. Aris Thorne",
    time: "10:45 AM",
    preview: "Your laboratory results are ready...",
    tags: ["LABS", "URGENT"],
    online: true,
    active: true,
    avatar: null,
    initials: "AT",
    avatarBg: "bg-[#DCE9FF]",
  },
  {
    id: 2,
    name: "Nurse Sarah Chen",
    time: "Yesterday",
    preview: "How are you feeling after the new medication?",
    tags: [],
    online: false,
    active: false,
    avatar: null,
    initials: "SC",
    avatarBg: "bg-[#D4E6E5]",
  },
  {
    id: 3,
    name: "Billing Department",
    time: "Oct 24",
    preview: "Invoice #29402 has been processed.",
    tags: [],
    online: false,
    active: false,
    avatar: null,
    initials: "BD",
    avatarBg: "bg-[#D4E6E5]",
    isBilling: true,
  },
  {
    id: 4,
    name: "Dr. Marcus Vane",
    time: "Oct 22",
    preview: "The follow-up appointment is confirmed for Nov 5.",
    tags: [],
    online: false,
    active: false,
    avatar: null,
    initials: "MV",
    avatarBg: "bg-[#EFF4FF]",
    dimmed: true,
  },
];

const tabs = ["Recent", "Unread", "Care Team"];

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("Recent");

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] overflow-hidden text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">

      {/* ── Inbox List ── */}
      <div className="flex flex-col w-[384px] shrink-0 bg-[#F8F9FF] dark:bg-[#080F18] border-r border-[#C2C7D1] dark:border-[#22354A] h-full transition-colors">

        {/* Inbox Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <span className="text-[24px] font-[600] leading-8 text-[#00355F] dark:text-white transition-colors">Inboxes</span>
          <span className="px-2 py-0.5 bg-[#0F4C81] dark:bg-[#1B6CA8] rounded-[2px] text-[10px] font-[700] text-[#D9E6F8] dark:text-white transition-colors">
            4 NEW
          </span>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 p-1 bg-[#EFF4FF] dark:bg-[#1E2D4A]/50 rounded-[8px] transition-colors">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-[4px] text-[12px] tracking-[0.6px] transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#121E2C] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-[700] text-[#00355F] dark:text-white"
                    : "font-[600] text-[#42474F] dark:text-[#A5AAB5]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex flex-col overflow-y-auto flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex flex-col px-6 py-6 cursor-pointer transition-colors ${
                conv.active
                  ? "bg-[#DCE9FF] dark:bg-[#1E2D4A] border-l-4 border-[#00355F] dark:border-[#5F9EA0]"
                  : "border-b border-[rgba(194,199,209,0.3)] dark:border-[#22354A]/30 hover:bg-[#EFF4FF] dark:hover:bg-[#121E2C]/50"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`relative shrink-0 w-12 h-12 rounded-[12px] ${conv.avatarBg} dark:bg-[#1E2D4A]/60 flex items-center justify-center transition-colors ${conv.dimmed ? "opacity-70" : ""}`}>
                  {conv.isBilling ? (
                    <CreditCard className="w-[22px] h-4 text-[#576867] dark:text-[#5F9EA0] transition-colors" />
                  ) : (
                    <span className="text-[14px] font-[700] text-[#00355F] dark:text-white transition-colors">{conv.initials}</span>
                  )}
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] border-2 border-[#DCE9FF] dark:border-[#1E2D4A] rounded-full transition-colors" />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[16px] leading-6 text-[#0D1C2E] dark:text-white truncate transition-colors ${conv.active ? "font-[700]" : "font-[600]"}`}>
                      {conv.name}
                    </span>
                    <span className="text-[11px] font-[400] text-[#42474F] dark:text-[#A5AAB5] shrink-0 transition-colors">{conv.time}</span>
                  </div>
                  <p className={`text-[14px] leading-5 truncate transition-colors ${conv.active ? "font-[600] text-[#00355F] dark:text-[#5F9EA0]" : "font-[400] text-[#42474F] dark:text-[#A5AAB5]"}`}>
                    {conv.preview}
                  </p>
                  {conv.tags.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {conv.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-[#F8F9FF] dark:bg-[#080F18] border border-[#C2C7D1] dark:border-[#22354A] rounded-[2px] text-[10px] font-[700] text-[#576867] dark:text-[#5F9EA0] transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Window ── */}
      <div className="flex flex-col flex-1 bg-white dark:bg-[#121E2C] h-full transition-colors">

        {/* Chat Header */}
        <div className="flex items-center justify-between px-8 h-20 border-b border-[#C2C7D1] dark:border-[#22354A] shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#DCE9FF] dark:bg-[#1E2D4A] flex items-center justify-center shrink-0 transition-colors">
              <span className="text-[13px] font-[700] text-[#00355F] dark:text-white">AT</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E] dark:text-white transition-colors">Dr. Aris Thorne</span>
              <div className="flex items-center gap-1.5 font-[600]">
                <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                <span className="text-[12px] tracking-[0.6px] text-[#16A34A] dark:text-[#22C55E]">Active Now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-[12px] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] text-[#42474F] dark:text-[#A5AAB5] transition-colors cursor-pointer">
              <Phone className="w-[18px] h-[18px]" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-[12px] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] text-[#42474F] dark:text-[#A5AAB5] transition-colors cursor-pointer">
              <Video className="w-5 h-4" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-[12px] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] text-[#42474F] dark:text-[#A5AAB5] transition-colors cursor-pointer">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6 bg-[rgba(248,249,255,0.5)] dark:bg-[#080F18]/50 transition-colors">

          {/* Date separator */}
          <div className="flex justify-center">
            <span className="px-4 py-1 bg-[#EFF4FF] dark:bg-[#1E2D4A] border border-[rgba(194,199,209,0.3)] dark:border-[#22354A] rounded-[12px] text-[11px] font-[700] text-[#42474F] dark:text-[#A5AAB5] transition-colors">
              OCTOBER 25, 2023
            </span>
          </div>

          {/* Message Received 1 */}
          <div className="flex items-start gap-4 max-w-[512px]">
            <div className="w-8 h-8 rounded-[12px] bg-[#DCE9FF] dark:bg-[#1C2C3E] flex items-center justify-center shrink-0 mt-1 transition-colors">
              <span className="text-[10px] font-[700] text-[#00355F] dark:text-white">AT</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-[#D5E3FC] dark:bg-[#1C2C3E] border border-[rgba(194,199,209,0.2)] dark:border-[#22354A]/30 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[0px_16px_16px_16px] px-4 py-4 transition-colors">
                <p className="text-[16px] font-[400] leading-6 text-[#0D1C2E] dark:text-white transition-colors">
                  Hello! I've just reviewed your blood work results from Wednesday. Everything looks quite stable, but I've noticed a slight dip in your Vitamin D levels.
                </p>
              </div>
              <span className="text-[10px] font-[600] text-[#42474F] dark:text-[#A5AAB5] pl-1 transition-colors">10:42 AM</span>
            </div>
          </div>

          {/* Message Sent */}
          <div className="flex justify-end max-w-[512px] self-end">
            <div className="flex flex-col gap-1 items-end">
              <div className="bg-[#00355F] dark:bg-[#1B6CA8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px_0px_16px_16px] px-4 py-4 transition-colors">
                <p className="text-[16px] font-[400] leading-6 text-white text-right">
                  That's good to hear. Should I increase my supplement dosage for the Vitamin D?
                </p>
              </div>
              <span className="text-[10px] font-[600] text-[#42474F] dark:text-[#A5AAB5] pr-1 transition-colors">10:44 AM · Delivered</span>
            </div>
          </div>

          {/* Message Received with Attachment */}
          <div className="flex items-start gap-4 max-w-[512px]">
            <div className="w-8 h-8 rounded-[12px] bg-[#DCE9FF] dark:bg-[#1C2C3E] flex items-center justify-center shrink-0 mt-1 transition-colors">
              <span className="text-[10px] font-[700] text-[#00355F] dark:text-white">AT</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-[#D5E3FC] dark:bg-[#1C2C3E] border border-[rgba(194,199,209,0.2)] dark:border-[#22354A]/30 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[0px_16px_16px_16px] px-4 py-4 flex flex-col gap-4 transition-colors">
                <p className="text-[16px] font-[400] leading-6 text-[#0D1C2E] dark:text-white transition-colors">
                  Yes, I've attached a revised care plan with the adjusted dosage. Please take a look and let me know if you have any questions.
                </p>
                {/* Attachment Card */}
                <div className="flex items-center gap-3 bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-[8px] p-3 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#FFDAD6] dark:bg-[#4A1B1B] rounded-[4px] shrink-0 transition-colors">
                    <FileText className="w-5 h-5 text-[#BA1A1A] dark:text-[#FFB4AB] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[14px] font-[700] leading-5 text-[#0D1C2E] dark:text-white truncate transition-colors">Revised_Care_Plan_Oct25.pdf</span>
                    <span className="text-[10px] font-[400] text-[#42474F] dark:text-[#A5AAB5] transition-colors">2.4 MB • PDF Document</span>
                  </div>
                  <button className="shrink-0 cursor-pointer">
                    <Download className="w-4 h-4 text-[#727780] dark:text-[#A5AAB5] hover:text-[#00355F] dark:hover:text-white transition-colors animate-pulse" />
                  </button>
                </div>
              </div>
              <span className="text-[10px] font-[600] text-[#42474F] dark:text-[#A5AAB5] pl-1 transition-colors">10:45 AM</span>
            </div>
          </div>

          {/* Typing Indicator */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-[12px] bg-[#DCE9FF] dark:bg-[#1C2C3E] flex items-center justify-center shrink-0 transition-colors">
              <span className="text-[10px] font-[700] text-[#00355F] dark:text-white">AT</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#1C2C3E] border border-[rgba(194,199,209,0.3)] dark:border-[#22354A] rounded-[12px] px-4 py-3 transition-colors">
              <span className="w-1.5 h-1.5 bg-[#727780] dark:bg-[#A5AAB5] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#727780] dark:bg-[#A5AAB5] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#727780] dark:bg-[#A5AAB5] rounded-full animate-bounce" />
            </div>
          </div>
        </div>

        {/* Chat Footer / Input */}
        <div className="px-8 py-8 border-t border-[#C2C7D1] dark:border-[#22354A] shrink-0 transition-colors">
          <div className="flex items-center gap-2 bg-[#EFF4FF] dark:bg-[#1E2D4A]/50 border border-[rgba(194,199,209,0.5)] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-[16px] px-2 py-2 transition-all">
            <button className="flex items-center justify-center w-10 h-10 shrink-0 cursor-pointer hover:bg-white/10 rounded-full transition-colors">
              <Plus className="w-[14px] h-[14px] text-[#42474F] dark:text-[#A5AAB5]" />
            </button>
            <input
              type="text"
              placeholder="Write a secure message to your care team..."
              className="flex-1 bg-transparent text-[16px] font-[400] text-[#0D1C2E] dark:text-white placeholder:text-[#727780] dark:placeholder:text-[#A5AAB5]/60 outline-none"
            />
            <div className="flex items-center gap-1 shrink-0">
              <button className="flex items-center justify-center w-10 h-10 cursor-pointer hover:bg-white/10 rounded-full transition-colors">
                <Smile className="w-5 h-5 text-[#42474F] dark:text-[#A5AAB5]" />
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-[#00355F] dark:bg-[#1B6CA8] rounded-[8px] hover:bg-[#002645] dark:hover:bg-[#2582C7] transition-colors cursor-pointer">
                <Send className="w-[19px] h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
