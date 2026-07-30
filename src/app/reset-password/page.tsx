'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleValidation = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (handleValidation()) {
      setIsLoading(true);

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password: formData.password
        });

        if (updateError) {
          setError(updateError.message);
        } else {
          setMessage('Password recovery successful! Your password has been updated.');
          setTimeout(() => {
            // Sign out the user to force them to sign in with their new credentials
            supabase.auth.signOut().then(() => {
              router.push('/login');
            });
          }, 3000);
        }
      } catch (err: any) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF4FF] flex flex-col justify-center items-center py-10 px-4 font-sans antialiased text-[#42474F] relative overflow-hidden">
      
      {/* Background Atmospheric Blurs */}
      <div className="absolute w-[512px] h-[409px] left-[-128px] top-[-102px] bg-[#D2E4FF] opacity-20 blur-[60px] rounded-full pointer-events-none z-0" />
      <div className="absolute w-[512px] h-[409px] right-[-128px] bottom-[-102px] bg-[#D5E3FC] opacity-30 blur-[60px] rounded-full pointer-events-none z-0" />

      {/* Reset Card Container */}
      <div className="w-full max-w-[448px] bg-white border border-[#C2C7D1] shadow-lg rounded-lg p-8 md:p-10 flex flex-col gap-6 relative z-10">
        
        {/* Brand Header */}
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
            Create new password
          </h2>
          <p className="text-sm text-[#42474F] leading-6">
            Please enter your new password below.
          </p>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-[600] mb-0.5">Success</p>
              <p className="text-xs leading-relaxed">{message}</p>
              <p className="text-xs font-[600] text-emerald-800 mt-2 animate-pulse">Redirecting to Sign In...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            
            {/* Password Input */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#727780] pointer-events-none">
                  <Lock className="w-[13.33px] h-[17.5px]" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-[50px] pl-12 pr-12 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
                    errors.password ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#C2C7D1] focus:ring-1 focus:ring-brand-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#727780] hover:text-brand-dark focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-[18.33px] h-[12.5px]" /> : <Eye className="w-[18.33px] h-[12.5px]" />}
                </button>
              </div>
              <span className="text-[11px] text-[#727780] leading-tight select-none">
                Minimum 6 characters with at least one number.
              </span>
              {errors.password && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#727780] pointer-events-none">
                  <Lock className="w-[16.67px] h-[16.67px]" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full h-[50px] pl-12 pr-4 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
                    errors.confirmPassword ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#C2C7D1] focus:ring-1 focus:ring-brand-blue'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue/95 disabled:bg-brand-blue/70 text-white font-[600] text-xs uppercase tracking-[0.6px] rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
            >
              <span>{isLoading ? 'Resetting Password...' : 'Reset Password'}</span>
              {!isLoading && <ArrowRight className="w-3 h-3 text-white" />}
            </button>

          </form>
        )}

      </div>
      
    </div>
  );
}
