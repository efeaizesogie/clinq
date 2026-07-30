'use client';

import React, { useState, useEffect } from 'react';
import { Download, Plus, CreditCard, Building2, Trash2, ShieldCheck, X, AlertCircle, FileText, Lock, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { drawPDFHeader, PDF_COLORS } from '@/components/DownloadPDFButton';

interface BillingInvoice {
  id: string;
  date: string;
  service: string;
  amount: string;
  status: 'Paid' | 'Pending';
  status_color?: string;
  invoice_url?: string;
}

interface PaymentMethod {
  id: string;
  card_brand: string;
  last_four: string;
  expiration: string;
  is_default: boolean;
}

interface Insurance {
  carrier: string;
  member_id: string;
  group_number: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [insurance, setInsurance] = useState<Insurance | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Insurance Form State
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const [insuranceCarrier, setInsuranceCarrier] = useState('');
  const [insuranceMemberId, setInsuranceMemberId] = useState('');
  const [insuranceGroupNumber, setInsuranceGroupNumber] = useState('');
  const [insuranceError, setInsuranceError] = useState('');

  // Action Loading States
  const [isActionPending, setIsActionPending] = useState(false);
  const [redirectingToStripe, setRedirectingToStripe] = useState(false);

  // Custom Alert / Confirm Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showModal = (
    type: 'success' | 'error' | 'confirm' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Fetch billing data from API
  const fetchData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const res = await fetch('/api/patient/billing');
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to fetch billing data');
      }
      const data = await res.json();
      setInvoices(data.billing || []);
      setCards(data.paymentMethods || []);
      setInsurance(data.insurance || null);
    } catch (e: any) {
      console.error(e);
      setErrorState(e.message || 'Error occurred while loading clinical billing information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData().then(() => {
      // Handle Stripe Checkout success/error queries
      const params = new URLSearchParams(window.location.search);
      const stripeStatus = params.get('stripe_status');
      const action = params.get('action');

      if (stripeStatus === 'success') {
        const handleSuccessCallback = async () => {
          setIsLoading(true);
          try {
            // Build the retrieve API confirm url payload
            const confirmUrl = new URL('/api/patient/billing/session/confirm', window.location.origin);
            confirmUrl.searchParams.set('session_id', params.get('session_id') || '');
            confirmUrl.searchParams.set('action', action || '');
            
            // Forward sandbox properties if available
            const cardBrand = params.get('card_brand');
            const lastFour = params.get('last_four');
            const expiration = params.get('expiration');
            if (cardBrand) confirmUrl.searchParams.set('card_brand', cardBrand);
            if (lastFour) confirmUrl.searchParams.set('last_four', lastFour);
            if (expiration) confirmUrl.searchParams.set('expiration', expiration);

            const res = await fetch(confirmUrl.toString());
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Failed to verify transaction checkout status.');
            }

            showModal(
              'success',
              'Checkout Success',
              action === 'pay-balance'
                ? 'Payment completed successfully via Stripe!'
                : 'New credit card linked securely via Stripe Checkout!'
            );

            // Fetch freshly updated data from API
            await fetchData();
          } catch (e: any) {
            console.error("Success callback error:", e);
            showModal('error', 'Verification Failed', e.message || "Failed to process Stripe Checkout verification.");
          } finally {
            window.history.replaceState({}, '', window.location.pathname);
            setIsLoading(false);
          }
        };
        handleSuccessCallback();
      } else if (stripeStatus === 'cancel') {
        window.history.replaceState({}, '', window.location.pathname);
        showModal('info', 'Checkout Cancelled', "Stripe Checkout was cancelled.");
      }
    });
  }, []);

  // Initiate Stripe checkout redirection session
  const initiateStripeCheckoutSession = async (actionType: 'pay-balance' | 'add-card') => {
    setRedirectingToStripe(true);
    try {
      const bodyPayload = actionType === 'pay-balance'
        ? { actionType, amount: outstandingAmount }
        : { actionType };

      const res = await fetch('/api/patient/billing/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to initiate checkout session');
      }

      const { url } = await res.json();
      if (url) {
        // Redirection to the official Stripe hosted Checkout screen
        window.location.href = url;
      } else {
        throw new Error("No redirection URL returned from session handler.");
      }
    } catch (e: any) {
      console.error(e);
      showModal('error', 'Stripe Redirect Error', e.message || "Error establishing billing context with Stripe.");
      setRedirectingToStripe(false);
    }
  };

  // Set Default Payment Card
  const handleSetDefault = async (cardId: string) => {
    try {
      const res = await fetch('/api/patient/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-default-card', cardId })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Payment Card
  const handleDeleteCard = (cardId: string) => {
    showModal(
      'confirm',
      'Confirm Deletion',
      'Are you sure you want to delete this payment method?',
      async () => {
        try {
          const res = await fetch('/api/patient/billing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete-card', cardId })
          });
          if (res.ok) {
            await fetchData();
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  // Update insurance details
  const handleInsuranceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInsuranceError('');

    if (!insuranceCarrier.trim() || !insuranceMemberId.trim() || !insuranceGroupNumber.trim()) {
      setInsuranceError('All insurance fields are required.');
      return;
    }

    setIsActionPending(true);
    try {
      const res = await fetch('/api/patient/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-insurance',
          carrier: insuranceCarrier,
          memberId: insuranceMemberId,
          groupNumber: insuranceGroupNumber
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update insurance');
      }

      await fetchData();
      setIsInsuranceOpen(false);
    } catch (err: any) {
      setInsuranceError(err.message || 'Error updating insurance details.');
    } finally {
      setIsActionPending(false);
    }
  };

  // Open insurance modal with loaded details
  const openInsuranceModal = () => {
    setInsuranceCarrier(insurance?.carrier || '');
    setInsuranceMemberId(insurance?.member_id || '');
    setInsuranceGroupNumber(insurance?.group_number || '');
    setInsuranceError('');
    setIsInsuranceOpen(true);
  };

  // Generate Receipt PDF
  const downloadReceipt = (invoice: BillingInvoice) => {
    const doc = new jsPDF();
    const margin = 18;
    const W = 210;
    const contentW = W - margin * 2;
    let y = drawPDFHeader(doc, 'CLINQ PORTAL — OFFICIAL PAYMENT RECEIPT');

    // Box
    doc.setFillColor(...PDF_COLORS.light);
    doc.roundedRect(margin, y, contentW, 70, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text('Payment Information', margin + 8, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_COLORS.text);
    
    doc.text(`Invoice ID:  ${invoice.id}`, margin + 8, y + 25);
    doc.text(`Service:     ${invoice.service}`, margin + 8, y + 33);
    doc.text(`Date Filed:  ${invoice.date}`, margin + 8, y + 41);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Amount Paid: ${invoice.amount}`, margin + 8, y + 49);
    doc.text(`Status:      ${invoice.status.toUpperCase()}`, margin + 8, y + 57);

    y += 85;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text('Thank you for choosing Clinq. For billing inquiries, contact support at 1-800-CLINQ-MED.', margin, y);

    doc.save(`receipt-${invoice.id.slice(0, 8)}.pdf`);
  };

  // Calculate pending outstanding amount
  const outstandingAmount = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => {
      const parsed = parseFloat(inv.amount.replace('$', ''));
      return sum + (isNaN(parsed) ? 0 : parsed);
    }, 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'All') return true;
    return inv.status === filter;
  });

  if (isLoading || redirectingToStripe) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#080F18] flex items-center justify-center p-6 text-[#42474F] dark:text-[#A5AAB5]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 border-4 text-[#00355F] dark:text-[#1B6CA8] animate-spin shrink-0" />
          <span className="text-sm font-semibold">
            {redirectingToStripe ? 'Redirecting you securely to Stripe Checkout...' : 'Loading billing account details...'}
          </span>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#080F18] flex items-center justify-center p-6 transition-colors font-sans">
        <div className="bg-white dark:bg-[#121E2C] border border-red-200 dark:border-red-900/30 p-8 rounded-lg shadow-md max-w-md text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold text-[#0D1C2E] dark:text-white">Failed to load billing</h2>
          <p className="text-sm text-[#42474F] dark:text-[#A5AAB5] leading-relaxed">{errorState}</p>
          <button 
            onClick={fetchData} 
            className="px-6 py-2 bg-[#00355F] dark:bg-[#1B6CA8] text-white text-sm font-semibold rounded-md hover:opacity-95 transition-opacity"
          >
            Retry Fetching
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 min-h-screen bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
      
      {/* Developer Test Tools */}
      {/* <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertCircle size={18} />
          <div>
            <p className="text-xs font-bold leading-tight">Developer Testing Tool</p>
            <p className="text-[10px] opacity-80 mt-0.5">Reset patient invoices back to pending to test checkout redirections manually.</p>
          </div>
        </div>
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              const res = await fetch('/api/admin/reset-billing', { method: 'POST' });
              if (!res.ok) throw new Error('Failed to reset billing statuses.');
              await fetchData();
              showModal('success', 'Reset Completed', 'All invoices reset to Pending successfully!');
            } catch (e: any) {
              showModal('error', 'Reset Failed', e.message || 'Error running server DB reset.');
            } finally {
              setIsLoading(false);
            }
          }}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Reset Invoices to Pending
        </button>
      </div> */}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:gap-8 flex-1 min-w-0 w-full">

          {/* Outstanding Balance Hero */}
          <div
            className="relative rounded-lg overflow-hidden bg-[#0F4C81] dark:bg-[#121E2C] border dark:border-[#22354A] transition-colors p-6 md:p-8 lg:py-[52px] lg:px-8"
            style={{ minHeight: 180 }}
          >
            {/* Blur blob */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: 256, height: 256,
                right: -64, bottom: -64,
                background: 'rgba(213,227,252,0.1)',
                filter: 'blur(32px)',
                borderRadius: 12,
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span
                  className="text-white text-xs font-semibold tracking-widest uppercase rounded-full px-3 py-1 w-fit bg-[#D5E3FC]/20 dark:bg-[#1B6CA8]/30 transition-colors"
                  style={{ letterSpacing: '0.6px' }}
                >
                  Outstanding Balance
                </span>
                <div className="mt-1">
                  <p className="text-white font-bold text-[32px] md:text-[40px] leading-[44px] md:leading-[56px] tracking-[-0.96px]">
                    ${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {outstandingAmount > 0 ? (
                    <p className="text-white/80 dark:text-[#A5AAB5] text-sm md:text-base transition-colors pages_font">
                      Due upon billing cycle review
                    </p>
                  ) : (
                    <p className="text-emerald-300 dark:text-emerald-400 text-sm md:text-base font-semibold transition-colors pages_font">
                      Your account is fully paid. Thank you!
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 md:gap-4 items-center">
                {outstandingAmount > 0 ? (
                  <button 
                    onClick={() => initiateStripeCheckoutSession('pay-balance')}
                    className="bg-white dark:bg-[#1B6CA8] hover:bg-[#EFF4FF] dark:hover:bg-[#2582C7] text-[#00355F] dark:text-white font-bold text-sm md:text-base px-5 md:px-8 py-2.5 md:py-3 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Lock size={15} /> Pay Securely via Stripe
                  </button>
                ) : (
                  <div className="text-xs text-white/70 italic flex items-center gap-1.5 bg-black/15 px-3 py-2 rounded-lg">
                    <ShieldCheck size={14} className="text-emerald-400" /> Secure Payments
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none overflow-hidden transition-colors">
            {/* Table Header */}
            <div
              className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#C2C7D1] dark:border-[#22354A] bg-[#EFF4FF]/30 dark:bg-[#1E2D4A]/30 transition-colors"
            >
              <h2 className="text-[#00355F] dark:text-[#5F9EA0] font-semibold text-base md:text-lg transition-colors">Payment History</h2>
              
              {/* Filter controls */}
              <div className="flex items-center gap-1">
                {(['All', 'Paid', 'Pending'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`px-3 py-1 rounded text-xs font-semibold tracking-[0.6px] transition-colors cursor-pointer ${
                      filter === option
                        ? 'bg-[#00355F] text-white dark:bg-[#1B6CA8]'
                        : 'text-[#42474F] dark:text-[#A5AAB5] hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#EFF4FF]/50 dark:bg-[#1E2D4A]/50 text-[#42474F] dark:text-[#A5AAB5] text-xs font-semibold tracking-[0.6px] border-b border-[#C2C7D1] dark:border-[#22354A]">
                    <th className="px-4 md:px-6 py-3">DATE</th>
                    <th className="px-4 md:px-6 py-3">SERVICE</th>
                    <th className="px-4 md:px-6 py-3">AMOUNT</th>
                    <th className="px-4 md:px-6 py-3">STATUS</th>
                    <th className="px-4 md:px-6 py-3">INVOICE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#767F8D]">
                        No invoices found matching current filter context.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((row, i) => (
                      <tr
                        key={row.id || i}
                        className="border-t border-[#C2C7D1] dark:border-[#22354A] first:border-0 hover:bg-[#F8F9FF] dark:hover:bg-[#1E2D4A]/10 transition-colors"
                      >
                        <td className="px-4 md:px-6 py-4 text-[#0D1C2E] dark:text-white text-sm md:text-base">
                          {row.date}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-[#0D1C2E] dark:text-white text-sm md:text-base">
                          {row.service}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-[#0D1C2E] dark:text-white text-sm md:text-base font-semibold">
                          {row.amount}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`text-xs font-bold tracking-[0.6px] px-3 py-1 rounded-full ${
                            row.status === 'Paid' 
                              ? 'bg-[#D4E6E5] dark:bg-[#1E2E2D] text-[#576867] dark:text-[#A3B3B2]' 
                              : 'bg-[#FFDAD6] dark:bg-[#451B1B] text-[#93000A] dark:text-[#FF8989]'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <button
                            onClick={() => downloadReceipt(row)}
                            className="flex items-center gap-1.5 text-[#00355F] dark:text-[#1B6CA8] hover:underline text-xs font-semibold tracking-[0.6px] transition-colors cursor-pointer"
                          >
                            <Download size={13} strokeWidth={2} />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:gap-8 w-full lg:w-[304px] shrink-0 font-sans">

          {/* Insurance */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-5 md:p-6 flex flex-col gap-4 transition-colors font-sans">
            <h2 className="text-[#00355F] dark:text-[#5F9EA0] font-semibold text-lg transition-colors font-sans">Insurance</h2>

            {/* Insurance Info Card */}
            {insurance ? (
              <div
                className="relative rounded-lg overflow-hidden p-6 flex flex-col gap-8 bg-gradient-to-br from-[#00355F] to-[#0F4C81] dark:from-[#1E2D4A] dark:to-[#1E2D4A]/70 border dark:border-[#22354A] min-h-[180px] transition-all"
              >
                {/* Texture overlay */}
                <div className="absolute right-0 top-2 w-32 h-32 opacity-10 pointer-events-none flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full" />
                </div>

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-white text-[10px] font-semibold tracking-[1.2px] uppercase opacity-75">Primary Carrier</p>
                    <p className="text-white font-bold text-base leading-tight mt-1 font-sans">{insurance.carrier}</p>
                  </div>
                  <div className="text-white opacity-40 text-2xl font-bold">✚</div>
                </div>

                <div className="relative z-10 flex gap-4 flex-wrap mt-auto">
                  <div>
                    <p className="text-white text-[10px] font-semibold tracking-[0.6px] opacity-60">Member ID</p>
                    <p className="text-white font-bold text-xs mt-0.5 font-sans">{insurance.member_id}</p>
                  </div>
                  <div>
                    <p className="text-white text-[10px] font-semibold tracking-[0.6px] opacity-60">Group Number</p>
                    <p className="text-white font-bold text-xs mt-0.5 font-sans">{insurance.group_number}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-[#C2C7D1] dark:border-[#22354A] rounded-lg p-6 text-center text-xs text-[#767F8D]">
                No active primary insurance details registered.
              </div>
            )}

            <button 
              onClick={openInsuranceModal}
              className="w-full border border-[#00355F] dark:border-[#1B6CA8] text-[#00355F] dark:text-[#1B6CA8] hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {insurance ? 'Update Card Details' : 'Register Insurance Card'}
            </button>
          </div>

          {/* Billing Support */}
          <div className="bg-[#EFF4FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-5 md:p-6 flex items-center gap-4 transition-colors font-sans">
            <div className="w-10 h-10 bg-[#00355F] dark:bg-[#1B6CA8] rounded-xl flex items-center justify-center shrink-0 transition-colors">
              <svg width="16" height="15" viewBox="0 0 20 18" fill="none">
                <path d="M10 0C4.48 0 0 3.58 0 8c0 2.39 1.19 4.53 3.07 6.01L2 18l3.7-1.85C6.99 16.69 8.45 17 10 17c5.52 0 10-3.58 10-8s-4.48-8-10-8z" fill="white"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[#00355F] dark:text-[#5F9EA0] font-bold text-xs md:text-sm transition-colors">Need Billing Help?</p>
              <p className="text-[#42474F] dark:text-[#A5AAB5] text-[10px] tracking-[0.6px] leading-4 mt-0.5 transition-colors">
                Support is available Mon-Fri, 8am-6pm.
              </p>
              <p className="text-[#00355F] dark:text-[#1B6CA8] font-bold text-xs md:text-sm mt-0.5 transition-colors">1-800-CLINQ-MED</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Insurance Details Modal ── */}
      {isInsuranceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <form 
            onSubmit={handleInsuranceSubmit}
            className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-xl shadow-2xl w-full max-w-[400px] p-6 flex flex-col gap-4 animate-scale-in"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="text-[#00355F] dark:text-[#5F9EA0]" size={18} />
                <h3 className="font-bold text-[#0D1C2E] dark:text-white text-base">Insurance Details</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsInsuranceOpen(false)}
                className="text-[#767F8D] hover:bg-gray-100 dark:hover:bg-white/5 p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {insuranceError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded">
                {insuranceError}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5]">Primary Carrier</label>
              <input
                type="text"
                placeholder="e.g. Blue Cross Blue Shield"
                required
                value={insuranceCarrier}
                onChange={e => { setInsuranceCarrier(e.target.value); setInsuranceError(''); }}
                className="w-full px-3 py-2 border rounded focus:border-[#00355F] dark:focus:border-[#1B6CA8] bg-white dark:bg-[#0D1C2E] text-[#0d1c2e] dark:text-white text-sm outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5]">Member ID</label>
              <input
                type="text"
                placeholder="e.g. ABC123456789"
                required
                value={insuranceMemberId}
                onChange={e => { setInsuranceMemberId(e.target.value); setInsuranceError(''); }}
                className="w-full px-3 py-2 border rounded focus:border-[#00355F] dark:focus:border-[#1B6CA8] bg-white dark:bg-[#0D1C2E] text-[#0d1c2e] dark:text-white text-sm outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#42474F] dark:text-[#A5AAB5]">Group Number</label>
              <input
                type="text"
                placeholder="e.g. GRP90021"
                required
                value={insuranceGroupNumber}
                onChange={e => { setInsuranceGroupNumber(e.target.value); setInsuranceError(''); }}
                className="w-full px-3 py-2 border rounded focus:border-[#00355F] dark:focus:border-[#1B6CA8] bg-white dark:bg-[#0D1C2E] text-[#0d1c2e] dark:text-white text-sm outline-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t mt-2">
              <button 
                type="button"
                onClick={() => setIsInsuranceOpen(false)}
                className="px-4 py-2 border rounded text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isActionPending}
                className="px-5 py-2 bg-[#00355F] dark:bg-[#1B6CA8] hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold rounded transition-all cursor-pointer"
              >
                {isActionPending ? 'Updating...' : 'Save Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Custom Alert / Confirm Modal ── */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-xl shadow-2xl w-full max-w-[400px] p-6 flex flex-col items-center text-center gap-4 animate-scale-in font-sans">
            {modalConfig.type === 'success' && (
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-650 dark:text-emerald-400">
                <ShieldCheck size={28} />
              </div>
            )}
            {modalConfig.type === 'error' && (
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-650 dark:text-red-400">
                <AlertCircle size={28} />
              </div>
            )}
            {(modalConfig.type === 'info' || modalConfig.type === 'confirm') && (
              <div className="w-12 h-12 rounded-full bg-[#EFF4FF] dark:bg-[#1E2D4A]/50 flex items-center justify-center text-[#00355F] dark:text-[#1B6CA8]">
                <AlertCircle size={28} />
              </div>
            )}

            <div className="flex flex-col gap-1 w-full">
              <h3 className="font-bold text-[#0D1C2E] dark:text-white text-base">
                {modalConfig.title}
              </h3>
              <p className="text-xs text-[#42474F] dark:text-[#A5AAB5] leading-relaxed px-2">
                {modalConfig.message}
              </p>
            </div>

            <div className="flex gap-3 justify-center w-full pt-3 border-t dark:border-[#22354A] mt-2">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border rounded text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer w-24"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (modalConfig.onConfirm) {
                        modalConfig.onConfirm();
                      }
                      closeModal();
                    }}
                    className="px-4 py-2 bg-[#BA1A1A] hover:bg-red-700 text-white text-xs font-semibold rounded transition-all cursor-pointer w-24 border-none"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-[#00355F] dark:bg-[#1B6CA8] hover:opacity-95 text-white text-xs font-semibold rounded transition-all cursor-pointer min-w-28 border-none"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
