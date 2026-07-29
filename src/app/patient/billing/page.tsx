'use client';

import { Download, Plus, Filter, CreditCard, Building2 } from 'lucide-react';

const payments = [
  { date: 'Oct 12, 2023', service: 'General Consultation', amount: '$150.00', status: 'Paid', statusColor: 'bg-[#D4E6E5] dark:bg-[#1E2E2D] text-[#576867] dark:text-[#A3B3B2] transition-colors' },
  { date: 'Sep 28, 2023', service: 'Radiology - MRI Scan', amount: '$840.50', status: 'Pending', statusColor: 'bg-[#FFDAD6] dark:bg-[#451B1B] text-[#93000A] dark:text-[#FF8989] transition-colors' },
  { date: 'Aug 15, 2023', service: 'Lab Work - Blood Panel', amount: '$250.00', status: 'Paid', statusColor: 'bg-[#D4E6E5] dark:bg-[#1E2E2D] text-[#576867] dark:text-[#A3B3B2] transition-colors' },
];

export default function BillingPage() {
  return (
    <div className="p-4 md:p-6 min-h-screen bg-[#F8F9FF] dark:bg-[#080F18] font-[Manrope,sans-serif] text-[#42474F] dark:text-[#A5AAB5] transition-colors duration-300">
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
                  <p className="text-white font-bold text-[32px] md:text-[40px] leading-[44px] md:leading-[56px] tracking-[-0.96px]">$1,240.50</p>
                  <p className="text-white dark:text-[#A5AAB5] text-sm md:text-base transition-colors pages_font">Next due date: October 24, 2023</p>
                </div>
              </div>
              <div className="flex gap-3 md:gap-4 items-center">
                <button className="bg-white dark:bg-[#1B6CA8] hover:bg-[#EFF4FF] dark:hover:bg-[#2582C7] text-[#00355F] dark:text-white font-bold text-sm md:text-base px-5 md:px-8 py-2.5 md:py-3 rounded-xl transition-colors cursor-pointer">
                  Pay Now
                </button>
                <button className="border border-white dark:border-[#22354A] text-white dark:text-[#A5AAB5] hover:bg-white/10 dark:hover:bg-white/5 font-bold text-sm md:text-base px-5 md:px-8 py-2.5 md:py-3 rounded-xl transition-colors cursor-pointer">
                  View Plan
                </button>
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
              <button className="flex items-center gap-1 text-[#00355F] dark:text-[#5F9EA0] text-xs font-semibold tracking-[0.6px] transition-colors cursor-pointer">
                <Filter size={13} strokeWidth={2} />
                Filter
              </button>
            </div>

            {/* Scrollable table wrapper */}
            <div className="overflow-x-auto">
              {/* Column Headers */}
              <div className="w-full bg-[#EFF4FF]/50 dark:bg-[#1E2D4A]/50 transition-colors min-w-[600px]">
                <div className="grid grid-cols-5 text-[#42474F] dark:text-[#A5AAB5] text-xs font-semibold tracking-[0.6px] transition-colors">
                  <div className="px-4 md:px-6 py-3">DATE</div>
                  <div className="px-4 md:px-6 py-3">SERVICE</div>
                  <div className="px-4 md:px-6 py-3">AMOUNT</div>
                  <div className="px-4 md:px-6 py-3">STATUS</div>
                  <div className="px-4 md:px-6 py-3">INVOICE</div>
                </div>
              </div>

              {/* Rows */}
              <div className="min-w-[600px]">
                {payments.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-5 items-center border-t border-[#C2C7D1] dark:border-[#22354A] first:border-t-0 transition-colors"
                  >
                    <div className="px-4 md:px-6 py-4 text-[#0D1C2E] dark:text-white text-sm md:text-base transition-colors">{row.date}</div>
                    <div className="px-4 md:px-6 py-4 text-[#0D1C2E] dark:text-white text-sm md:text-base transition-colors">{row.service}</div>
                    <div className="px-4 md:px-6 py-4 text-[#0D1C2E] dark:text-white text-sm md:text-base transition-colors">{row.amount}</div>
                    <div className="px-4 md:px-6 py-4">
                      <span className={`text-xs font-bold tracking-[0.6px] px-3 py-1 rounded-full ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </div>
                    <div className="px-4 md:px-6 py-4">
                      <button className="flex items-center gap-1 text-[#00355F] dark:text-[#1B6CA8] text-xs font-semibold tracking-[0.6px] transition-colors cursor-pointer">
                        <Download size={13} strokeWidth={2} />
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex justify-center items-center py-4 border-t border-[#C2C7D1] dark:border-[#22354A] bg-[#EFF4FF]/30 dark:bg-[#1E2D4A]/30 transition-colors"
            >
              <button className="text-[#00355F] dark:text-[#1B6CA8] text-xs font-semibold tracking-[0.6px] transition-colors cursor-pointer">
                View All History
              </button>
            </div>
          </div>
        </div>


        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:gap-8 w-full lg:w-[304px] shrink-0">

          {/* Payment Methods */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-5 md:p-6 flex flex-col gap-5 md:gap-6 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-[#00355F] dark:text-[#5F9EA0] font-semibold text-lg transition-colors font-sans">Payment Methods</h2>
              <button className="text-[#00355F] dark:text-[#5F9EA0] transition-colors cursor-pointer">
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {/* Visa Card */}
              <div className="border border-[#C2C7D1] dark:border-[#22354A] rounded-lg p-4 flex items-center gap-4 transition-colors">
                <div className="w-12 h-8 rounded-sm flex items-center justify-center bg-gray-500/10 dark:bg-gray-400/10">
                  <CreditCard size={20} className="text-[#42474F] dark:text-[#A5AAB5] transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-[#0D1C2E] dark:text-white font-bold text-sm md:text-base leading-6 transition-colors font-sans truncate">Visa ending in 4242</p>
                  <p className="text-[#42474F] dark:text-[#A5AAB5] text-xs font-semibold tracking-[0.6px] transition-colors">Expires 12/25</p>
                </div>
              </div>
              {/* Chase Checking */}
              <div
                className="border border-[#C2C7D1] dark:border-[#22354A] rounded-lg p-4 flex items-center gap-4 bg-[#EFF4FF]/20 dark:bg-[#1E2D4A]/20 transition-colors"
              >
                <div className="w-12 h-8 rounded-sm flex items-center justify-center bg-gray-500/10 dark:bg-gray-400/10">
                  <Building2 size={20} className="text-[#42474F] dark:text-[#A5AAB5] transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-[#0D1C2E] dark:text-white font-bold text-sm md:text-base leading-6 transition-colors font-sans truncate">Chase Checking</p>
                  <p className="text-[#42474F] dark:text-[#A5AAB5] text-xs font-semibold tracking-[0.6px] transition-colors">Ending in 9876</p>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-5 md:p-6 flex flex-col gap-4 transition-colors">
            <h2 className="text-[#00355F] dark:text-[#5F9EA0] font-semibold text-xl md:text-2xl transition-colors font-sans">Insurance</h2>

            {/* Digital Insurance Card */}
            <div
              className="relative rounded-lg overflow-hidden p-6 md:p-8 flex flex-col gap-8 md:gap-10 bg-gradient-to-br from-[#00355F] to-[#0F4C81] dark:from-[#1E2D4A] dark:to-[#1E2D4A]/70 border dark:border-[#22354A] min-h-[220px] md:min-h-[248px] transition-colors"
            >
              {/* Texture overlay */}
              <div className="absolute right-0 top-2 w-32 h-32 opacity-10 pointer-events-none flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full" />
              </div>

              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-white text-xs font-semibold tracking-[1.2px] uppercase opacity-70">Primary Carrier</p>
                  <p className="text-white font-bold text-base md:text-lg leading-7 md:leading-8 mt-1 font-sans">Blue Cross<br />Blue Shield</p>
                </div>
                <div className="text-white opacity-30 text-2xl md:text-3xl font-bold">✚</div>
              </div>

              <div className="relative z-10 flex gap-4 flex-wrap">
                <div>
                  <p className="text-white text-xs font-semibold tracking-[0.6px] opacity-60">Member ID</p>
                  <p className="text-white font-bold text-sm md:text-base leading-6 mt-1 font-sans">ABC123456789</p>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold tracking-[0.6px] opacity-60">Group Number</p>
                  <p className="text-white font-bold text-sm md:text-base leading-6 mt-1 font-sans">GRP90021</p>
                </div>
              </div>
            </div>

            <button className="w-full border border-[#00355F] dark:border-[#1B6CA8] text-[#00355F] dark:text-[#1B6CA8] hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm md:text-base py-2.5 md:py-3 rounded-xl transition-all cursor-pointer">
              Upload New Card
            </button>
            <p className="text-[#42474F] dark:text-[#A5AAB5] text-xs font-semibold tracking-[0.6px] text-center transition-colors">Updated Oct 01, 2023</p>
          </div>

          {/* Billing Support */}
          <div className="bg-[#EFF4FF] dark:bg-[#121E2C] border border-[#C2C7D1] dark:border-[#22354A] rounded-lg shadow-[0_4px_20px_rgba(15,76,129,0.04)] dark:shadow-none p-5 md:p-6 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 bg-[#00355F] dark:bg-[#1B6CA8] rounded-xl flex items-center justify-center shrink-0 transition-colors">
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                <path d="M10 0C4.48 0 0 3.58 0 8c0 2.39 1.19 4.53 3.07 6.01L2 18l3.7-1.85C6.99 16.69 8.45 17 10 17c5.52 0 10-3.58 10-8s-4.48-8-10-8z" fill="white"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[#00355F] dark:text-[#5F9EA0] font-bold text-sm md:text-base transition-colors">Need Billing Help?</p>
              <p className="text-[#42474F] dark:text-[#A5AAB5] text-xs font-semibold tracking-[0.6px] leading-4 mt-1 transition-colors">
                Our concierge billing team is available Mon-Fri, 8am-6pm.
              </p>
              <p className="text-[#00355F] dark:text-[#1B6CA8] font-bold text-sm md:text-base mt-1 transition-colors">1-800-CLINQ-MED</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
