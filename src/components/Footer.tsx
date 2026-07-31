import React from 'react';
import { Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 border-t border-[#E2E4DC] mt-12 bg-white/40">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-body">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#1A3B2B]" />
          <span>All data stored locally in your browser. Never uploaded to external databases.</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold text-stone-700 font-display">Personal CFO Wealth Engine v1.0</span>
          <span>•</span>
          <span>INR (₹) Format</span>
        </div>
      </div>
    </footer>
  );
};
