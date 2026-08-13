"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Video, Info, Plus, Smile, Send, Paperclip, 
  FileText, Download, CreditCard, ArrowLeft, Loader2, 
  MessageSquare, UserPlus, AlertCircle, ShoppingBag, ShieldCheck, Zap
} from "lucide-react";

interface Conversation {
  id: string;
  participant_b_name: string;
  participant_b_initials: string;
  participant_b_avatar_bg: string;
  online: boolean;
  dimmed: boolean;
  is_billing: boolean;
  is_ai: boolean;
  last_message_at: string;
  preview: string;
  time: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_name: string;
  text: string;
  created_at: string;
  attachment_name?: string;
  attachment_url?: string;
  attachment_size?: string;
  attachment_type?: string;
}

interface Specialist {
  id: string;
  full_name: string;
  specialty: string;
  initials: string;
  color_grad: string;
  image_url?: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  
  const [minutesBalance, setMinutesBalance] = useState<number>(30);
  const [clientMode, setClientMode] = useState<'ai' | 'real'>('ai');
  const [inputText, setInputText] = useState("");
  
  // Loading & Action states
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Modals
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState<number>(15);
  const [buyingStatus, setBuyingStatus] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState("Recent");
  const [mobileView, setMobileView] = useState<"inbox" | "chat">("inbox");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial conversations list & patient minutes balance
  const fetchConversations = async (autoSelectId?: string) => {
    try {
      const res = await fetch("/api/patient/messages");
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
      setMinutesBalance(data.minutesBalance ?? 30);
      
      // Auto-select conversation if exists, otherwise default to first active
      if (data.conversations && data.conversations.length > 0) {
        if (autoSelectId) {
          const match = data.conversations.find((c: Conversation) => c.id === autoSelectId);
          if (match) setSelectedConv(match);
        } else if (!selectedConv) {
          setSelectedConv(data.conversations[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorText("Error loading chat sessions.");
    } finally {
      setLoadingConv(false);
    }
  };

  // Fetch specialists for starting a new chat
  const fetchSpecialists = async () => {
    try {
      const res = await fetch("/api/patient/doctors");
      if (res.ok) {
        const data = await res.json();
        setSpecialists(data.specialists || []);
      }
    } catch (err) {
      console.error("Failed to load doctors list", err);
    }
  };

  // Fetch messages in the selected active conversation thread
  const fetchMessages = async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/patient/messages/${convId}`);
      if (!res.ok) throw new Error("Could not retrieve messages");
      const data = await res.json();
      setMessages(data.messages || []);
      
      // Sync conversation schema details
      if (data.conversation) {
        setSelectedConv(prev => prev ? { ...prev, ...data.conversation } : data.conversation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Trigger page load
  useEffect(() => {
    fetchConversations();
    fetchSpecialists();
  }, []);

  // Sync messages when active thread changes
  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      // Auto toggle to AI mode if the conversation is billing
      if (selectedConv.is_billing) {
        setClientMode('ai');
      }
    }
  }, [selectedConv?.id]);

  // Scroll to bottom of message list on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Start new conversation check/create
  const handleStartChat = async (doctor: Specialist) => {
    setIsChatModalOpen(false);
    setLoadingConv(true);
    try {
      // Find bg color or use fallback
      const bgMap: { [key: string]: string } = {
        'JV': 'bg-[#DCE9FF]',
        'ER': 'bg-[#F3E8FF]',
        'MT': 'bg-[#EFF4FF]',
        'SJ': 'bg-[#FFE2EC]',
        'LG': 'bg-[#FFEDD5]'
      };
      const avatarBg = bgMap[doctor.initials] || 'bg-[#DCE9FF]';

      const res = await fetch("/api/patient/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName: doctor.full_name,
          initials: doctor.initials,
          avatarBg: avatarBg
        })
      });

      if (!res.ok) throw new Error("Error initiating conversation");
      const data = await res.json();
      if (data.success && data.conversation) {
        // Reload inbox list and select this conversation
        await fetchConversations(data.conversation.id);
        setSelectedConv(data.conversation);
        setMobileView("chat");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Could not start conversation with specialist.");
      setLoadingConv(false);
    }
  };

  // Send message submit flow
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv || sendingMsg) return;

    const messageText = inputText.trim();
    setInputText("");
    setSendingMsg(true);

    // 1. Instantly append message to UI (Optimistic Rendering)
    const tempUserMsg: Message = {
      id: Math.random().toString(),
      conversation_id: selectedConv.id,
      sender_id: "patient-id", // mock representation
      sender_name: "Patient",
      text: messageText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // Show simulated typing indicator if chatting with AI
    const activeAiMode = selectedConv.is_billing ? true : (clientMode === 'ai' && selectedConv.is_ai);
    if (activeAiMode) {
      // Small artificial lag prior to showing builder indicator
      setTimeout(() => setIsTyping(true), 400);
    }

    try {
      // 2. Submit to backend API
      const res = await fetch(`/api/patient/messages/${selectedConv.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: messageText,
          clientMode: selectedConv.is_billing ? 'ai' : clientMode
        })
      });

      if (!res.ok) {
        const errorJson = await res.json();
        // Remove optimistic user message if failed
        setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
        
        if (errorJson.code === "INSUFFICIENT_MINUTES") {
          setIsBuyModalOpen(true);
        } else {
          alert(errorJson.error || "Failed to deliver message.");
        }
        setIsTyping(false);
        setSendingMsg(false);
        return;
      }

      const data = await res.json();
      
      // Update local minutes balance
      setMinutesBalance(data.minutesBalance ?? minutesBalance);

      // 3. Remove temp message, append actual saved message and response
      setMessages(prev => {
        const list = prev.filter(m => m.id !== tempUserMsg.id);
        if (data.userMessage) list.push(data.userMessage);
        return list;
      });

      // Handle AI doctor typing continuation delays/reply injection
      if (data.replyMessage) {
        // Animate reply inclusion shortly after typing completion
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, data.replyMessage]);
          // Sync inbox preview
          fetchConversations(selectedConv.id);
        }, 1200);
      } else {
        setIsTyping(false);
        fetchConversations(selectedConv.id);
      }

    } catch (err) {
      console.error(err);
      alert("Network discrepancy. Message failed to send.");
      setIsTyping(false);
    } finally {
      // Wait for AI trigger completion before unlock
      setTimeout(() => setSendingMsg(false), 800);
    }
  };

  // Buy minutes simulation
  const handleBuyMinutes = async () => {
    setBuyingStatus(true);
    try {
      const res = await fetch("/api/patient/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "buy-minutes",
          minutes: buyQuantity
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMinutesBalance(data.minutesBalance);
        setIsBuyModalOpen(false);
      } else {
        alert("Failed to purchase minutes.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBuyingStatus(false);
    }
  };

  // Filter conversations by tab
  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "Unread") {
      // Billing system or unread queries
      return c.is_billing || c.preview.includes("results are ready");
    }
    if (activeTab === "Care Team") {
      return !c.is_billing;
    }
    return true; // Recent
  });

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] overflow-hidden text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
      
      {/* ── Inbox List ── */}
      <div className={`flex flex-col w-full md:w-[384px] shrink-0 bg-[#F8F9FF] dark:bg-[#080F18] border-r border-[#C2C7D1] dark:border-[#22354A] h-full transition-colors ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
        
        {/* Inbox Header */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-4">
          <span className="text-[24px] font-[600] leading-8 text-[#00355F] dark:text-white transition-colors">Inboxes</span>
          <div className="flex items-center gap-2">
            {/* Start Chat Button */}
            <button 
              onClick={() => setIsChatModalOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#00355F] dark:bg-[#1B6CA8] hover:opacity-90 transition-opacity text-white cursor-pointer"
              title="Start conversation with doctor"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 bg-[#0F4C81] dark:bg-[#1B6CA8] rounded-[2px] text-[10px] font-[700] text-[#D9E6F8] dark:text-white transition-colors">
              {filteredConversations.length} CHATS
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 md:px-6 pb-4">
          <div className="flex items-center gap-2 p-1 bg-[#EFF4FF] dark:bg-[#1E2D4A]/50 rounded-[8px] transition-colors">
            {["Recent", "Unread", "Care Team"].map((tab) => (
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
          {loadingConv ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 text-[#00355F] dark:text-[#1B6CA8] animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs">
              <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
              <span>No conversations found. Click '+' above to start a chat with an available doctor.</span>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const active = selectedConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConv(conv);
                    setMobileView("chat");
                  }}
                  className={`flex flex-col px-4 md:px-6 py-5 cursor-pointer transition-colors ${
                    active
                      ? "bg-[#DCE9FF] dark:bg-[#1E2D4A] border-l-4 border-[#00355F] dark:border-[#5F9EA0]"
                      : "border-b border-[rgba(194,199,209,0.3)] dark:border-[#22354A]/30 hover:bg-[#EFF4FF] dark:hover:bg-[#121E2C]/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`relative shrink-0 w-11 h-11 rounded-[12px] ${conv.participant_b_avatar_bg} flex items-center justify-center transition-colors ${conv.dimmed ? "opacity-70" : ""}`}>
                      {conv.is_billing ? (
                        <CreditCard className="w-[18px] h-4 text-[#576867] dark:text-[#5F9EA0]" />
                      ) : (
                        <span className="text-[14px] font-[700] text-[#00355F] dark:text-slate-800">{conv.participant_b_initials}</span>
                      )}
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] border-2 border-white dark:border-[#1E2D4A] rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[15px] leading-5 text-[#0D1C2E] dark:text-white truncate ${active ? "font-[700]" : "font-[600]"}`}>
                          {conv.participant_b_name}
                        </span>
                        <span className="text-[10px] font-[400] text-[#42474F] dark:text-[#A5AAB5] shrink-0">{conv.time}</span>
                      </div>
                      <p className={`text-[13px] leading-4 truncate ${active ? "font-[600] text-[#00355F] dark:text-[#5F9EA0]" : "font-[400] text-[#42474F] dark:text-[#A5AAB5]"}`}>
                        {conv.preview}
                      </p>
                      
                      {!conv.is_billing && (
                        <span className="text-[10px] font-[600] mt-1 text-[#0f4c81]/80 dark:text-[#5F9EA0]/80 tracking-wide uppercase px-1 bg-white/40 dark:bg-black/20 w-fit rounded">
                          {conv.is_ai ? "🤖 AI Assistant" : "👨‍⚕️ Provider Live"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Window ── */}
      <div className={`flex flex-col flex-1 bg-white dark:bg-[#121E2C] h-full transition-colors ${mobileView === "inbox" ? "hidden md:flex" : "flex"}`}>
        
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 md:px-8 h-20 border-b border-[#C2C7D1] dark:border-[#22354A] shrink-0 transition-colors">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                {/* Back button — mobile only */}
                <button
                  onClick={() => setMobileView("inbox")}
                  className="flex md:hidden items-center justify-center w-9 h-9 rounded-[8px] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] text-[#00355F] dark:text-[#5F9EA0] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className={`w-10 h-10 rounded-[12px] ${selectedConv.participant_b_avatar_bg} flex items-center justify-center shrink-0`}>
                  {selectedConv.is_billing ? (
                    <CreditCard className="w-4 h-4 text-[#576867] dark:text-[#5F9EA0]" />
                  ) : (
                    <span className="text-[13px] font-[700] text-[#00355F] dark:text-slate-800">{selectedConv.participant_b_initials}</span>
                  )}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="text-[16px] font-[700] leading-6 text-[#0D1C2E] dark:text-white truncate">
                    {selectedConv.participant_b_name}
                  </span>
                  <div className="flex items-center gap-1.5 font-[600]">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedConv.online ? "bg-[#22C55E]" : "bg-neutral-400"}`} />
                    <span className="text-[11px] text-[#727780] dark:text-[#A5AAB5]">
                      {selectedConv.online ? "Active Now" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat settings & AI/Real Toggle */}
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                
                {/* AI vs Real Doctor Toggle (hidden for billing) */}
                {!selectedConv.is_billing && (
                  <div className="flex items-center bg-[#EFF4FF] dark:bg-[#1E2D4A] rounded-full p-1 border border-[#00355F]/10 text-xs">
                    <button
                      onClick={() => setClientMode('ai')}
                      className={`px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all ${
                        clientMode === 'ai' 
                          ? 'bg-[#00355F] text-white shadow'
                          : 'text-[#42474F] dark:text-[#A5AAB5]'
                      }`}
                    >
                      🤖 AI Free
                    </button>
                    <button
                      onClick={() => setClientMode('real')}
                      className={`px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        clientMode === 'real' 
                          ? 'bg-[#1B6CA8] text-white shadow'
                          : 'text-[#42474F] dark:text-[#A5AAB5]'
                      }`}
                    >
                      👨‍⚕️ Real Chat
                      <Zap className="w-3 h-3fill-amber-400 text-amber-400" />
                    </button>
                  </div>
                )}

                {/* Patient Portal Paid Minutes indicators */}
                {!selectedConv.is_billing && (
                  <div className="hidden lg:flex flex-col text-right font-sans">
                    <span className="text-[11px] text-[#727780] dark:text-[#A5AAB5] uppercase font-bold tracking-wider">Minutes Balance</span>
                    <button 
                      onClick={() => setIsBuyModalOpen(true)}
                      className="text-xs font-bold text-[#00355F] dark:text-[#1B6CA8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {minutesBalance} min
                    </button>
                  </div>
                )}

                <button className="flex items-center justify-center w-9 h-9 border border-[#C2C7D1] dark:border-[#22354A] rounded-[12px] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] text-[#42474F] dark:text-[#A5AAB5] transition-colors cursor-pointer">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Live Doctor Banner */}
            {clientMode === 'real' && !selectedConv.is_billing && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 px-4 md:px-8 py-2.5 border-b border-amber-200 dark:border-amber-900/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
                  <span>Real Doctor Mode is simulated. Each message deducts 1 min from your balance. (Balance: {minutesBalance} mins).</span>
                </div>
                <button 
                  onClick={() => setIsBuyModalOpen(true)}
                  className="px-3 py-1 bg-amber-600 dark:bg-amber-800 hover:opacity-90 text-white rounded text-[10px] font-bold tracking-wider cursor-pointer"
                >
                  BUY MINUTES
                </button>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6 bg-[rgba(248,249,255,0.5)] dark:bg-[#080F18]/50 transition-colors">
              {loadingMsgs ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 text-[#00355F] dark:text-[#1B6CA8] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center py-20 text-xs">
                  <span>Send a message to start conversation.</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender_id !== null && msg.sender_id !== "";
                  const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} max-w-full`}
                    >
                      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar (left for doctor) */}
                        {!isUser && (
                          <div className={`w-8 h-8 rounded-[12px] ${selectedConv.participant_b_avatar_bg} flex items-center justify-center shrink-0 mt-1`}>
                            {selectedConv.is_billing ? (
                              <CreditCard className="w-3 h-3 text-[#576867] dark:text-[#5F9EA0]" />
                            ) : (
                              <span className="text-[10px] font-[700] text-[#00355F] dark:text-slate-800">{selectedConv.participant_b_initials}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className={`rounded-[16px] px-4 py-3 border shadow-[0px_1px_2px_rgba(0,0,0,0.02)] ${
                            isUser 
                              ? "bg-[#00355F] dark:bg-[#1B6CA8] text-white border-transparent rounded-[16px_0px_16px_16px]"
                              : "bg-white dark:bg-[#1C2C3E] text-[#0D1C2E] dark:text-white border-[#EFF4FF] dark:border-[#22354A] rounded-[0px_16px_16px_16px]"
                          }`}>
                            <p className="text-[14.5px] leading-6 break-words whitespace-pre-wrap">
                              {msg.text}
                            </p>
                          </div>
                          
                          <span className={`text-[9px] font-[600] text-[#727780] dark:text-[#A5AAB5] px-1 ${isUser ? "text-right" : "text-left"}`}>
                            {formattedTime} {isUser && "· Delivered"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-[12px] ${selectedConv.participant_b_avatar_bg} flex items-center justify-center shrink-0`}>
                    <span className="text-[10px] font-[700] text-[#00355F] dark:text-slate-800">{selectedConv.participant_b_initials}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#1C2C3E] border border-[rgba(194,199,209,0.3)] dark:border-[#22354A] rounded-[12px] px-4 py-3">
                    <span className="w-1.5 h-1.5 bg-[#727780] dark:bg-[#A5AAB5] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-[#727780] dark:bg-[#A5AAB5] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-[#727780] dark:bg-[#A5AAB5] rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Footer / Input */}
            <div className="px-4 md:px-8 py-4 border-t border-[#C2C7D1] dark:border-[#22354A] shrink-0 transition-colors">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-[#EFF4FF] dark:bg-[#1E2D4A]/50 border border-[rgba(194,199,209,0.5)] dark:border-[#22354A] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none rounded-[16px] px-2 py-2 transition-all">
                <button 
                  type="button" 
                  className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 shrink-0 cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-[#42474F] dark:text-[#A5AAB5]" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Write a message..."
                  disabled={sendingMsg}
                  className="flex-1 bg-transparent text-[14.5px] font-[400] text-[#0D1C2E] dark:text-white placeholder:text-[#576867] dark:placeholder:text-[#A5AAB5]/60 outline-none min-w-0 px-2"
                />
                
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    type="button"
                    className="hidden sm:flex items-center justify-center w-9 h-9 cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Smile className="w-4 h-4 text-[#42474F] dark:text-[#A5AAB5]" />
                  </button>
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || sendingMsg}
                    className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-[#00355F] dark:bg-[#1B6CA8] rounded-[10px] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer text-white border-none"
                  >
                    {sendingMsg ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-[15px] h-[14px] text-white" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#121E2C] text-[#727780] dark:text-[#A5AAB5] p-8 text-center">
            <MessageSquare className="w-16 h-16 opacity-20 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-[#0D1C2E] dark:text-white mb-1">No Chat Selected</h3>
            <p className="text-xs max-w-xs leading-relaxed">
              Select one of your existing chat threads from the inbox or start a new conversation with a care provider.
            </p>
            <button 
              onClick={() => setIsChatModalOpen(true)}
              className="mt-4 px-6 py-2 bg-[#00355F] dark:bg-[#1B6CA8] hover:opacity-95 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 border-none"
            >
              <UserPlus className="w-3.5 h-3.5" /> Start Conversation
            </button>
          </div>
        )}
      </div>

      {/* ── Modal: Start New Chat ── */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-xl shadow-2xl w-full max-w-[420px] p-6 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center justify-between border-b dark:border-[#22354A] pb-3">
              <span className="font-bold text-[#0D1C2E] dark:text-white text-base">Start a New Conversation</span>
              <button 
                type="button"
                onClick={() => setIsChatModalOpen(false)}
                className="text-[#767F8D] hover:bg-gray-100 dark:hover:bg-white/5 p-1 rounded-full cursor-pointer"
              >
                <XButton />
              </button>
            </div>
            
            <p className="text-xs text-[#576867] dark:text-[#A5AAB5] leading-relaxed">
              Select a clinical specialist below. Standard chat sessions are connected to AI assistants for quick replies, with real provider transitions available.
            </p>

            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
              {specialists.length === 0 ? (
                <div className="text-center py-6 text-xs italic">Loading specialists...</div>
              ) : (
                specialists.map((doc) => (
                  <button 
                    key={doc.id}
                    onClick={() => handleStartChat(doc)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#C2C7D1]/30 dark:border-[#22354A] hover:bg-[#F8F9FF] dark:hover:bg-[#1C2C3E] text-left cursor-pointer w-full group transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${doc.color_grad} flex items-center justify-center shrink-0`}>
                      <span className="text-[11px] font-bold text-white uppercase">{doc.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0D1C2E] dark:text-white truncate group-hover:text-[#00355F] dark:group-hover:text-[#1B6CA8] transition-colors">
                        {doc.full_name}
                      </p>
                      <p className="text-[10px] text-[#727780] dark:text-[#A5AAB5] truncate">{doc.specialty}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Buy Minutes ── */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-xl shadow-2xl w-full max-w-[400px] p-6 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center justify-between border-b dark:border-[#22354A] pb-3">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="text-[#00355F] dark:text-[#1B6CA8] w-5 h-5" />
                <span className="font-bold text-[#0D1C2E] dark:text-white text-base">Purchase Consultation Minutes</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="text-[#767F8D] hover:bg-gray-100 dark:hover:bg-white/5 p-1 rounded-full cursor-pointer"
              >
                <XButton />
              </button>
            </div>

            <p className="text-xs text-[#576867] dark:text-[#A5AAB5] leading-relaxed">
              When live provider chat is activated, messages require an active minutes balance to pay for the doctor's time. Select a minutes package below to top-up (simulated transaction).
            </p>

            <div className="grid grid-cols-3 gap-3 my-2">
              {[
                { label: "15 min", value: 15, price: "$37.50" },
                { label: "30 min", value: 30, price: "$75.00", popular: true },
                { label: "60 min", value: 60, price: "$150.00" }
              ].map((pkg) => (
                <button
                  key={pkg.value}
                  type="button"
                  onClick={() => setBuyQuantity(pkg.value)}
                  className={`relative p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    buyQuantity === pkg.value
                      ? "bg-[#EFF4FF] dark:bg-[#1E2D4A] border-[#00355F] dark:border-[#1B6CA8] shadow-smScale"
                      : "bg-white dark:bg-[#1C2C3E] border-[#C2C7D1]/50 dark:border-[#22354A] hover:bg-gray-50 dark:hover:bg-[#1C2C3E]/50"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 px-1.5 py-0.5 bg-[#BA1A1A] text-[7px] font-bold text-white rounded">
                      BEST VALUE
                    </span>
                  )}
                  <span className="text-xs font-bold text-[#0D1C2E] dark:text-white mt-1">{pkg.label}</span>
                  <span className="text-[10px] text-[#727780] dark:text-[#A5AAB5]">{pkg.price}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 p-3 bg-[#EFF4FF]/30 dark:bg-black/10 rounded-lg text-[10px] text-[#576867] dark:text-[#A5AAB5]">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Payments are simulated using next-gen ERP models. No actual credit card details will be charged.</span>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t dark:border-[#22354A] mt-2">
              <button 
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="px-4 py-2 border dark:border-[#203248] rounded text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer bg-transparent"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleBuyMinutes}
                disabled={buyingStatus}
                className="px-5 py-2 bg-[#00355F] dark:bg-[#1B6CA8] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded transition-all cursor-pointer flex items-center gap-1.5 border-none"
              >
                {buyingStatus ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Invoicing...
                  </>
                ) : (
                  <>Confirm Purchase</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline svg components to prevent icon importing bugs
function XButton() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
