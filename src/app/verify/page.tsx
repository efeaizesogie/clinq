'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const isFromLogin = searchParams.get('unverified') === 'true';

  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Manage countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check auth state on load
  useEffect(() => {
    const supabase = createClient();
    
    // Set up check interval to automatically take them in
    const checkInterval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        clearInterval(checkInterval);
        const role = user.user_metadata?.role || 'patient';
        router.push(role === 'admin' || role === 'clinician' ? '/admin' : '/patient');
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [router]);

  const handleResend = async () => {
    if (!email) {
      setError('No email address provided.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setMessage('Verification email resent successfully! Please check your inbox.');
        setCountdown(60); // 60s cooldown
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setError('');
    setMessage('');

    try {
      const supabase = createClient();
      // First refresh context
      await supabase.auth.refreshSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
      } else if (user?.email_confirmed_at) {
        setMessage('Email verified! Redirecting...');
        const role = user.user_metadata?.role || 'patient';
        setTimeout(() => {
          router.push(role === 'admin' || role === 'clinician' ? '/admin' : '/patient');
        }, 1500);
      } else {
        setError('Verification link has not been clicked yet. Please check your inbox. If you did not receive it, try resending.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF4FF] flex flex-col justify-center items-center py-10 px-4 font-sans antialiased text-[#42474F] relative overflow-hidden">
      
      {/* Background Atmospheric Blurs */}
      <div className="absolute w-[512px] h-[409px] left-[-128px] top-[-102px] bg-[#D2E4FF] opacity-20 blur-[60px] rounded-full pointer-events-none z-0" />
      <div className="absolute w-[512px] h-[409px] right-[-128px] bottom-[-102px] bg-[#D5E3FC] opacity-30 blur-[60px] rounded-full pointer-events-none z-0" />

      {/* Verification Card */}
      <div className="w-full max-w-[460px] bg-white border border-[#C2C7D1] shadow-lg rounded-lg p-8 md:p-10 flex flex-col gap-6 relative z-10">
        
        {/* Brand/Header */}
        <div className="flex flex-col items-center text-center w-full">
          <Link href="/" className="mb-2">
            <span className="text-3xl font-[800] text-brand-blue tracking-[-0.6px] select-none">
              Clinq
            </span>
          </Link>
        </div>

        {/* Status Indicator Icon */}
        <div className="flex justify-center my-2">
          <div className="w-16 h-16 rounded-full bg-[#E6EEFF] flex items-center justify-center text-brand-blue animate-pulse">
            <Mail className="w-8 h-8" />
          </div>
        </div>

        {/* Informational Text */}
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-xl md:text-2xl font-[600] text-[#0D1C2E] tracking-tight">
            Confirm your email
          </h2>
          <p className="text-sm text-[#42474F] leading-relaxed">
            {isFromLogin 
              ? 'Your email address needs to be verified before you can access your dashboard.'
              : 'Thank you for signing up! We\'ve sent a code or link to confirm your registration.'}
          </p>
          {email && (
            <div className="bg-[#E6EEFF] py-2.5 px-4 rounded border border-[#C2C7D1] font-mono text-xs text-brand-blue break-all">
              {email}
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full h-11 bg-brand-blue hover:bg-brand-blue/95 disabled:bg-brand-blue/70 text-white font-[600] text-xs uppercase tracking-[0.6px] rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Status...</span>
              </>
            ) : (
              <span>I have verified my email</span>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
            className="w-full h-11 bg-white hover:bg-slate-50 disabled:bg-slate-50 border border-[#C2C7D1] text-[#42474F] font-[600] text-xs uppercase tracking-[0.6px] rounded flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <span>
              {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend Verification Email'}
            </span>
          </button>
        </div>

        {/* Back Link */}
        <div className="border-t border-[#C2C7D1] pt-4 text-center mt-2">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-1.5 text-xs font-[600] uppercase text-brand-blue tracking-[0.6px] hover:underline"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
      
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EFF4FF] flex flex-col justify-center items-center font-sans antialiased text-[#42474F]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
          <span className="text-sm font-[600]">Loading verification portal...</span>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
