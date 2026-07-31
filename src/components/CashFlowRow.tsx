import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, BarChart3, ShoppingBag } from 'lucide-react';
import type { FinancialItem, FinancialMetrics } from '../types/financial';
import { formatCompactINR, formatINR } from '../utils/formatters';

interface CashFlowRowProps {
  metrics: FinancialMetrics;
  expenseItems: FinancialItem[];
  onOpenDrawer: (section: 'income' | 'expenses' | 'assets' | 'liabilities') => void;
}

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  Housing: '#C15B3E',
  Essentials: '#D97706',
  'Debt EMI': '#DC2626',
  Lifestyle: '#9333EA',
  Investments: '#166534',
  'Other Expense': '#64748B',
};

export const CashFlowRow: React.FC<CashFlowRowProps> = ({ metrics, expenseItems, onOpenDrawer }) => {
  const cashFlowData = [
    { name: 'Income', amount: metrics.totalIncome, color: '#166534' },
    { name: 'Expenses', amount: metrics.totalExpenses, color: '#C15B3E' },
    { name: 'Surplus', amount: Math.max(0, metrics.monthlySurplus), color: '#0D9488' },
  ];

  const categoryMap: Record<string, number> = {};
  expenseItems.forEach(item => {
    if (item.amount > 0) {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount;
    }
  });

  const sortedExpenses = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: metrics.totalExpenses > 0 ? (amount / metrics.totalExpenses) * 100 : 0,
      color: EXPENSE_CATEGORY_COLORS[category] || '#64748B',
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div 
        className="bg-white rounded-2xl border border-[#E2E4DC] p-6 flex flex-col justify-between hover-lift shadow-xs"
        data-testid="chart-cash-flow"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E8EBE4] text-[#1A3B2B] rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#1C2826] m-0">Monthly Cash Flow</h3>
              <p className="text-xs text-stone-500 font-body">Income vs Expenses vs Surplus</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDrawer('income')}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              data-testid="inline-edit-income"
            >
              <Plus className="w-3 h-3" /> Income
            </button>
            <button
              onClick={() => onOpenDrawer('expenses')}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              data-testid="inline-edit-expenses"
            >
              <Plus className="w-3 h-3" /> Expenses
            </button>
          </div>
        </div>

        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#1C2826', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}
                axisLine={{ stroke: '#E2E4DC' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#78716C', fontFamily: 'JetBrains Mono' }}
                tickFormatter={(val) => formatCompactINR(val)}
                axisLine={{ stroke: '#E2E4DC' }}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  borderColor: '#E2E4DC',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {cashFlowData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div 
        className="bg-white rounded-2xl border border-[#E2E4DC] p-6 flex flex-col justify-between hover-lift shadow-xs"
        data-testid="chart-expense-breakdown"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E8EBE4] text-[#1A3B2B] rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#1C2826] m-0">Expense Breakdown</h3>
              <p className="text-xs text-stone-500 font-body">Sorted descending by spending category</p>
            </div>
          </div>
          <span className="text-xs font-mono-num font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            Total: {formatCompactINR(metrics.totalExpenses)}
          </span>
        </div>

        {sortedExpenses.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
            <p className="text-xs font-semibold">No expense records present.</p>
          </div>
        ) : (
          <div className="space-y-3.5 my-auto overflow-y-auto max-h-64 pr-1">
            {sortedExpenses.map((exp) => (
              <div key={exp.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: exp.color }}></span>
                    <span className="font-semibold text-stone-800">{exp.category}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-num">
                    <span className="text-stone-500">{exp.percent.toFixed(1)}%</span>
                    <span className="font-bold text-[#1C2826]">{formatINR(exp.amount)}</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, exp.percent)}%`,
                      backgroundColor: exp.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
