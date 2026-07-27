'use client';

import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

type LoginRole = 'clinician' | 'patient';

export default function LoginPage() {
  const [role, setRole] = useState<LoginRole>('clinician');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation error when typing
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidation()) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF4FF] flex flex-col justify-center items-center py-10 px-4 font-sans antialiased text-[#42474F] relative overflow-hidden">
      
      {/* Background Atmospheric Blur Circle Left-Top */}
      <div className="absolute w-[512px] h-[409px] left-[-128px] top-[-102px] bg-[#D2E4FF] opacity-20 blur-[60px] rounded-full pointer-events-none z-0" />
      
      {/* Background Atmospheric Blur Circle Right-Bottom */}
      <div className="absolute w-[512px] h-[409px] right-[-128px] bottom-[-102px] bg-[#D5E3FC] opacity-30 blur-[60px] rounded-full pointer-events-none z-0" />

      {/* Main Login Card Container */}
      <div className="w-full max-w-[448px] bg-white border border-[#C2C7D1] shadow-lg rounded-lg p-8 md:p-10 flex flex-col gap-8 relative z-10 min-h-[664px]">
        
        {/* Brand Identity / Header */}
        <div className="flex flex-col items-center text-center w-full">
          <Link href="/" className="mb-4">
            <span className="text-3xl font-[800] text-brand-blue tracking-[-0.6px] select-none">
              Clinq
            </span>
          </Link>
        </div>

        {/* Welcome Header Info */}
        <div className="flex flex-col gap-2 w-full text-left">
          <h2 className="text-xl md:text-2xl font-[600] text-[#0D1C2E] tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-[#42474F] leading-6">
            Please enter your credentials to access your dashboard.
          </p>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-12 gap-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-brand-blue">Login Successful!</h2>
            <p className="text-sm text-[#42474F] max-w-xs">
              Redirecting you to the Clinq {role === 'clinician' ? 'Clinical Systems OS' : 'Patient Care Portal'}...
            </p>
            <Link 
              href={role === 'clinician' ? '/admin' : '/patient'} 
              className="mt-6 px-10 py-3 bg-brand-blue hover:bg-brand-blue/95 text-white font-semibold text-xs tracking-wider uppercase rounded-md shadow-sm transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            
            {/* Practitioner/Clinician vs Patient Toggle tab switcher */}
            <div className="flex bg-[#E6EEFF] border border-[#C2C7D1] rounded-lg p-1 w-full h-[42px] relative items-center justify-between">
              <button
                type="button"
                onClick={() => setRole('clinician')}
                className={`flex-1 h-8 rounded-[4px] text-xs font-[600] tracking-[0.6px] uppercase flex items-center justify-center transition cursor-pointer select-none ${
                  role === 'clinician' 
                    ? 'bg-white text-brand-blue shadow-xs' 
                    : 'text-[#42474F] hover:text-brand-blue'
                }`}
              >
                Clinician
              </button>
              
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 h-8 rounded-[4px] text-xs font-[600] tracking-[0.6px] uppercase flex items-center justify-center transition cursor-pointer select-none ${
                  role === 'patient' 
                    ? 'bg-white text-brand-blue shadow-xs' 
                    : 'text-[#42474F] hover:text-brand-blue'
                }`}
              >
                Patient
              </button>
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder={role === 'clinician' ? 'dr.smith@clinq.com' : 'patient@client.com'}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full h-[50px] px-4 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
                    errors.email ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#C2C7D1] focus:ring-1 focus:ring-brand-blue'
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </span>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center w-full select-none">
                <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-[50px] pl-4 pr-12 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
                    errors.password ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#C2C7D1] focus:ring-1 focus:ring-brand-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#42474F] hover:text-brand-dark focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-[18.33px] h-[12.5px]" /> : <Eye className="w-[18.33px] h-[12.5px]" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </span>
              )}
            </div>

            {/* Utilities Row (Remember me & Forgot Password) */}
            <div className="flex items-center justify-between w-full h-5 mt-1 select-none">
              
              {/* Remember me Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-brand-blue border-[#C2C7D1] rounded focus:ring-brand-blue"
                />
                <span className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px]">
                  Remember me
                </span>
              </label>

              {/* Forgot link */}
              <Link 
                href="/forgot-password" 
                className="text-xs font-[600] uppercase text-brand-blue tracking-[0.6px] hover:underline"
              >
                Forgot password?
              </Link>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue/95 text-white font-[600] text-xs uppercase tracking-[0.6px] rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
            >
              <span>Log In</span>
              <ArrowRight className="w-3 h-3 text-white" />
            </button>

          </form>
        )}

        {/* Separator / Signup Redirect */}
        <div className="w-full border-t border-[#C2C7D1] pt-6 flex justify-center text-center mt-auto">
          <p className="text-sm text-[#42474F] flex items-center gap-1.5 justify-center">
            <span>Don't have an account?</span>
            <Link href="/register" className="font-[600] text-brand-blue hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
