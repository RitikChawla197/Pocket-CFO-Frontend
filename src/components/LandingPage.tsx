import React, { useState } from 'react';
import { 
  Landmark, Sparkles, ArrowRight, Bot, TrendingUp, AlertTriangle, 
  Cpu, Sliders, ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onLaunchDemo }) => {
  // Interactive Simulator State
  const [simIncome, setSimIncome] = useState(150000);
  const [simExpenses, setSimExpenses] = useState(95000);

  const simSurplus = Math.max(0, simIncome - simExpenses);
  const simSavingsRate = simIncome > 0 ? (simSurplus / simIncome) * 100 : 0;
  const simBurnRate = simIncome > 0 ? (simExpenses / simIncome) * 100 : 0;

  const getSimVerdict = () => {
    if (simBurnRate > 80 || simSurplus <= 0) {
      return { label: 'SALARY ROTATING', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', note: 'High burn rate! Salary rotates out as fast as it arrives.' };
    }
    if (simBurnRate > 65 || simSavingsRate < 25) {
      return { label: 'WEALTH LEAKING', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', note: 'Significant lifestyle spending absorbing potential wealth gains.' };
    }
    return { label: 'WEALTH BUILDING', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', note: 'Solid financial discipline! Money is actively compounding.' };
  };

  const simVerdict = getSimVerdict();

  return (
    <div className="min-h-screen bg-[#0E2218] text-white font-body selection:bg-emerald-500 selection:text-[#0E2218] relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[400px] right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="relative z-20 max-w-[1320px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-[#0E2218] flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white tracking-tight m-0 leading-none">
              Personal CFO
            </h1>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider">AI WEALTH ENGINE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-stone-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0E2218] text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-[1320px] mx-auto px-6 pt-12 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>AI-POWERED FINANCIAL COACH FOR INDIAN PROFESSIONALS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Master Your Money. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Plug Leaks. Build Real Wealth.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-emerald-100/70 max-w-2xl mx-auto font-normal leading-relaxed">
          Stop wondering where your salary goes. Get instant AI financial health diagnostics, live burn-rate tracking, DTI limits, and actionable Hinglish wealth advice.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onOpenAuth('register')}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0E2218] font-bold text-base rounded-2xl shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <span>Create Free Account (0 Balance)</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onLaunchDemo}
            className="px-8 py-4 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-700/60 text-emerald-200 font-bold text-base rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Explore Interactive Demo</span>
          </button>
        </div>

        {/* Hero Mockup Bento Preview */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="bg-[#142E22] border border-[#2A5440] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-emerald-800/60 text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-900/80 border border-emerald-500/40 rounded-xl text-emerald-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-white m-0">Live AI CFO Diagnostic Layer</h4>
                  <p className="text-xs text-emerald-200/70 m-0">Real-time wealth analysis for monthly cashflow</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black tracking-wider uppercase">
                  ● WEALTH BUILDING
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/40 space-y-1">
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Net Worth Trajectory</span>
                <p className="text-2xl font-bold font-mono-num text-white">₹14.95 Lakhs</p>
                <span className="text-[11px] text-emerald-300/70">↑ +19.6% over last 4 months</span>
              </div>

              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/40 space-y-1">
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Burn Rate</span>
                <p className="text-2xl font-bold font-mono-num text-amber-300">60.2%</p>
                <span className="text-[11px] text-stone-300/70">Healthy allocation below 65%</span>
              </div>

              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/40 space-y-1">
                <span className="text-[11px] text-teal-400 font-bold uppercase tracking-wider">Emergency Runway</span>
                <p className="text-2xl font-bold font-mono-num text-teal-300">6.2 Months</p>
                <span className="text-[11px] text-teal-200/70">Liquid cash buffer fully secured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Financial Simulator */}
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 py-16">
        <div className="bg-gradient-to-b from-[#142E22] to-[#0E2218] border border-[#2A5440] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-700/50">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Instant Simulator</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Test Your Instant AI Financial Verdict
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/70 max-w-lg mx-auto">
              Slide your monthly income and expenses to see how the AI CFO evaluates your current cashflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
            <div className="lg:col-span-6 space-y-6">
              {/* Income Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-emerald-300">Monthly Income</span>
                  <span className="font-mono-num font-bold text-white text-base">₹{(simIncome).toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="500000"
                  step="5000"
                  value={simIncome}
                  onChange={(e) => setSimIncome(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer bg-emerald-950 h-2.5 rounded-lg"
                />
              </div>

              {/* Expenses Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-amber-300">Monthly Expenses</span>
                  <span className="font-mono-num font-bold text-amber-200 text-base">₹{(simExpenses).toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="400000"
                  step="5000"
                  value={simExpenses}
                  onChange={(e) => setSimExpenses(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer bg-emerald-950 h-2.5 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Surplus</span>
                  <span className="text-sm font-bold font-mono-num text-white">₹{simSurplus.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Savings Rate</span>
                  <span className="text-sm font-bold font-mono-num text-white">{simSavingsRate.toFixed(1)}%</span>
                </div>

                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">Burn Rate</span>
                  <span className="text-sm font-bold font-mono-num text-amber-300">{simBurnRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Verdict Display Card */}
            <div className="lg:col-span-6 bg-emerald-950/80 border border-emerald-700/50 rounded-2xl p-6 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-display">
                  AI Personal CFO Verdict
                </span>
                <span className={`px-3 py-1 rounded-full border text-xs font-black tracking-wider uppercase ${simVerdict.bg}`}>
                  {simVerdict.label}
                </span>
              </div>

              <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-medium">
                "{simVerdict.note}"
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0E2218] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Create Account & Setup Real Financial Data</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="relative z-10 max-w-[1320px] mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
            Everything You Need for Complete Financial Mastery
          </h2>
          <p className="text-sm sm:text-base text-emerald-200/70 max-w-xl mx-auto">
            Built specifically for Indian salary structures, SIPs, EMIs, and wealth preservation goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#142E22] border border-[#2A5440] p-6 rounded-2xl space-y-4 hover:border-emerald-500/50 transition-colors">
            <div className="p-3 bg-emerald-900/80 border border-emerald-600/40 rounded-xl text-emerald-400 w-fit">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white m-0">Hinglish AI Coaching</h3>
            <p className="text-xs text-emerald-200/70 leading-relaxed m-0">
              No generic jargon. Get direct, punchy financial guidance tailored to Indian tax rules and lifestyle spending.
            </p>
          </div>

          <div className="bg-[#142E22] border border-[#2A5440] p-6 rounded-2xl space-y-4 hover:border-emerald-500/50 transition-colors">
            <div className="p-3 bg-emerald-900/80 border border-emerald-600/40 rounded-xl text-emerald-400 w-fit">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white m-0">Real Net Worth Trajectory</h3>
            <p className="text-xs text-emerald-200/70 leading-relaxed m-0">
              Track monthly progress with liquid runway calculation so you always know how many months of freedom you have.
            </p>
          </div>

          <div className="bg-[#142E22] border border-[#2A5440] p-6 rounded-2xl space-y-4 hover:border-emerald-500/50 transition-colors">
            <div className="p-3 bg-emerald-900/80 border border-emerald-600/40 rounded-xl text-emerald-400 w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white m-0">Automatic Red Flag Guard</h3>
            <p className="text-xs text-emerald-200/70 leading-relaxed m-0">
              Instant alerts for high DTI ratios (&gt;40%), low emergency funds, or when lifestyle spending exceeds investment growth.
            </p>
          </div>

          <div className="bg-[#142E22] border border-[#2A5440] p-6 rounded-2xl space-y-4 hover:border-emerald-500/50 transition-colors">
            <div className="p-3 bg-emerald-900/80 border border-emerald-600/40 rounded-xl text-emerald-400 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white m-0">Bring Your Own LLM Key</h3>
            <p className="text-xs text-emerald-200/70 leading-relaxed m-0">
              Connect Google Gemini 2.0 or Anthropic Claude 3.5 API keys for bespoke AI generation, or use our smart built-in engine.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <footer className="relative z-10 border-t border-emerald-900/60 bg-[#0A1A12] py-12 px-6">
        <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold font-display text-lg">
              <Landmark className="w-5 h-5 text-emerald-400" />
              <span>Personal CFO AI Engine</span>
            </div>
            <p className="text-xs text-emerald-300/60 m-0">Your private financial health & wealth building operating system.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0E2218] font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Start Free Account
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
