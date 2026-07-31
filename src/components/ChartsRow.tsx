import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, PieChart as PieIcon, Layers } from 'lucide-react';
import type { FinancialItem, MonthlySnapshot } from '../types/financial';
import { formatCompactINR, formatINR } from '../utils/formatters';

interface ChartsRowProps {
  snapshots: MonthlySnapshot[];
  assetItems: FinancialItem[];
  totalAssets: number;
}

const ASSET_COLORS: Record<string, string> = {
  'Cash & Bank': '#0D9488',
  'Equity & Mutual Funds': '#166534',
  'Gold & Bullion': '#D97706',
  'Real Estate': '#2563EB',
  'Crypto': '#9333EA',
  'Other Asset': '#64748B',
};

const DEFAULT_COLOR = '#475569';

export const ChartsRow: React.FC<ChartsRowProps> = ({ snapshots, assetItems, totalAssets }) => {
  const categoryTotals: Record<string, number> = {};
  assetItems.forEach(item => {
    if (item.amount > 0) {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    }
  });

  const donutData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: ASSET_COLORS[name] || DEFAULT_COLOR,
  }));

  const trendData = snapshots.map(s => ({
    month: s.monthDate,
    netWorth: s.netWorth,
    income: s.monthlyIncome,
    expenses: s.monthlyExpenses,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div 
        className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E4DC] p-6 flex flex-col justify-between hover-lift shadow-xs"
        data-testid="chart-net-worth-trend"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E8EBE4] text-[#1A3B2B] rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#1C2826] m-0">Net Worth Trajectory</h3>
              <p className="text-xs text-stone-500 font-body">Historical snapshots driven by "Save monthly snapshot"</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full">
            {snapshots.length} Snapshot{snapshots.length === 1 ? '' : 's'}
          </span>
        </div>

        {snapshots.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
            <Layers className="w-8 h-8 mb-2 stroke-1" />
            <p className="text-xs font-semibold">No monthly snapshots saved yet.</p>
            <p className="text-[11px] text-stone-400">Click "Save Monthly Snapshot" in the top bar to record data points.</p>
          </div>
        ) : (
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A3B2B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1A3B2B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#78716C', fontFamily: 'Manrope' }}
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
                  formatter={(value: any) => [formatINR(Number(value)), 'Net Worth']}
                  labelStyle={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, color: '#1C2826' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E4DC',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke="#1A3B2B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#netWorthGradient)" 
                  dot={{ r: 4, fill: '#1A3B2B', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#1A3B2B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div 
        className="bg-white rounded-2xl border border-[#E2E4DC] p-6 flex flex-col justify-between hover-lift shadow-xs"
        data-testid="chart-asset-allocation"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-[#E8EBE4] text-[#1A3B2B] rounded-lg">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-[#1C2826] m-0">Asset Allocation</h3>
            <p className="text-xs text-stone-500 font-body">Category distribution</p>
          </div>
        </div>

        {donutData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
            <p className="text-xs font-semibold">No asset data available.</p>
          </div>
        ) : (
          <div className="relative h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatINR(Number(value)), 'Value']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    borderColor: '#E2E4DC',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Assets</span>
              <span className="text-base font-extrabold font-mono-num text-[#1A3B2B]">
                {formatCompactINR(totalAssets)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E4DC]">
          {donutData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
              <span className="truncate font-medium text-[11px]">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
