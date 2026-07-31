import type { FinancialState } from '../types/financial';

const STORAGE_KEY = 'PERSONAL_CFO_FINANCIAL_DATA_V1';

export const EMPTY_STATE: FinancialState = {
  incomeItems: [],
  expenseItems: [],
  assetItems: [],
  liabilityItems: [],
  snapshots: [],
  aiInsight: null,
};

export const INITIAL_DATA: FinancialState = {
  incomeItems: [
    { id: 'inc-1', label: 'Primary Tech Salary', category: 'Salary', amount: 165000 },
    { id: 'inc-2', label: 'Freelance & Consulting', category: 'Side Income', amount: 30000 },
  ],
  expenseItems: [
    { id: 'exp-1', label: 'Apartment Rent & Maintenance', category: 'Housing', amount: 38000 },
    { id: 'exp-2', label: 'Groceries & Household Essentials', category: 'Essentials', amount: 24000 },
    { id: 'exp-3', label: 'Auto EMI & CC Minimum', category: 'Debt EMI', amount: 22000 },
    { id: 'exp-4', label: 'Weekend Dining & Outings', category: 'Lifestyle', amount: 35000 },
    { id: 'exp-5', label: 'Equity Mutual Fund SIPs', category: 'Investments', amount: 30000 },
    { id: 'exp-6', label: 'Misc & Utility Bills', category: 'Other Expense', amount: 6000 },
  ],
  assetItems: [
    { id: 'ast-1', label: 'HDFC Savings & Emergency FD', category: 'Cash & Bank', amount: 380000 },
    { id: 'ast-2', label: 'Zerodha Mutual Funds & Stocks', category: 'Equity & Mutual Funds', amount: 1250000 },
    { id: 'ast-3', label: 'Sovereign Gold Bonds (SGB)', category: 'Gold & Bullion', amount: 250000 },
    { id: 'ast-4', label: 'Cold Wallet Crypto', category: 'Crypto', amount: 80000 },
  ],
  liabilityItems: [
    { id: 'lia-1', label: 'HDFC Auto Loan Principal', category: 'Auto Loan', amount: 420000 },
    { id: 'lia-2', label: 'HDFC Infinia Credit Card', category: 'Credit Card', amount: 45000 },
  ],
  snapshots: [
    {
      id: 'snap-1',
      monthDate: 'Nov 2025',
      timestamp: 1731628800000,
      netWorth: 1250000,
      monthlyIncome: 180000,
      monthlyExpenses: 145000,
      monthlySurplus: 35000,
      savingsRate: 19.4,
      burnRate: 80.6,
      totalAssets: 1690000,
      totalLiabilities: 440000
    },
    {
      id: 'snap-2',
      monthDate: 'Dec 2025',
      timestamp: 1734220800000,
      netWorth: 1340000,
      monthlyIncome: 185000,
      monthlyExpenses: 148000,
      monthlySurplus: 37000,
      savingsRate: 20.0,
      burnRate: 80.0,
      totalAssets: 1790000,
      totalLiabilities: 450000
    },
    {
      id: 'snap-3',
      monthDate: 'Jan 2026',
      timestamp: 1736899200000,
      netWorth: 1420000,
      monthlyIncome: 190000,
      monthlyExpenses: 152000,
      monthlySurplus: 38000,
      savingsRate: 20.0,
      burnRate: 80.0,
      totalAssets: 1880000,
      totalLiabilities: 460000
    },
    {
      id: 'snap-4',
      monthDate: 'Feb 2026',
      timestamp: 1739577600000,
      netWorth: 1495000,
      monthlyIncome: 195000,
      monthlyExpenses: 155000,
      monthlySurplus: 40000,
      savingsRate: 20.5,
      burnRate: 79.5,
      totalAssets: 1960000,
      totalLiabilities: 465000
    }
  ],
  aiInsight: {
    verdict: 'WEALTH_LEAKING',
    summary: 'Bhai, monthly income ₹1.95L solid hai, lekin lifestyle expenses (₹35k) investments (₹30k) se zyada ho chuke hain! High burn rate (79.5%) ki wajah se net worth slower rate pe grow kar rahi hai.',
    recommendations: [
      'Lifestyle spending ko ₹25,000 par cap karo and ₹10,000 monthly SIP me redirect karo.',
      'Credit card outstanding (₹45,000) ko zero karo to avoid 40%+ annual interest.',
      'Emergency liquid cash baseline ko ₹4.5 Lakhs tak step-up karo for 6-month buffer.',
      'Auto loan principal pre-payment start karo with any variable bonus.'
    ]
  }
};

export function loadFinancialState(): FinancialState {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return INITIAL_DATA;
    const parsed = JSON.parse(dataStr);
    return {
      incomeItems: parsed.incomeItems || INITIAL_DATA.incomeItems,
      expenseItems: parsed.expenseItems || INITIAL_DATA.expenseItems,
      assetItems: parsed.assetItems || INITIAL_DATA.assetItems,
      liabilityItems: parsed.liabilityItems || INITIAL_DATA.liabilityItems,
      snapshots: parsed.snapshots || INITIAL_DATA.snapshots,
      aiInsight: parsed.aiInsight || INITIAL_DATA.aiInsight
    };
  } catch (e) {
    console.error('Error loading financial state from local storage:', e);
    return INITIAL_DATA;
  }
}

export function saveFinancialState(state: FinancialState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving financial state:', e);
  }
}

export function resetFinancialState(): FinancialState {
  localStorage.removeItem(STORAGE_KEY);
  return INITIAL_DATA;
}
