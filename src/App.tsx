import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Header } from './components/Header';
import { HeroRow } from './components/HeroRow';
import { AICFOInsightCard } from './components/AICFOInsightCard';
import { KpiBento } from './components/KpiBento';
import { ChartsRow } from './components/ChartsRow';
import { CashFlowRow } from './components/CashFlowRow';
import { RedFlagsPanel } from './components/RedFlagsPanel';
import { DataDrawer } from './components/DataDrawer';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { AuthModal, type UserSession } from './components/AuthModal';
import { API_ENDPOINTS } from './utils/api';

import type { FinancialItem, MonthlySnapshot, AICFOInsight, FinancialState } from './types/financial';
import { calculateMetrics, detectRedFlags } from './utils/calculations';
import { loadFinancialState, saveFinancialState, INITIAL_DATA, EMPTY_STATE } from './utils/storage';
import { formatINR } from './utils/formatters';
import { Sparkles, Plus } from 'lucide-react';

const CATEGORIES = {
  income: ['Salary', 'Side Income', 'Rental', 'Dividends & Returns', 'Other Income'],
  expenses: ['Housing', 'Essentials', 'Debt EMI', 'Lifestyle', 'Investments', 'Other Expense'],
  assets: ['Cash & Bank', 'Equity & Mutual Funds', 'Gold & Bullion', 'Real Estate', 'Crypto', 'Other Asset'],
  liabilities: ['Home Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Auto Loan', 'Other Debt'],
};

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>(() => {
    const session = localStorage.getItem('cfo_user_session');
    return session ? 'dashboard' : 'landing';
  });

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const sessionStr = localStorage.getItem('cfo_user_session');
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [financialState, setFinancialState] = useState<FinancialState>(() => {
    if (userSession) {
      return loadFinancialState();
    }
    return EMPTY_STATE;
  });

  const [activeDrawer, setActiveDrawer] = useState<'income' | 'expenses' | 'assets' | 'liabilities' | null>(null);

  const { incomeItems, expenseItems, assetItems, liabilityItems, snapshots, aiInsight } = financialState;

  // Auto-sync financial state to backend database & localStorage
  useEffect(() => {
    saveFinancialState(financialState);

    if (userSession && userSession.id && userSession.id !== 999) {
      fetch(API_ENDPOINTS.saveUserData, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userSession.id,
          data: financialState,
        }),
      }).catch((err) => console.error('Failed to sync user data to backend SQLite DB:', err));
    }
  }, [financialState, userSession]);

  const metrics = calculateMetrics(incomeItems, expenseItems, assetItems, liabilityItems);
  const redFlags = detectRedFlags(metrics, snapshots);

  const handleAuthSuccess = (user: UserSession, data: FinancialState) => {
    setUserSession(user);
    setFinancialState(data);
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cfo_ai_key');
    sessionStorage.removeItem('cfo_ai_provider');
    localStorage.removeItem('cfo_ai_key');
    localStorage.removeItem('cfo_user_session');
    setUserSession(null);
    setFinancialState(EMPTY_STATE);
    setViewMode('landing');
    toast.info('Logged out successfully', {
      description: 'Session API key cleared.',
    });
  };

  const handleSaveSnapshot = () => {
    const monthName = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const newSnap: MonthlySnapshot = {
      id: `snap-${Date.now()}`,
      monthDate: monthName,
      timestamp: Date.now(),
      netWorth: metrics.netWorth,
      monthlyIncome: metrics.totalIncome,
      monthlyExpenses: metrics.totalExpenses,
      monthlySurplus: metrics.monthlySurplus,
      savingsRate: Number(metrics.savingsRate.toFixed(1)),
      burnRate: Number(metrics.burnRate.toFixed(1)),
      totalAssets: metrics.totalAssets,
      totalLiabilities: metrics.totalLiabilities,
    };

    const updatedSnapshots = [...snapshots, newSnap];
    setFinancialState((prev) => ({
      ...prev,
      snapshots: updatedSnapshots,
    }));

    toast.success(`Saved snapshot for ${monthName}`, {
      description: `Recorded Net Worth ${formatINR(metrics.netWorth)} in trend history.`,
    });
  };

  const handleResetData = () => {
    if (window.confirm('Clear all financial data back to 0?')) {
      setFinancialState(EMPTY_STATE);
      toast.info('Cleared Data', {
        description: 'All figures set to 0.',
      });
    }
  };

  const handleLoadSampleData = () => {
    setFinancialState(INITIAL_DATA);
    toast.success('Loaded Sample Demo Data', {
      description: 'Pre-filled demo income, expenses, and assets.',
    });
  };

  const handleSaveSectionItems = (section: 'income' | 'expenses' | 'assets' | 'liabilities', updated: FinancialItem[]) => {
    setFinancialState((prev) => {
      const next = { ...prev };
      if (section === 'income') next.incomeItems = updated;
      if (section === 'expenses') next.expenseItems = updated;
      if (section === 'assets') next.assetItems = updated;
      if (section === 'liabilities') next.liabilityItems = updated;
      return next;
    });

    toast.success(`Updated ${section.toUpperCase()} entries`, {
      description: 'Recalculated live financial health diagnosis.',
    });
  };

  const handleUpdateInsight = (insight: AICFOInsight) => {
    setFinancialState((prev) => ({
      ...prev,
      aiInsight: insight,
    }));
  };

  const isZeroState = incomeItems.length === 0 && expenseItems.length === 0 && assetItems.length === 0;

  if (viewMode === 'landing') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LandingPage
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLaunchDemo={() => {
            setUserSession({ id: 999, name: 'Rahul Sharma (Demo)', email: 'demo@personalcfo.ai' });
            setFinancialState(INITIAL_DATA);
            setViewMode('dashboard');
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col font-body antialiased selection:bg-[#1A3B2B] selection:text-white">
      <Toaster position="top-right" richColors />

      <Header
        metrics={metrics}
        userSession={userSession}
        onOpenDrawer={(sec) => setActiveDrawer(sec)}
        onSaveSnapshot={handleSaveSnapshot}
        onResetData={handleResetData}
        onGoLanding={() => setViewMode('landing')}
        onLogout={handleLogout}
        onLoadSampleData={handleLoadSampleData}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Zero State Alert Banner for New Users */}
        {isZeroState && (
          <div className="bg-[#1A3B2B] text-white p-6 rounded-2xl shadow-md border border-[#2A5440] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-bold font-display text-base text-emerald-300">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Welcome to your Clean Personal CFO Dashboard!</span>
              </div>
              <p className="text-xs text-stone-200">
                All values start at <strong>₹0</strong>. Click any card below to add your real Income, Expenses, or Assets, or load sample demo data to test.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveDrawer('income')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#1A3B2B] font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Entry
              </button>
              <button
                onClick={handleLoadSampleData}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Load Demo Figures
              </button>
            </div>
          </div>
        )}

        <HeroRow
          metrics={metrics}
          snapshots={snapshots}
          onOpenDrawer={(sec) => setActiveDrawer(sec)}
        />

        <AICFOInsightCard
          metrics={metrics}
          incomeItems={incomeItems}
          expenseItems={expenseItems}
          assetItems={assetItems}
          liabilityItems={liabilityItems}
          snapshots={snapshots}
          currentInsight={aiInsight}
          onUpdateInsight={handleUpdateInsight}
        />

        <KpiBento metrics={metrics} />

        <ChartsRow
          snapshots={snapshots}
          assetItems={assetItems}
          totalAssets={metrics.totalAssets}
        />

        <CashFlowRow
          metrics={metrics}
          expenseItems={expenseItems}
          onOpenDrawer={(sec) => setActiveDrawer(sec)}
        />

        <RedFlagsPanel redFlags={redFlags} />
      </main>

      {activeDrawer && (
        <DataDrawer
          isOpen={!!activeDrawer}
          onClose={() => setActiveDrawer(null)}
          title={`Edit ${activeDrawer.charAt(0).toUpperCase() + activeDrawer.slice(1)}`}
          sectionType={activeDrawer}
          categories={CATEGORIES[activeDrawer]}
          items={
            activeDrawer === 'income'
              ? incomeItems
              : activeDrawer === 'expenses'
              ? expenseItems
              : activeDrawer === 'assets'
              ? assetItems
              : liabilityItems
          }
          onSave={(updated) => handleSaveSectionItems(activeDrawer, updated)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <Footer />
    </div>
  );
}

export default App;
