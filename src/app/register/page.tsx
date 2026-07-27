'use client';

import React, { useState } from 'react';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidation()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF4FF] flex flex-col justify-center items-center py-20 px-4 font-sans antialiased text-[#42474F]">
      
      {/* Main Registration Card */}
      <div className="w-full max-w-[520px] bg-white border border-[#C2C7D1] shadow-lg rounded-lg p-8 md:p-12 flex flex-col gap-10">
        
        {/* Brand Identity / Header */}
        <div className="flex flex-col items-center text-center w-full">
          <Link href="/" className="mb-4">
            <span className="text-3xl font-[800] text-brand-blue tracking-[-0.6px] select-none">
              Clinq
            </span>
          </Link>
          
          <h1 className="text-xl md:text-2xl font-[600] text-[#0D1C2E] tracking-tight">
            Create your account
          </h1>
          <p className="text-xs md:text-sm text-[#42474F] mt-2">
            Internal Operating System for Clinq Medical Systems.
          </p>
        </div>

        {isSubmitted ? (
          <div className="flex flex-col items-center text-center py-8 gap-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-brand-blue">Registration Successful!</h2>
            <p className="text-sm text-[#42474F] max-w-sm">
              Your clinician profile is pending credential verification. We will send an email details checklist shortly.
            </p>
            <Link 
              href="/login" 
              className="mt-6 px-8 py-3 bg-brand-blue hover:bg-brand-blue/95 text-white font-semibold text-xs tracking-wider uppercase rounded-md shadow-sm transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            
            {/* Input Full Name */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#727780] pointer-events-none">
                  <User className="w-[13.33px] h-[13.33px]" />
                </span>
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Dr. Jane Smith"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full h-[50px] pl-12 pr-4 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
                    errors.fullName ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#C2C7D1] focus:ring-1 focus:ring-brand-blue'
                  }`}
                />
              </div>
              {errors.fullName && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.fullName}
                </span>
              )}
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              
              {/* Email */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#727780] pointer-events-none">
                    <Mail className="w-[16.67px] h-[13.33px]" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@clinic.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full h-[50px] pl-12 pr-4 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
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

              {/* Phone Number */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#727780] pointer-events-none">
                    <Phone className="w-[15px] h-[15px]" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full h-[50px] pl-12 pr-4 bg-white border rounded-[4px] text-base text-brand-dark focus:outline-none transition ${
                      errors.phone ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#C2C7D1] focus:ring-1 focus:ring-brand-blue'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <span className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </span>
                )}
              </div>

            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-[600] uppercase text-[#42474F] tracking-[0.6px] select-none">
                Password
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
                Minimum 8 characters with at least one number.
              </span>
              {errors.password && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
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

            {/* Agree to terms Checkbox */}
            <div className="flex flex-col gap-1 w-full">
              <label className="flex items-start gap-3 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-brand-blue border-[#C2C7D1] rounded focus:ring-brand-blue"
                />
                <span className="text-sm text-[#42474F] leading-tight">
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
              {errors.agreeToTerms && (
                <span className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.agreeToTerms}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue/95 text-white font-[600] text-xs uppercase tracking-[0.6px] rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
            >
              <span>Submit Registration</span>
              <ArrowRight className="w-3 h-3 text-white" />
            </button>

          </form>
        )}

        {/* Separator / Redirect */}
        <div className="w-full border-t border-[#C2C7D1] pt-6 flex justify-center text-center">
          <p className="text-sm text-[#42474F] flex items-center gap-1.5 justify-center">
            <span>Already have an account?</span>
            <Link href="/login" className="font-[600] text-brand-blue hover:underline">
              Log in
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
