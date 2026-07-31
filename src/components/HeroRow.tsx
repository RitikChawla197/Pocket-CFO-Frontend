import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { FinancialMetrics, MonthlySnapshot, VerdictState } from '../types/financial';
import { formatINR, formatCompactINR } from '../utils/formatters';

interface HeroRowProps {
  metrics: FinancialMetrics;
  snapshots: MonthlySnapshot[];
  onOpenDrawer: (section: 'income' | 'expenses' | 'assets' | 'liabilities') => void;
}

export const HeroRow: React.FC<HeroRowProps> = ({ metrics, snapshots, onOpenDrawer }) => {
  let prevNetWorth = 0;
  let netWorthDelta = 0;
  let deltaPercent = 0;

  if (snapshots.length >= 2) {
    prevNetWorth = snapshots[snapshots.length - 2].netWorth;
    netWorthDelta = metrics.netWorth - prevNetWorth;
    deltaPercent = prevNetWorth !== 0 ? (netWorthDelta / Math.abs(prevNetWorth)) * 100 : 0;
  } else if (snapshots.length === 1) {
    prevNetWorth = snapshots[0].netWorth;
    netWorthDelta = metrics.netWorth - prevNetWorth;
    deltaPercent = prevNetWorth !== 0 ? (netWorthDelta / Math.abs(prevNetWorth)) * 100 : 0;
  }

  const getVerdictBadge = (verdict: VerdictState) => {
    switch (verdict) {
      case 'WEALTH_BUILDING':
        return {
          label: 'WEALTH BUILDING',
          sub: 'Financial Machine Operational',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'WEALTH_LEAKING':
        return {
          label: 'WEALTH LEAKING',
          sub: 'High Income, High Creep Leak',
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'SALARY_ROTATING':
        return {
          label: 'SALARY ROTATING',
          sub: 'Paycheck to Paycheck Cycle',
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
        };
    }
  };

  const badge = getVerdictBadge(metrics.verdict);

  const score = metrics.wealthHealthScore;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#1A3B2B';
  let scoreBg = '#E8EBE4';
  let scoreStatus = 'Excellent';
  if (score < 40) {
    scoreColor = '#C15B3E';
    scoreBg = '#FDF1ED';
    scoreStatus = 'Critical Risk';
  } else if (score < 70) {
    scoreColor = '#D97706';
    scoreBg = '#FEF3C7';
    scoreStatus = 'Moderate / Leaking';
  } else {
    scoreColor = '#166534';
    scoreBg = '#DCFCE7';
    scoreStatus = 'Strong Health';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div 
        className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E4DC] p-6 sm:p-8 flex flex-col justify-between hover-lift relative overflow-hidden shadow-xs"
        data-testid="hero-net-worth-card"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#1A3B2B]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-display">Hero Net Worth</span>
              <span className="text-[11px] font-medium text-stone-400">Assets − Liabilities</span>
            </div>

            <div 
              className={`px-3 py-1 rounded-full border text-xs font-extrabold flex items-center gap-2 tracking-wide uppercase ${badge.bg}`}
              data-testid="verdict-badge-hero"
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot} animate-ping`}></span>
              <span>{badge.label}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-4 mb-4">
            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono-num text-[#1A3B2B] tracking-tight m-0"
              data-testid="hero-net-worth-amount"
            >
              {formatINR(metrics.netWorth)}
            </h2>

            {snapshots.length >= 1 && (
              <div 
                className={`flex items-center gap-1 text-xs font-bold font-mono-num px-2.5 py-1 rounded-lg ${
                  netWorthDelta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {netWorthDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{netWorthDelta >= 0 ? '+' : ''}{formatINR(netWorthDelta)}</span>
                <span>({deltaPercent >= 0 ? '+' : ''}{deltaPercent.toFixed(1)}%)</span>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-500 font-medium max-w-xl">
            Live diagnosis calculated from total wealth portfolio of <strong className="text-stone-700">{formatCompactINR(metrics.totalAssets)}</strong> across {metrics.liquidCash > 0 ? 'liquid cash, equity, gold & crypto' : 'assets'} against <strong className="text-stone-700">{formatCompactINR(metrics.totalLiabilities)}</strong> in debt commitments.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[#E2E4DC] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => onOpenDrawer('assets')}
            className="p-3.5 bg-[#F7F7F4] hover:bg-[#E8EBE4] rounded-xl border border-[#E2E4DC] transition-all cursor-pointer flex items-center justify-between group"
            data-testid="hero-assets-trigger"
          >
            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Assets</span>
              <span className="text-lg font-bold font-mono-num text-[#1A3B2B]">{formatINR(metrics.totalAssets)}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => onOpenDrawer('liabilities')}
            className="p-3.5 bg-[#F7F7F4] hover:bg-[#FDF1ED] rounded-xl border border-[#E2E4DC] transition-all cursor-pointer flex items-center justify-between group"
            data-testid="hero-liabilities-trigger"
          >
            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Liabilities</span>
              <span className="text-lg font-bold font-mono-num text-[#C15B3E]">{formatINR(metrics.totalLiabilities)}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-2xl border border-[#E2E4DC] p-6 flex flex-col items-center justify-between hover-lift shadow-xs relative"
        data-testid="hero-health-score-card"
      >
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1A3B2B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-display">Wealth Health Score</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: scoreBg, color: scoreColor }}>
            {scoreStatus}
          </span>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="42"
              stroke="#E8EBE4"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="42"
              stroke={scoreColor}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span 
              className="text-4xl font-extrabold font-mono-num tracking-tight"
              style={{ color: scoreColor }}
              data-testid="health-score-value"
            >
              {score}
            </span>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        <div className="w-full pt-3 border-t border-[#E2E4DC] space-y-1.5">
          <div className="flex justify-between text-[11px] text-stone-500 font-medium">
            <span>Savings Rate (30%)</span>
            <span className="font-mono-num font-semibold text-stone-700">{metrics.savingsRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-stone-500 font-medium">
            <span>Emergency Runway (20%)</span>
            <span className="font-mono-num font-semibold text-stone-700">{metrics.emergencyRunwayMonths.toFixed(1)} Mo</span>
          </div>
          <div className="flex justify-between text-[11px] text-stone-500 font-medium">
            <span>Debt-to-Income (20%)</span>
            <span className="font-mono-num font-semibold text-stone-700">{metrics.dtiRatio.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
