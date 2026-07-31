import React from 'react';
import { Landmark, Camera, RotateCcw, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard, LogOut, Home, User, Sparkles, Printer } from 'lucide-react';
import type { FinancialMetrics } from '../types/financial';
import { formatCompactINR } from '../utils/formatters';
import type { UserSession } from './AuthModal';

interface HeaderProps {
  metrics: FinancialMetrics;
  userSession: UserSession | null;
  onOpenDrawer: (section: 'income' | 'expenses' | 'assets' | 'liabilities') => void;
  onSaveSnapshot: () => void;
  onResetData: () => void;
  onGoLanding: () => void;
  onLogout: () => void;
  onLoadSampleData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  userSession,
  onOpenDrawer,
  onSaveSnapshot,
  onResetData,
  onGoLanding,
  onLogout,
  onLoadSampleData,
}) => {
  const isZeroState = metrics.totalIncome === 0 && metrics.totalExpenses === 0 && metrics.totalAssets === 0;

  return (
    <header className="glass-header sticky top-0 z-40 w-full px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onGoLanding}>
            <div className="w-10 h-10 rounded-xl bg-[#1A3B2B] text-white flex items-center justify-center shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-display tracking-tight text-[#1C2826] leading-none m-0">
                  Personal CFO
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8EBE4] text-[#1A3B2B] border border-[#7E998A]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Live Diagnosis
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">Monthly Wealth Health Engine</p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onGoLanding}
              className="p-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200"
              title="Home Landing Page"
            >
              <Home className="w-4 h-4" />
            </button>

            <button
              onClick={onSaveSnapshot}
              className="p-2 bg-[#1A3B2B] text-white rounded-lg hover:bg-[#2A5440]"
              title="Save Snapshot"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onOpenDrawer('income')}
            className="px-3 py-1.5 bg-white border border-[#E2E4DC] hover:border-[#1A3B2B] rounded-lg text-xs font-semibold text-[#1C2826] flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            data-testid="trigger-drawer-income"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Income:</span>
            <span className="font-mono-num font-bold text-[#1A3B2B]">{formatCompactINR(metrics.totalIncome)}</span>
          </button>

          <button
            onClick={() => onOpenDrawer('expenses')}
            className="px-3 py-1.5 bg-white border border-[#E2E4DC] hover:border-amber-700 rounded-lg text-xs font-semibold text-[#1C2826] flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            data-testid="trigger-drawer-expenses"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>Expenses:</span>
            <span className="font-mono-num font-bold text-amber-800">{formatCompactINR(metrics.totalExpenses)}</span>
          </button>

          <button
            onClick={() => onOpenDrawer('assets')}
            className="px-3 py-1.5 bg-white border border-[#E2E4DC] hover:border-[#1A3B2B] rounded-lg text-xs font-semibold text-[#1C2826] flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            data-testid="trigger-drawer-assets"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Assets:</span>
            <span className="font-mono-num font-bold text-[#1A3B2B]">{formatCompactINR(metrics.totalAssets)}</span>
          </button>

          <button
            onClick={() => onOpenDrawer('liabilities')}
            className="px-3 py-1.5 bg-white border border-[#E2E4DC] hover:border-rose-600 rounded-lg text-xs font-semibold text-[#1C2826] flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            data-testid="trigger-drawer-liabilities"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#C15B3E]" />
            <span>Liabilities:</span>
            <span className="font-mono-num font-bold text-[#C15B3E]">{formatCompactINR(metrics.totalLiabilities)}</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          {isZeroState && onLoadSampleData && (
            <button
              onClick={onLoadSampleData}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Populate sample demo figures for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Load Demo Data
            </button>
          )}

          <button
            onClick={onSaveSnapshot}
            className="px-3.5 py-2 bg-[#1A3B2B] hover:bg-[#2A5440] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            data-testid="header-save-snapshot"
          >
            <Camera className="w-3.5 h-3.5" /> Save Snapshot
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Print or Save Financial Report as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" /> PDF Report
          </button>


          <button
            onClick={onGoLanding}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Go to Landing Page"
          >
            <Home className="w-3.5 h-3.5" /> Landing
          </button>

          {userSession ? (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="px-2.5 py-1 bg-emerald-100/70 border border-emerald-300 rounded-lg flex items-center gap-1.5 text-xs text-[#1A3B2B] font-bold">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span className="truncate max-w-[100px]">{userSession.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onResetData}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset data"
              data-testid="header-reset-data"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
