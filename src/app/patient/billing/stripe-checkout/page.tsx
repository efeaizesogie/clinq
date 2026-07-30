'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, Globe, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

// Luhn validation algorithm for secure card validation
function validateCardNumber(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function detectCardBrand(num: string): string {
  const clean = num.replace(/\D/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Credit Card';
}

function StripeSandboxContent() {
  const searchParams = useSearchParams();
  const actionType = searchParams.get('actionType') || 'add-card';
  const amountStr = searchParams.get('amount') || '0.00';
  const amount = parseFloat(amountStr);

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = e.target.value.replace(/\D/g, '');
    if (clean.length > 16) clean = clean.slice(0, 16);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
    setCardError('');
  };

  // Format Expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = e.target.value.replace(/\D/g, '');
    if (clean.length > 4) clean = clean.slice(0, 4);
    if (clean.length > 2) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiry(clean);
    }
    setCardError('');
  };

  const handleCancel = () => {
    window.location.href = `/patient/billing?stripe_status=cancel`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError('');

    if (!cardHolder.trim()) {
      setCardError('Card holder name is required.');
      return;
    }

    const rawCardNum = cardNumber.replace(/\s/g, '');
    if (!validateCardNumber(rawCardNum)) {
      setCardError('Invalid card number. Luhn checklist validation failed.');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setCardError('Expiry must match MM/YY format.');
      return;
    }

    const [month, year] = expiry.split('/').map(Number);
    const now = new Date();
    const currentYearShort = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (month < 1 || month > 12) {
      setCardError('Invalid expiry month.');
      return;
    }
    if (year < currentYearShort || (year === currentYearShort && month < currentMonth)) {
      setCardError('Card has expired.');
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      setCardError('CVC is invalid.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSucceeded(true);
      
      const brand = detectCardBrand(rawCardNum);
      const last4 = rawCardNum.slice(-4);
      setTimeout(() => {
        // Redirect back with successful parameters
        window.location.href = `/patient/billing?stripe_status=success&session_id=mock_sandbox_session_${Date.now()}&action=${actionType}&card_brand=${brand}&last_four=${last4}&expiration=${expiry}`;
      }, 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#080C14] flex flex-col font-sans overflow-y-auto">
      
      {/* Mock Browser URL Bar */}
      <div className="w-full bg-[#E5E9F0] dark:bg-[#151E2B] border-b border-[#D2D6DC] dark:border-[#22354A] py-2.5 px-4 flex items-center gap-3 shrink-0">
        <button 
          onClick={handleCancel}
          className="flex items-center gap-1 text-[#657380] hover:text-[#0D1C2E] dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Cancel
        </button>
        
        <div className="flex-1 max-w-[640px] mx-auto bg-white dark:bg-[#0D1826] border border-[#CBD5E0] dark:border-[#2A3E56] rounded-md py-1 px-3 flex items-center justify-between text-xs text-gray-500 select-none">
          <div className="flex items-center gap-2 truncate">
            <Lock size={12} className="text-[#22C55E]" />
            <span className="text-[#22C55E] font-semibold">https://</span>
            <span className="text-slate-700 dark:text-zinc-300 font-medium select-all">checkout.stripe.com/pay/cs_test_clinq_secure_sandbox</span>
          </div>
          <Globe size={12} className="opacity-40" />
        </div>
        <div className="w-16 shrink-0" />
      </div>

      {/* Main Sandbox Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1000px] w-full mx-auto p-6 md:p-12 gap-8 md:gap-16">
        
        {/* Left Drawer: Outstanding details */}
        <div className="flex-1 flex flex-col gap-6 md:border-r md:pr-16 border-[#D2D6DC] dark:border-[#22354A]">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#00355F] flex items-center justify-center text-white font-bold text-sm tracking-widest shrink-0">
              CQ
            </div>
            <h2 className="text-[#323D47] dark:text-white font-bold text-lg">Clinq Medical Center (Sandbox)</h2>
          </div>

          {succeeded ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4 animate-scale-in">
              <CheckCircle2 className="w-16 h-16 text-[#22C55E]" />
              <h3 className="text-xl font-bold text-[#0D1C2E] dark:text-white font-sans">Payment Authorized</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                Authentication check passed. Syncing transaction events with Clinq records...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {actionType === 'pay-balance' ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.8px] text-gray-500">Invoice Total Due</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#0D1C2E] dark:text-white font-bold text-[34px] md:text-[42px] leading-tight">
                      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">USD</span>
                  </div>
                  <div className="border-t border-[#D2D6DC] dark:border-[#22354A] pt-4 flex flex-col gap-2.5">
                    <p className="text-xs font-semibold text-[#0D1C2E] dark:text-white flex justify-between">
                      <span>Clinical Consultation Outstanding Fees</span>
                      <span>${amount.toFixed(2)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.8px] text-gray-500">Secure Pre-Authorization</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#0D1C2E] dark:text-white font-bold text-[34px] md:text-[42px] leading-tight">$0.00</span>
                    <span className="text-sm font-semibold text-gray-400">USD</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border rounded-lg">
                    Link Card pre-auth completes a $0.00 pre-token transaction to confirm card active state.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Drawer: Manual Card form inputs */}
        {!succeeded && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5 max-w-[420px] justify-center">
            <h3 className="font-bold text-[#0D1C2E] dark:text-white text-base">Test Payment Checkout</h3>

            {cardError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 text-xs rounded flex items-center gap-2 animate-shake">
                <AlertCircle size={14} className="shrink-0" />
                <span>{cardError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.5px]">Email Address</label>
              <input
                type="email"
                defaultValue="patient@clinq.med"
                disabled
                className="w-full px-3 py-2.5 border border-[#CBD5E0] dark:border-[#2A3E56] rounded-md bg-gray-50 dark:bg-[#0D1826]/50 text-gray-500 text-sm opacity-80 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.5px]">Card Details</label>
              <div className="border border-[#CBD5E0] dark:border-[#2A3E56] rounded-md bg-white dark:bg-[#0D1826] overflow-hidden flex flex-col">
                <div className="relative border-b border-[#E2E8F0] dark:border-[#2A3E56]">
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full pl-3 pr-16 py-2.5 bg-transparent text-slate-800 dark:text-white text-sm outline-none font-mono placeholder:text-gray-455"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 select-none">
                    {detectCardBrand(cardNumber)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    required
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full px-3 py-2.5 border-r border-[#E2E8F0] dark:border-[#2A3E56] bg-transparent text-slate-800 dark:text-white text-sm outline-none font-mono placeholder:text-gray-455"
                  />
                  <input
                    type="password"
                    placeholder="CVC"
                    maxLength={4}
                    required
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 bg-transparent text-slate-800 dark:text-white text-sm outline-none font-mono tracking-widest placeholder:text-gray-455"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.5px]">Card Holder Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                required
                value={cardHolder}
                onChange={e => setCardHolder(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#CBD5E0] dark:border-[#2A3E56] rounded-md bg-white dark:bg-[#0D1826] text-slate-800 dark:text-white text-sm outline-none placeholder:text-gray-455"
              />
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#635BFF] hover:bg-[#5b52e6] disabled:bg-[#cbd5e0] text-white font-semibold text-sm rounded-md shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Authorization Processing...
                </>
              ) : actionType === 'pay-balance' ? (
                `Pay $${amount.toFixed(2)}`
              ) : (
                'Link Secure Card'
              )}
            </button>

            <div className="text-[11px] text-center text-gray-400 flex items-center justify-center gap-1.5 mt-2 select-none">
              <Lock size={11} className="text-[#22C55E]" /> Powered by Stripe | Secure PCI Compliance
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default function StripeSandboxPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs">
        Loading test payment page...
      </div>
    }>
      <StripeSandboxContent />
    </Suspense>
  );
}
