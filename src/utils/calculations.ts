import type { FinancialItem, FinancialMetrics, MonthlySnapshot, RedFlagAlert, VerdictState } from '../types/financial';

export function calculateMetrics(
  incomeItems: FinancialItem[],
  expenseItems: FinancialItem[],
  assetItems: FinancialItem[],
  liabilityItems: FinancialItem[]
): FinancialMetrics {
  const totalIncome = incomeItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const totalExpenses = expenseItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const totalAssets = assetItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const totalLiabilities = liabilityItems.reduce((acc, item) => acc + (item.amount || 0), 0);

  const monthlySurplus = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (monthlySurplus / totalIncome) * 100) : 0;
  const burnRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const netWorth = totalAssets - totalLiabilities;

  // Liquid Cash calculation (Cash & Bank)
  const liquidCash = assetItems
    .filter(item => item.category === 'Cash & Bank' || item.category.toLowerCase().includes('cash'))
    .reduce((acc, item) => acc + (item.amount || 0), 0);

  // Essential Expenses (Housing + Essentials)
  const essentialExpenses = expenseItems
    .filter(item => ['Housing', 'Essentials'].includes(item.category))
    .reduce((acc, item) => acc + (item.amount || 0), 0);
  
  const effectiveEssentialExpenses = essentialExpenses > 0 ? essentialExpenses : (totalExpenses * 0.5);

  const emergencyRunwayMonths = effectiveEssentialExpenses > 0 ? liquidCash / effectiveEssentialExpenses : 0;

  // Lifestyle & Investment Expenses
  const lifestyleExpenses = expenseItems
    .filter(item => item.category === 'Lifestyle')
    .reduce((acc, item) => acc + (item.amount || 0), 0);

  const investmentExpenses = expenseItems
    .filter(item => item.category === 'Investments')
    .reduce((acc, item) => acc + (item.amount || 0), 0);

  // DTI Ratio: Total Liabilities / Annual Income
  const annualIncome = totalIncome * 12;
  const dtiRatio = annualIncome > 0 ? (totalLiabilities / annualIncome) * 100 : 0;

  // Wealth Health Score (0 - 100)
  const savingsScore = Math.min(100, Math.max(0, (savingsRate / 30) * 100));
  const runwayScore = Math.min(100, Math.max(0, (emergencyRunwayMonths / 6) * 100));

  let debtScore = 100;
  if (dtiRatio > 15) {
    debtScore = Math.max(0, 100 - ((dtiRatio - 15) / 35) * 100);
  }

  let netWorthScore = 0;
  if (netWorth > 0) {
    netWorthScore = totalLiabilities === 0 ? 100 : Math.min(100, (totalAssets / totalLiabilities) * 40);
  }

  const activeAssetCats = new Set(
    assetItems.filter(i => i.amount > 0).map(i => i.category)
  ).size;
  const diversificationScore = Math.min(100, (activeAssetCats / 4) * 100);

  const rawScore = (
    savingsScore * 0.30 +
    runwayScore * 0.20 +
    debtScore * 0.20 +
    netWorthScore * 0.15 +
    diversificationScore * 0.15
  );

  const wealthHealthScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Verdict state determination
  let verdict: VerdictState = 'WEALTH_BUILDING';
  if (burnRate > 85 || monthlySurplus <= 0 || emergencyRunwayMonths < 1.5) {
    verdict = 'SALARY_ROTATING';
  } else if (lifestyleExpenses > investmentExpenses || dtiRatio > 40 || (burnRate > 65 && savingsRate < 25)) {
    verdict = 'WEALTH_LEAKING';
  } else if (savingsRate >= 25 && emergencyRunwayMonths >= 3 && dtiRatio <= 40) {
    verdict = 'WEALTH_BUILDING';
  } else {
    verdict = 'WEALTH_LEAKING';
  }

  return {
    totalIncome,
    totalExpenses,
    monthlySurplus,
    savingsRate,
    burnRate,
    totalAssets,
    totalLiabilities,
    netWorth,
    liquidCash,
    essentialExpenses: effectiveEssentialExpenses,
    lifestyleExpenses,
    investmentExpenses,
    emergencyRunwayMonths,
    dtiRatio,
    wealthHealthScore,
    verdict
  };
}

export function detectRedFlags(metrics: FinancialMetrics, snapshots: MonthlySnapshot[]): RedFlagAlert[] {
  const flags: RedFlagAlert[] = [];

  if (metrics.burnRate > 90 || metrics.monthlySurplus < 0) {
    flags.push({
      id: 'burn-rate-high',
      title: metrics.monthlySurplus < 0 ? 'Negative Cash Flow Alert' : 'Critical Burn Rate (> 90%)',
      description: metrics.monthlySurplus < 0 
        ? `You are spending ₹${Math.abs(metrics.monthlySurplus).toLocaleString('en-IN')} more than you earn each month.`
        : `Expenses consume ${metrics.burnRate.toFixed(1)}% of income, leaving negligible buffer for wealth creation.`,
      severity: 'critical'
    });
  }

  if (metrics.investmentExpenses > 0 && metrics.emergencyRunwayMonths < 3) {
    flags.push({
      id: 'fragile-investment',
      title: 'Investments Active with Fragile Emergency Buffer',
      description: `You are investing ₹${metrics.investmentExpenses.toLocaleString('en-IN')}/mo, but your cash runway is only ${metrics.emergencyRunwayMonths.toFixed(1)} months (target: 3–6 months). An unexpected issue could force distress selling.`,
      severity: 'warning'
    });
  }

  if (metrics.lifestyleExpenses > metrics.investmentExpenses) {
    flags.push({
      id: 'lifestyle-creep',
      title: 'Lifestyle Spending Exceeds Investments',
      description: `Lifestyle expenses (₹${metrics.lifestyleExpenses.toLocaleString('en-IN')}) are higher than monthly investments (₹${metrics.investmentExpenses.toLocaleString('en-IN')}). Wealth leak detected.`,
      severity: 'warning'
    });
  }

  if (metrics.dtiRatio > 50) {
    flags.push({
      id: 'high-dti',
      title: 'Excessive Debt-to-Income Ratio (> 50%)',
      description: `Total debt (₹${metrics.totalLiabilities.toLocaleString('en-IN')}) is ${metrics.dtiRatio.toFixed(1)}% of annual income. High leverage risk.`,
      severity: 'critical'
    });
  }

  if (snapshots.length >= 2) {
    const prev = snapshots[snapshots.length - 2];
    const curr = snapshots[snapshots.length - 1];
    const assetGrowth = curr.totalAssets - prev.totalAssets;
    const debtGrowth = curr.totalLiabilities - prev.totalLiabilities;
    if (assetGrowth > 0 && debtGrowth >= assetGrowth * 0.8) {
      flags.push({
        id: 'debt-funded-assets',
        title: 'Assets Growing via Debt Expansion',
        description: 'Your asset growth in recent months is heavily matched by debt expansion. Net worth gains are leveraged.',
        severity: 'warning'
      });
    }
    const incomeGrowth = curr.monthlyIncome - prev.monthlyIncome;
    const netWorthGrowth = curr.netWorth - prev.netWorth;
    if (incomeGrowth > 0 && netWorthGrowth <= 0) {
      flags.push({
        id: 'income-up-nw-flat',
        title: 'Income Rising but Net Worth Flat',
        description: 'Monthly income increased over recent snapshots, but net worth remained stagnant due to unmanaged expense expansion.',
        severity: 'critical'
      });
    }
  } else if (metrics.totalLiabilities > metrics.totalAssets * 0.6 && metrics.totalLiabilities > 0) {
    flags.push({
      id: 'debt-funded-assets',
      title: 'High Debt-to-Asset Ratio',
      description: `Liabilities represent ${((metrics.totalLiabilities/metrics.totalAssets)*100).toFixed(0)}% of total assets. Debt is competing with asset growth.`,
      severity: 'warning'
    });
  }

  return flags;
}
