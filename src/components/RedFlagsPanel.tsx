import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { RedFlagAlert } from '../types/financial';

interface RedFlagsPanelProps {
  redFlags: RedFlagAlert[];
}

export const RedFlagsPanel: React.FC<RedFlagsPanelProps> = ({ redFlags }) => {
  return (
    <div 
      className="bg-white rounded-2xl border border-[#E2E4DC] p-6 sm:p-8 hover-lift shadow-xs"
      data-testid="red-flags-panel"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E2E4DC]">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${redFlags.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {redFlags.length > 0 ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-[#1C2826] m-0">Red Flag Detection System</h3>
            <p className="text-xs text-stone-500 font-body">Automated rule-based diagnostic triggers</p>
          </div>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          redFlags.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {redFlags.length === 0 ? 'All Clear' : `${redFlags.length} Alert${redFlags.length === 1 ? '' : 's'} Active`}
        </span>
      </div>

      {redFlags.length === 0 ? (
        <div className="p-6 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center gap-4 text-emerald-900">
          <ShieldCheck className="w-8 h-8 text-emerald-700 shrink-0" />
          <div>
            <h4 className="text-sm font-bold font-display">No Financial Red Flags Detected!</h4>
            <p className="text-xs text-emerald-800 font-body mt-0.5">
              Your cash flow burn rate, debt exposure, emergency buffer, and asset growth ratio pass all safety rules.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="red-flags-list">
          {redFlags.map((flag) => (
            <div
              key={flag.id}
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                flag.severity === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
              data-testid={`red-flag-card-${flag.id}`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                flag.severity === 'critical' ? 'bg-rose-200/80 text-rose-800' : 'bg-amber-200/80 text-amber-800'
              }`}>
                {flag.severity === 'critical' ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold font-display uppercase tracking-wide m-0">{flag.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    flag.severity === 'critical' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {flag.severity}
                  </span>
                </div>
                <p className="text-xs font-body opacity-90 leading-relaxed">{flag.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
