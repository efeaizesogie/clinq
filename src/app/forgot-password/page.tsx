'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('A password reset link has been sent to your email address.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF4FF] flex flex-col justify-center items-center py-10 px-4 font-sans antialiased text-[#42474F] relative overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute w-[512px] h-[409px] left-[-128px] top-[-102px] bg-[#D2E4FF] opacity-20 blur-[60px] rounded-full pointer-events-none z-0" />
      <div className="absolute w-[512px] h-[409px] right-[-128px] bottom-[-102px] bg-[#D5E3FC] opacity-30 blur-[60px] rounded-full pointer-events-none z-0" />

      {/* Forgot Password Card */}
      <div className="w-full max-w-[448px] bg-white border border-[#C2C7D1] shadow-lg rounded-lg p-8 md:p-10 flex flex-col gap-6 relative z-10">
        
        {/* Brand / Header */}
        <div className="flex flex-col items-center text-center w-full">
          <Link href="/" className="mb-2">
            <span className="text-3xl font-[800] text-brand-blue tracking-[-0.6px] select-none">
              Clinq
            </span>
          </Link>
        </div>

        {/* Informational Text */}
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-xl md:text-2xl font-[600] text-[#0D1C2E] tracking-tight">
            Forgot password?
          </h2>
          <p className="text-sm text-[#42474F] leading-6">
            No worries! Enter your email below and we will send you a link to reset your password.
          </p>
        </div>

        {/* Feedback Alert Messages */}
        {message ? (
          <div className="flex flex-col gap-4 w-full">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-[600] mb-1">Check your inbox</p>
                <p className="text-xs leading-relaxed">{message}</p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full h-11 bg-brand-blue hover:bg-brand-blue/95 text-white font-[600] text-xs uppercase tracking-[0.6px] rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
            >
              <span>Return to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            
            {/* Email Input */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@clinq.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full h-[50px] px-4 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
                    error ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#C2C7D1] focus:ring-1 focus:ring-brand-blue'
                  }`}
                />
              </div>
              {error && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue/95 disabled:bg-brand-blue/70 text-white font-[600] text-xs uppercase tracking-[0.6px] rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
            >
              <span>{isLoading ? 'Sending link...' : 'Send reset link'}</span>
              {!isLoading && <ArrowRight className="w-3 h-3 text-white" />}
            </button>

          </form>
        )}

        {/* Footer Link */}
        {!message && (
          <div className="border-t border-[#C2C7D1] pt-4 text-center mt-2">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 text-xs font-[600] uppercase text-brand-blue tracking-[0.6px] hover:underline"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Login</span>
            </Link>
          </div>
        )}

      </div>
      
    </div>
  );
}
