export type IncomeCategory = 'Salary' | 'Side Income' | 'Rental' | 'Dividends & Returns' | 'Other Income';
export type ExpenseCategory = 'Housing' | 'Essentials' | 'Debt EMI' | 'Lifestyle' | 'Investments' | 'Other Expense';
export type AssetCategory = 'Cash & Bank' | 'Equity & Mutual Funds' | 'Gold & Bullion' | 'Real Estate' | 'Crypto' | 'Other Asset';
export type LiabilityCategory = 'Home Loan' | 'Personal Loan' | 'Credit Card' | 'Education Loan' | 'Auto Loan' | 'Other Debt';

export interface FinancialItem {
  id: string;
  label: string;
  category: string;
  amount: number;
}

export type VerdictState = 'WEALTH_BUILDING' | 'WEALTH_LEAKING' | 'SALARY_ROTATING';

export interface MonthlySnapshot {
  id: string;
  monthDate: string; // e.g. "Mar 2026"
  timestamp: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  savingsRate: number;
  burnRate: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  monthlySurplus: number;
  savingsRate: number;
  burnRate: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidCash: number;
  essentialExpenses: number;
  lifestyleExpenses: number;
  investmentExpenses: number;
  emergencyRunwayMonths: number;
  dtiRatio: number;
  wealthHealthScore: number;
  verdict: VerdictState;
}

export interface RedFlagAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface AICFOInsight {
  verdict: VerdictState;
  summary: string;
  recommendations: string[];
  lastUpdated?: string;
}

export interface FinancialState {
  incomeItems: FinancialItem[];
  expenseItems: FinancialItem[];
  assetItems: FinancialItem[];
  liabilityItems: FinancialItem[];
  snapshots: MonthlySnapshot[];
  aiInsight?: AICFOInsight | null;
}
