import React, { useState } from 'react';
import { 
  Flame, 
  Calculator, 
  Sliders, 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  PieChart
} from 'lucide-react';
import type { FinancialMetrics, FinancialItem, FinancialGoal } from '../types/financial';
import { formatINR } from '../utils/formatters';
import { toast } from 'sonner';

interface FinancialSimulatorsProps {
  metrics: FinancialMetrics;
  liabilityItems: FinancialItem[];
  assetItems?: FinancialItem[];
}

export const FinancialSimulators: React.FC<FinancialSimulatorsProps> = ({
  metrics,
  liabilityItems,
}) => {
  const [activeTab, setActiveTab] = useState<'fire' | 'tax' | 'sandbox' | 'goals' | 'debt'>('fire');

  // --- 1. FIRE CALCULATOR STATE ---
  const [currentAge, setCurrentAge] = useState(28);
  const [retireAge, setRetireAge] = useState(50);
  const [customMonthlyExp, setCustomMonthlyExp] = useState(metrics.totalExpenses || 80000);
  const [inflationRate, setInflationRate] = useState(6.0);
  const [expectedReturn, setExpectedReturn] = useState(12.0);

  // FIRE calculations
  const yearsToRetire = Math.max(1, retireAge - currentAge);
  const futureMonthlyExp = customMonthlyExp * Math.pow(1 + inflationRate / 100, yearsToRetire);
  const futureAnnualExp = futureMonthlyExp * 12;
  // Standard 4% rule (25x annual expenses in retirement)
  const fireCorpusNeeded = futureAnnualExp * 25;
  const currentInvestments = metrics.totalAssets;

  
  // Future value of current investments at retirement
  const fvCurrentInvestments = currentInvestments * Math.pow(1 + expectedReturn / 100, yearsToRetire);
  const netCorpusGap = Math.max(0, fireCorpusNeeded - fvCurrentInvestments);
  
  // Required monthly SIP formula: FV = P * [((1+r)^n - 1)/r] * (1+r)
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = yearsToRetire * 12;
  const reqMonthlySIP = netCorpusGap > 0 && monthlyRate > 0
    ? (netCorpusGap * monthlyRate) / ((Math.pow(1 + monthlyRate, totalMonths) - 1) * (1 + monthlyRate))
    : 0;

  // --- 2. TAX CALCULATOR STATE ---
  const annualIncome = metrics.totalIncome * 12 || 1800000;
  const [sec80C, setSec80C] = useState(150000);
  const [sec80D, setSec80D] = useState(25000);
  const [nps80CCD, setNps80CCD] = useState(50000);
  const [hraExemption, setHraExemption] = useState(120000);

  // Tax computation logic (India FY 2025-26 rules)
  // Old Regime Tax Calculation
  const stdDeductionOld = 50000;
  const totalDeductionsOld = stdDeductionOld + Math.min(150000, sec80C) + Math.min(75000, sec80D) + Math.min(50000, nps80CCD) + hraExemption;
  const taxableIncomeOld = Math.max(0, annualIncome - totalDeductionsOld);

  let taxOld = 0;
  if (taxableIncomeOld > 1000000) {
    taxOld = 112500 + (taxableIncomeOld - 1000000) * 0.3;
  } else if (taxableIncomeOld > 500000) {
    taxOld = 12500 + (taxableIncomeOld - 500000) * 0.2;
  } else if (taxableIncomeOld > 250000) {
    taxOld = (taxableIncomeOld - 250000) * 0.05;
  }
  if (taxableIncomeOld <= 500000) taxOld = 0; // 87A rebate
  taxOld = taxOld * 1.04; // Cess

  // New Regime Tax Calculation (Standard Deduction ₹75,000)
  const stdDeductionNew = 75000;
  const taxableIncomeNew = Math.max(0, annualIncome - stdDeductionNew);

  let taxNew = 0;
  if (taxableIncomeNew > 1500000) {
    taxNew = 150000 + (taxableIncomeNew - 1500000) * 0.3;
  } else if (taxableIncomeNew > 1200000) {
    taxNew = 90000 + (taxableIncomeNew - 1200000) * 0.2;
  } else if (taxableIncomeNew > 900000) {
    taxNew = 45000 + (taxableIncomeNew - 900000) * 0.15;
  } else if (taxableIncomeNew > 600000) {
    taxNew = 15000 + (taxableIncomeNew - 600000) * 0.1;
  } else if (taxableIncomeNew > 300000) {
    taxNew = (taxableIncomeNew - 300000) * 0.05;
  }
  if (taxableIncomeNew <= 700000) taxNew = 0; // 87A rebate for New Regime up to 7L
  taxNew = taxNew * 1.04; // Cess

  const taxDifference = Math.abs(taxOld - taxNew);
  const recommendedRegime = taxNew <= taxOld ? 'New Tax Regime' : 'Old Tax Regime';

  // --- 3. WHAT-IF SANDBOX STATE ---
  const [incomeHikePercent, setIncomeHikePercent] = useState(15);
  const [additionalEmi, setAdditionalEmi] = useState(0);
  const [lifestyleReductionPercent, setLifestyleReductionPercent] = useState(20);

  const simIncome = metrics.totalIncome * (1 + incomeHikePercent / 100);
  const simLifestyleExp = metrics.lifestyleExpenses * (1 - lifestyleReductionPercent / 100);
  const simTotalExp = metrics.essentialExpenses + simLifestyleExp + metrics.investmentExpenses + additionalEmi;
  const simSurplus = simIncome - simTotalExp;
  const simSavingsRate = simIncome > 0 ? (simSurplus / simIncome) * 100 : 0;
  const simBurnRate = simIncome > 0 ? (simTotalExp / simIncome) * 100 : 0;
  const simRunway = simTotalExp > 0 ? metrics.liquidCash / simTotalExp : 0;

  // --- 4. GOAL-BASED TRACKER STATE ---
  const [goals, setGoals] = useState<FinancialGoal[]>([
    { id: 'g1', title: 'Emergency Reserve 6M', targetAmount: metrics.essentialExpenses * 6 || 300000, currentAmount: metrics.liquidCash, targetYear: 2026, category: 'Emergency' },
    { id: 'g2', title: 'Home Down Payment', targetAmount: 2500000, currentAmount: 850000, targetYear: 2028, category: 'House' },
    { id: 'g3', title: 'New Electric SUV', targetAmount: 1200000, currentAmount: 350000, targetYear: 2027, category: 'Car' },
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalYear, setNewGoalYear] = useState('2028');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget) return;
    const g: FinancialGoal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle,
      targetAmount: parseFloat(newGoalTarget),
      currentAmount: 0,
      targetYear: parseInt(newGoalYear),
      category: 'Other'
    };
    setGoals([...goals, g]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    toast.success(`Added goal "${g.title}"!`);
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast.info('Removed goal');
  };

  // --- 5. DEBT PAYOFF SIMULATOR ---
  const activeLiabilities = liabilityItems.length > 0 ? liabilityItems : [
    { id: 'l1', label: 'Credit Card Dues', category: 'Credit Card', amount: 45000 },
    { id: 'l2', label: 'Auto Loan Principal', category: 'Auto Loan', amount: 420000 },
  ];
  
  // Assume default interest rates for categories if not specified
  const getCategoryInterestRate = (cat: string) => {
    if (cat.includes('Credit Card')) return 42; // 42% p.a.
    if (cat.includes('Personal')) return 16;
    if (cat.includes('Auto')) return 9.5;
    if (cat.includes('Home')) return 8.6;
    return 12;
  };

  const totalDebt = activeLiabilities.reduce((acc, item) => acc + item.amount, 0);
  const monthlyExtraPayoff = Math.max(5000, metrics.monthlySurplus * 0.3);
  const debtFreeMonths = totalDebt > 0 ? Math.ceil(totalDebt / (monthlyExtraPayoff + 15000)) : 0;

  return (
    <div className="bg-[#142E22] text-white rounded-3xl p-6 sm:p-8 border border-[#2A5440] shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-900/90 border border-emerald-500/40 rounded-2xl text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white m-0">Advanced Financial Engineering Toolkit</h3>
            <p className="text-xs text-emerald-200/70 m-0">FIRE retirement modeler, tax optimizer, what-if sandbox & goal tracker</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-emerald-950/80 rounded-2xl border border-emerald-800/60 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('fire')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'fire' ? 'bg-emerald-500 text-[#1A3B2B] shadow-md' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> FIRE Model
          </button>

          <button
            onClick={() => setActiveTab('tax')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tax' ? 'bg-emerald-500 text-[#1A3B2B] shadow-md' : 'text-stone-300 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" /> Tax Saver
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sandbox' ? 'bg-emerald-500 text-[#1A3B2B] shadow-md' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> What-If Sandbox
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'goals' ? 'bg-emerald-500 text-[#1A3B2B] shadow-md' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Goals Tracker
          </button>

          <button
            onClick={() => setActiveTab('debt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'debt' ? 'bg-emerald-500 text-[#1A3B2B] shadow-md' : 'text-stone-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Debt Payoff
          </button>
        </div>
      </div>

      {/* --- TAB 1: FIRE CALCULATOR --- */}
      {activeTab === 'fire' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          <div className="lg:col-span-6 space-y-4 bg-emerald-950/40 p-5 rounded-2xl border border-emerald-800/40">
            <h4 className="text-sm font-bold text-emerald-400 font-display flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" /> FIRE Target Parameters
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-300 block mb-1">Current Age ({currentAge} yrs)</label>
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 block mb-1">Target Retire Age ({retireAge} yrs)</label>
                <input
                  type="range"
                  min={currentAge + 1}
                  max="70"
                  value={retireAge}
                  onChange={(e) => setRetireAge(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Monthly Expenses at Retirement (₹)</label>
              <input
                type="number"
                value={customMonthlyExp}
                onChange={(e) => setCustomMonthlyExp(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-300 block mb-1">Assumed Inflation ({inflationRate}%)</label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 block mb-1">Portfolio Return ({expectedReturn}%)</label>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 bg-gradient-to-br from-emerald-950 to-emerald-900/60 rounded-2xl border border-emerald-500/30 space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display block">
                Target FIRE Freedom Corpus
              </span>

              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono-num">
                {formatINR(fireCorpusNeeded)}
              </div>

              <p className="text-xs text-stone-300/80">
                To retire at age <strong>{retireAge}</strong> with inflation-adjusted monthly expenses of <strong>{formatINR(futureMonthlyExp)}</strong>/mo, you need a 25x safety corpus.
              </p>

              <div className="pt-3 border-t border-emerald-800/60 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-stone-400 block">Years to Freedom</span>
                  <span className="text-lg font-bold text-emerald-300 font-mono-num">{yearsToRetire} Years</span>
                </div>

                <div>
                  <span className="text-[11px] text-stone-400 block">Required Monthly SIP</span>
                  <span className="text-lg font-bold text-emerald-300 font-mono-num">{formatINR(reqMonthlySIP)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: TAX OPTIMIZER --- */}
      {activeTab === 'tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          <div className="lg:col-span-6 space-y-4 bg-emerald-950/40 p-5 rounded-2xl border border-emerald-800/40">
            <h4 className="text-sm font-bold text-emerald-400 font-display flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" /> Income Tax Deductions (Old Regime)
            </h4>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Section 80C (ELSS, EPF, PPF) - Max ₹1.5L</label>
              <input
                type="number"
                value={sec80C}
                onChange={(e) => setSec80C(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-300 block mb-1">Section 80D Health Ins (₹)</label>
                <input
                  type="number"
                  value={sec80D}
                  onChange={(e) => setSec80D(parseFloat(e.target.value) || 0)}
                  className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 block mb-1">NPS 80CCD(1B) (Max ₹50k)</label>
                <input
                  type="number"
                  value={nps80CCD}
                  onChange={(e) => setNps80CCD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">HRA / Home Loan Interest Exemption (₹)</label>
              <input
                type="number"
                value={hraExemption}
                onChange={(e) => setHraExemption(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border transition-all ${recommendedRegime === 'Old Tax Regime' ? 'bg-emerald-900/60 border-emerald-400' : 'bg-emerald-950/40 border-emerald-800/40'}`}>
                <span className="text-xs font-bold text-emerald-300 uppercase block">Old Tax Regime</span>
                <span className="text-2xl font-bold font-mono-num text-white block mt-1">{formatINR(taxOld)}</span>
                <span className="text-[11px] text-stone-300 block mt-2">Deductions: {formatINR(totalDeductionsOld)}</span>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${recommendedRegime === 'New Tax Regime' ? 'bg-emerald-900/60 border-emerald-400' : 'bg-emerald-950/40 border-emerald-800/40'}`}>
                <span className="text-xs font-bold text-emerald-300 uppercase block">New Tax Regime</span>
                <span className="text-2xl font-bold font-mono-num text-white block mt-1">{formatINR(taxNew)}</span>
                <span className="text-[11px] text-stone-300 block mt-2">Standard Deduction: ₹75,000</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-900/40 border border-emerald-600/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs text-emerald-300 font-bold block">Recommended Choice</span>
                  <span className="text-sm font-bold text-white block">{recommendedRegime}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-400 font-mono-num">
                Saves {formatINR(taxDifference)} / yr
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: WHAT-IF SANDBOX --- */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          <div className="lg:col-span-6 space-y-4 bg-emerald-950/40 p-5 rounded-2xl border border-emerald-800/40">
            <h4 className="text-sm font-bold text-emerald-400 font-display flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> Life Decision Simulators
            </h4>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Salary Hike / Income Surge (+{incomeHikePercent}%)</label>
              <input
                type="range"
                min="0"
                max="50"
                value={incomeHikePercent}
                onChange={(e) => setIncomeHikePercent(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Add New Loan EMI (₹{formatINR(additionalEmi)}/mo)</label>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={additionalEmi}
                onChange={(e) => setAdditionalEmi(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Cut Lifestyle Spending (-{lifestyleReductionPercent}%)</label>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={lifestyleReductionPercent}
                onChange={(e) => setLifestyleReductionPercent(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
              Simulated Financial Health
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                <span className="text-[11px] text-stone-400 block">Simulated Surplus</span>
                <span className="text-xl font-bold text-emerald-300 font-mono-num">{formatINR(simSurplus)}</span>
              </div>

              <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                <span className="text-[11px] text-stone-400 block">Simulated Burn Rate</span>
                <span className="text-xl font-bold text-amber-300 font-mono-num">{simBurnRate.toFixed(1)}%</span>
              </div>

              <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                <span className="text-[11px] text-stone-400 block">Savings Rate</span>
                <span className="text-xl font-bold text-emerald-300 font-mono-num">{simSavingsRate.toFixed(1)}%</span>
              </div>

              <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                <span className="text-[11px] text-stone-400 block">Emergency Runway</span>
                <span className="text-xl font-bold text-emerald-300 font-mono-num">{simRunway.toFixed(1)} Mos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: GOALS TRACKER --- */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/40">
            <input
              type="text"
              placeholder="Goal Title (e.g. Vacation)"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700/60"
            />
            <input
              type="number"
              placeholder="Target Amount (₹)"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700/60"
            />
            <input
              type="number"
              placeholder="Target Year (e.g. 2028)"
              value={newGoalYear}
              onChange={(e) => setNewGoalYear(e.target.value)}
              className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700/60"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#1A3B2B] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="p-4 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl space-y-3 relative group">
                  <button
                    onClick={() => handleRemoveGoal(g.id)}
                    className="absolute top-3 right-3 text-stone-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-display">{g.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">{g.targetYear} Target</span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-stone-400">{formatINR(g.currentAmount)} saved</span>
                    <span className="font-bold text-emerald-300 font-mono-num">{formatINR(g.targetAmount)}</span>
                  </div>

                  <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-800/40">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 5: DEBT PAYOFF --- */}
      {activeTab === 'debt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
              Active Debt Portfolio
            </h4>

            <div className="space-y-2.5">
              {activeLiabilities.map((item) => (
                <div key={item.id} className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{item.label}</span>
                    <span className="text-[10px] text-stone-400 block">{item.category} • ~{getCategoryInterestRate(item.category)}% Interest</span>
                  </div>
                  <span className="text-sm font-bold text-rose-300 font-mono-num">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 bg-gradient-to-br from-rose-950/60 to-emerald-950 rounded-2xl border border-rose-800/40 space-y-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-display block">
                Avalanche Payoff Acceleration
              </span>

              <div className="text-2xl font-extrabold text-white font-mono-num">
                Debt-Free in ~{debtFreeMonths} Months
              </div>

              <p className="text-xs text-stone-300/80">
                By funneling 30% of your monthly surplus (<strong>{formatINR(monthlyExtraPayoff)}</strong>) towards the highest-interest debt first, you eliminate high-interest liabilities quickly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
