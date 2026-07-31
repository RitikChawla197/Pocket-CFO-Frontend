import React from 'react';
import { PiggyBank, Flame, Shield, Scale } from 'lucide-react';
import type { FinancialMetrics } from '../types/financial';
import { formatINR, formatPercent } from '../utils/formatters';

interface KpiBentoProps {
  metrics: FinancialMetrics;
}

export const KpiBento: React.FC<KpiBentoProps> = ({ metrics }) => {
  const isSurplusPositive = metrics.monthlySurplus >= 0;
  const surplusTone = isSurplusPositive
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : 'bg-rose-50 text-rose-800 border-rose-200';

  const getSavingsRateTone = (rate: number) => {
    if (rate >= 25) return { bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', tag: 'Optimal', badge: 'bg-emerald-100 text-emerald-800' };
    if (rate >= 15) return { bg: 'bg-amber-50 text-amber-900 border-amber-200', tag: 'Moderate', badge: 'bg-amber-100 text-amber-800' };
    return { bg: 'bg-rose-50 text-rose-900 border-rose-200', tag: 'Low Surplus', badge: 'bg-rose-100 text-rose-800' };
  };
  const savingsTone = getSavingsRateTone(metrics.savingsRate);

  const getBurnRateTone = (burn: number) => {
    if (burn <= 70) return { bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', tag: 'Controlled', badge: 'bg-emerald-100 text-emerald-800' };
    if (burn <= 85) return { bg: 'bg-amber-50 text-amber-900 border-amber-200', tag: 'High Burn', badge: 'bg-amber-100 text-amber-800' };
    return { bg: 'bg-rose-50 text-rose-900 border-rose-200', tag: 'Dangerous (>85%)', badge: 'bg-rose-100 text-rose-800' };
  };
  const burnTone = getBurnRateTone(metrics.burnRate);

  const getRunwayTone = (months: number) => {
    if (months >= 6) return { bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', tag: 'Solid 6+ Mo', badge: 'bg-emerald-100 text-emerald-800' };
    if (months >= 3) return { bg: 'bg-amber-50 text-amber-900 border-amber-200', tag: 'Fair (3-6 Mo)', badge: 'bg-amber-100 text-amber-800' };
    return { bg: 'bg-rose-50 text-rose-900 border-rose-200', tag: 'Fragile (<3 Mo)', badge: 'bg-rose-100 text-rose-800' };
  };
  const runwayTone = getRunwayTone(metrics.emergencyRunwayMonths);

  const getDtiTone = (dti: number) => {
    if (dti <= 35) return { bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', tag: 'Safe DTI', badge: 'bg-emerald-100 text-emerald-800' };
    if (dti <= 50) return { bg: 'bg-amber-50 text-amber-900 border-amber-200', tag: 'Elevated DTI', badge: 'bg-amber-100 text-amber-800' };
    return { bg: 'bg-rose-50 text-rose-900 border-rose-200', tag: 'High Leverage', badge: 'bg-rose-100 text-rose-800' };
  };
  const dtiTone = getDtiTone(metrics.dtiRatio);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div 
        className={`rounded-xl border p-5 flex flex-col justify-between hover-lift shadow-xs transition-all ${surplusTone}`}
        data-testid="kpi-surplus"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 font-display">Monthly Surplus</span>
          <PiggyBank className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-2xl font-extrabold font-mono-num tracking-tight m-0">
            {formatINR(metrics.monthlySurplus)}
          </h4>
          <p className="text-[11px] font-medium opacity-80 mt-1">Income − Expenses</p>
        </div>
      </div>

      <div 
        className={`rounded-xl border p-5 flex flex-col justify-between hover-lift shadow-xs transition-all ${savingsTone.bg}`}
        data-testid="kpi-savings-rate"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 font-display">Savings Rate</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${savingsTone.badge}`}>
            {savingsTone.tag}
          </span>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold font-mono-num tracking-tight m-0">
            {formatPercent(metrics.savingsRate)}
          </h4>
          <p className="text-[11px] font-medium opacity-80 mt-1">Surplus ÷ Income</p>
        </div>
      </div>

      <div 
        className={`rounded-xl border p-5 flex flex-col justify-between hover-lift shadow-xs transition-all ${burnTone.bg}`}
        data-testid="kpi-burn-rate"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 font-display">Burn Rate</span>
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-2xl font-extrabold font-mono-num tracking-tight m-0">
            {formatPercent(metrics.burnRate)}
          </h4>
          <p className="text-[11px] font-medium opacity-80 mt-1">Expenses ÷ Income</p>
        </div>
      </div>

      <div 
        className={`rounded-xl border p-5 flex flex-col justify-between hover-lift shadow-xs transition-all ${runwayTone.bg}`}
        data-testid="kpi-runway"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 font-display">Emergency Runway</span>
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-2xl font-extrabold font-mono-num tracking-tight m-0">
            {metrics.emergencyRunwayMonths.toFixed(1)} <span className="text-base font-bold">Months</span>
          </h4>
          <p className="text-[11px] font-medium opacity-80 mt-1">Cash ÷ Essential Exp.</p>
        </div>
      </div>

      <div 
        className={`rounded-xl border p-5 flex flex-col justify-between hover-lift shadow-xs transition-all ${dtiTone.bg}`}
        data-testid="kpi-dti"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 font-display">Debt-to-Income</span>
          <Scale className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-2xl font-extrabold font-mono-num tracking-tight m-0">
            {formatPercent(metrics.dtiRatio)}
          </h4>
          <p className="text-[11px] font-medium opacity-80 mt-1">Total Debt ÷ Annual Inc.</p>
        </div>
      </div>
    </div>
  );
};
