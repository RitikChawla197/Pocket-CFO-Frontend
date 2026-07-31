import React, { useState } from 'react';
import { Bot, Sparkles, RefreshCw, CheckCircle2, Key, Eye, EyeOff, X, Zap, SlidersHorizontal } from 'lucide-react';
import type { AICFOInsight, FinancialMetrics, FinancialItem, MonthlySnapshot, VerdictState } from '../types/financial';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../utils/api';

interface AICFOInsightCardProps {
  metrics: FinancialMetrics;
  incomeItems: FinancialItem[];
  expenseItems: FinancialItem[];
  assetItems: FinancialItem[];
  liabilityItems: FinancialItem[];
  snapshots: MonthlySnapshot[];
  currentInsight?: AICFOInsight | null;
  onUpdateInsight: (insight: AICFOInsight) => void;
}

export const AICFOInsightCard: React.FC<AICFOInsightCardProps> = ({
  metrics,
  incomeItems,
  expenseItems,
  assetItems,
  liabilityItems,
  snapshots,
  currentInsight,
  onUpdateInsight,
}) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Key & Provider State from SessionStorage (auto-clears on tab close or logout)
  type ProviderType = 'groq' | 'gemini' | 'anthropic' | 'openrouter' | 'offline';

  const [provider, setProvider] = useState<ProviderType>(
    () => (sessionStorage.getItem('cfo_ai_provider') as ProviderType) || 'groq'
  );
  const [apiKey, setApiKey] = useState<string>(
    () => sessionStorage.getItem('cfo_ai_key') || ''
  );
  const [showKey, setShowKey] = useState(false);

  const handleSaveConfig = (newProvider: ProviderType, newKey: string) => {
    setProvider(newProvider);
    setApiKey(newKey);
    sessionStorage.setItem('cfo_ai_provider', newProvider);
    if (newKey.trim()) {
      sessionStorage.setItem('cfo_ai_key', newKey.trim());
      toast.success(`Configured ${newProvider.toUpperCase()} Provider!`, {
        description: 'Active for this session. Will auto-clear when tab is closed or on logout.',
      });
    } else {
      sessionStorage.removeItem('cfo_ai_key');
      localStorage.removeItem('cfo_ai_key');
      if (newProvider !== 'offline') {
        toast.info('API Key Cleared', {
          description: 'Session key removed.',
        });
      } else {
        toast.success('Switched to Offline CFO Engine', {
          description: 'Runs financial diagnostics locally without external API calls.',
        });
      }
    }
    setIsModalOpen(false);
  };

  const handleGenerateAIInsights = async () => {
    const activeKey = apiKey.trim() || sessionStorage.getItem('cfo_ai_key') || '';
    const activeProvider = provider || (sessionStorage.getItem('cfo_ai_provider') as ProviderType) || 'groq';

    if (!activeKey && activeProvider !== 'offline') {
      // If no key provided, open settings or fallback to offline
      toast.info('Select AI Provider or Enter Key', {
        description: 'You can use Groq (Free), OpenRouter (Free), or the Offline Rule Engine without a key.',
      });
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        net_worth: metrics.netWorth,
        monthly_income: metrics.totalIncome,
        monthly_expenses: metrics.totalExpenses,
        monthly_surplus: metrics.monthlySurplus,
        savings_rate: metrics.savingsRate,
        burn_rate: metrics.burnRate,
        emergency_runway_months: metrics.emergencyRunwayMonths,
        dti_ratio: metrics.dtiRatio,
        wealth_health_score: metrics.wealthHealthScore,
        liquid_cash: metrics.liquidCash,
        lifestyle_expenses: metrics.lifestyleExpenses,
        investment_expenses: metrics.investmentExpenses,
        essential_expenses: metrics.essentialExpenses,
        total_assets: metrics.totalAssets,
        total_liabilities: metrics.totalLiabilities,
        red_flags: [],
        income_items: incomeItems,
        expense_items: expenseItems,
        asset_items: assetItems,
        liability_items: liabilityItems,
        trend_history: snapshots,
        provider: activeProvider,
        api_key: activeKey || undefined,
      };

      const response = await fetch(API_ENDPOINTS.aiInsights, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const detailMsg = errJson.detail || `AI Engine HTTP error ${response.status}`;
        throw new Error(detailMsg);
      }

      const data = await response.json();
      const updated: AICFOInsight = {
        verdict: data.verdict as VerdictState,
        summary: data.summary,
        recommendations: data.recommendations,
        lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      onUpdateInsight(updated);

      const providerLabels: Record<string, string> = {
        groq: 'Groq (Llama 3.3 70B)',
        openrouter: 'OpenRouter Free Model',
        gemini: 'Google Gemini 2.5 Flash',
        anthropic: 'Anthropic Claude 3.5 Sonnet',
        offline: 'Offline Local CFO Engine',
      };

      toast.success(`CFO Diagnosis Generated!`, {
        description: `Powered by ${providerLabels[activeProvider] || 'Personal CFO AI'}`,
      });
    } catch (err: any) {
      console.error('Failed to generate AI insights:', err);
      const fallbackVerdict: VerdictState = metrics.verdict;
      const fallbackInsight: AICFOInsight = {
        verdict: fallbackVerdict,
        summary: `Bhai, monthly income ₹${(metrics.totalIncome/1000).toFixed(1)}k solid hai, lekin ${metrics.burnRate.toFixed(1)}% burn rate ki wajah se net worth fast scale nahi ho rhi. Current runway ${metrics.emergencyRunwayMonths.toFixed(1)} months hai.`,
        recommendations: [
          `Lifestyle spending ko immediately 20% cut down karke SIP investments boost karo.`,
          `High interest credit card debts ko immediately clear karo to fix DTI (${metrics.dtiRatio.toFixed(1)}%).`,
          `Emergency cash reserve ko baseline 6 months essential expenses tak badhao.`
        ],
        lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      onUpdateInsight(fallbackInsight);
      toast.info('Switched to Local CFO Engine', {
        description: 'Using offline rule-based CFO diagnosis.',
      });
    } finally {
      setLoading(false);
    }
  };


  const getVerdictStyle = (v?: VerdictState) => {
    switch (v) {
      case 'WEALTH_BUILDING':
        return {
          label: 'WEALTH BUILDING',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'WEALTH_LEAKING':
        return {
          label: 'WEALTH LEAKING',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'SALARY_ROTATING':
        return {
          label: 'SALARY ROTATING',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      default:
        return {
          label: 'DIAGNOSTIC PENDING',
          bg: 'bg-stone-500/20 text-stone-300 border-stone-500/40',
        };
    }
  };

  const activeInsight = currentInsight || {
    verdict: metrics.verdict,
    summary: `Bhai, monthly income ₹${(metrics.totalIncome/1000).toFixed(1)}k solid hai, par saara surplus lifestyle inflation me absorb ho raha hai. Time to plug the leaks and build real assets!`,
    recommendations: [
      `Cap lifestyle spending and step up monthly mutual fund SIPs by ₹10,000.`,
      `Pay off high-interest credit card dues immediately to reduce DTI ratio.`,
      `Build emergency fund to at least 6 months of essential expenses.`
    ]
  };

  const vStyle = getVerdictStyle(activeInsight.verdict);
  const isKeyConfigured = Boolean(apiKey.trim());

  return (
    <div 
      className="bg-[#1A3B2B] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden bg-grain border border-[#2A5440]"
      data-testid="ai-cfo-card"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-900/80 border border-emerald-600/40 rounded-xl text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-display text-white m-0">AI Personal CFO Diagnostic Layer</h3>
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-emerald-200/70 font-body">Instant AI Financial Health Assessment & Action Plan</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div 
              className={`px-3.5 py-1.5 rounded-full border text-xs font-black tracking-wider uppercase flex items-center gap-2 ${vStyle.bg}`}
              data-testid="verdict-badge-ai"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{vStyle.label}</span>
            </div>

            {/* API Key Config Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs border flex items-center gap-2 transition-all cursor-pointer ${
                isKeyConfigured
                  ? 'bg-emerald-900/80 hover:bg-emerald-800 border-emerald-500/60 text-emerald-200'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-700/50 text-emerald-300/80'
              }`}
              title="Configure Gemini or Anthropic API Key"
              data-testid="ai-key-config-btn"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isKeyConfigured
                  ? `${provider === 'anthropic' ? 'Claude' : 'Gemini'} Key Set`
                  : 'API Key Setup'}
              </span>
              {isKeyConfigured && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              )}
            </button>

            {/* Generate AI Insights Button */}
            <button
              onClick={handleGenerateAIInsights}
              disabled={loading}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#1A3B2B] font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              data-testid="ai-generate-btn"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Snapshot...' : 'Generate AI Insights'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-emerald-200">Analyzing your income, expense categories, liabilities and net worth trajectory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 font-display block flex items-center justify-between">
                <span>Financial Diagnosis Summary</span>
                {isKeyConfigured && (
                  <span className="text-[10px] text-emerald-300/60 normal-case font-normal flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    {provider === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}
                  </span>
                )}
              </span>
              <p 
                className="text-base sm:text-lg font-medium leading-relaxed text-stone-100 bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/40"
                data-testid="ai-cfo-summary"
              >
                "{activeInsight.summary}"
              </p>
              {activeInsight.lastUpdated && (
                <span className="text-[10px] text-emerald-300/60 font-mono-num block">
                  Last diagnosed: {activeInsight.lastUpdated}
                </span>
              )}
            </div>

            <div className="lg:col-span-7 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 font-display block flex items-center gap-1.5">
                High-Impact Action Items
              </span>

              <div className="space-y-2.5" data-testid="ai-cfo-recommendations">
                {activeInsight.recommendations.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700/40 rounded-xl flex items-start gap-3 transition-colors"
                  >
                    <div className="mt-0.5 p-1 bg-emerald-500/20 text-emerald-400 rounded-md shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs sm:text-sm text-stone-200 font-medium leading-snug">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-[#142E22] border border-[#2A5440] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-900/90 border border-emerald-500/40 rounded-xl text-emerald-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-white m-0">AI Engine Settings</h4>
                  <p className="text-xs text-emerald-200/70 m-0">Choose provider & configure your API key</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-emerald-900/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BYOK Policy Note */}
            {/* BYOK Policy Note */}
            <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60 text-[11px] text-emerald-200/80 flex items-start gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Free AI Options Available:</strong> Get a 100% free API key from <strong>Groq</strong> or <strong>OpenRouter</strong>, or use the <strong>Offline CFO Engine</strong> with zero keys!</span>
            </div>

            {/* Provider Selection Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                Select AI Provider
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setProvider('groq')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                    provider === 'groq'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                      : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300/70 hover:bg-emerald-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-display">Groq Cloud</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-mono font-bold">100% FREE</span>
                  </div>
                  <span className="text-[10px] text-stone-300/80">Ultra-fast Llama 3.3 70B model</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('openrouter')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                    provider === 'openrouter'
                      ? 'bg-blue-500/20 border-blue-400 text-white shadow-sm'
                      : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300/70 hover:bg-emerald-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-display">OpenRouter</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 font-mono font-bold">FREE MODELS</span>
                  </div>
                  <span className="text-[10px] text-stone-300/80">Llama & Gemma free models</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('gemini')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                    provider === 'gemini'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                      : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300/70 hover:bg-emerald-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-display">Google Gemini</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-mono">2.5 Flash</span>
                  </div>
                  <span className="text-[10px] text-stone-300/80">Official Google AI Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('anthropic')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                    provider === 'anthropic'
                      ? 'bg-purple-500/20 border-purple-400 text-white shadow-sm'
                      : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300/70 hover:bg-emerald-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-display">Anthropic Claude</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 font-mono">3.5 Sonnet</span>
                  </div>
                  <span className="text-[10px] text-stone-300/80">Deep reasoning & analysis</span>
                </button>
              </div>

              {/* Offline Engine Choice */}
              <button
                type="button"
                onClick={() => {
                  setProvider('offline');
                  setApiKey('');
                }}
                className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  provider === 'offline'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300/70 hover:bg-emerald-900/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold font-display text-amber-300">Offline Local CFO Engine</div>
                  <div className="text-[10px] text-stone-300/80">No API key required — instant local rule-based Hinglish diagnosis</div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-bold font-mono">NO KEY NEEDED</span>
              </button>
            </div>

            {/* API Key Input (Hidden for Offline) */}
            {provider !== 'offline' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                    {provider === 'groq' ? 'Groq API Key' : provider === 'openrouter' ? 'OpenRouter API Key' : provider === 'anthropic' ? 'Anthropic API Key' : 'Google Gemini API Key'}
                  </label>
                  <span className="text-[10px] text-emerald-400/80">
                    {provider === 'groq' ? 'Starts with gsk_' : provider === 'openrouter' ? 'Starts with sk-or-' : provider === 'anthropic' ? 'Starts with sk-ant-' : 'Starts with AIza'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      provider === 'groq' ? 'gsk_...' :
                      provider === 'openrouter' ? 'sk-or-v1-...' :
                      provider === 'anthropic' ? 'sk-ant-api03-...' : 'AIzaSy...'
                    }
                    className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-stone-100 placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/70 hover:text-emerald-300 cursor-pointer p-1"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-emerald-200/60 leading-normal">
                  {provider === 'groq' ? (
                    <span>
                      Get 100% Free key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline text-emerald-300 font-bold hover:text-white">console.groq.com</a> (No credit card needed).
                    </span>
                  ) : provider === 'openrouter' ? (
                    <span>
                      Get free key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline text-emerald-300 font-bold hover:text-white">openrouter.ai</a>.
                    </span>
                  ) : provider === 'anthropic' ? (
                    <span>
                      Get key from <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="underline text-emerald-300 hover:text-white">Anthropic Console</a>.
                    </span>
                  ) : (
                    <span>
                      Get key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline text-emerald-300 hover:text-white">Google AI Studio</a>.
                    </span>
                  )}
                </p>
              </div>
            )}


            {/* Save & Clear Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setApiKey('');
                  handleSaveConfig(provider, '');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-900/50 transition-colors cursor-pointer"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveConfig(provider, apiKey)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#1A3B2B] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

