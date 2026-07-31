/**
 * Formats a number into Indian Currency (INR) string.
 * Example: 150000 -> ₹1,50,000
 * Example: 15000000 -> ₹1,50,00,000
 */
export function formatINR(val: number, includeSymbol: boolean = true): string {
  if (isNaN(val) || val === null || val === undefined) {
    return includeSymbol ? '₹0' : '0';
  }
  
  const isNegative = val < 0;
  const absoluteVal = Math.abs(val);
  
  // Format using en-IN locale
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(absoluteVal));

  const prefix = isNegative ? '-₹' : includeSymbol ? '₹' : '';
  return `${prefix}${formatted}`;
}

/**
 * Compact Indian Currency format:
 * < 100K => ₹45K
 * < 1 Cr => ₹15.5L
 * >= 1 Cr => ₹2.40Cr
 */
export function formatCompactINR(val: number): string {
  if (isNaN(val) || val === 0) return '₹0';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const prefix = isNegative ? '-₹' : '₹';

  if (absVal >= 10000000) {
    // Crore
    const cr = absVal / 10000000;
    return `${prefix}${cr.toFixed(2)}Cr`;
  } else if (absVal >= 100000) {
    // Lakh
    const lakh = absVal / 100000;
    return `${prefix}${lakh.toFixed(1)}L`;
  } else if (absVal >= 1000) {
    // Thousand
    const k = absVal / 1000;
    return `${prefix}${k.toFixed(1)}K`;
  }

  return `${prefix}${Math.round(absVal)}`;
}

/**
 * Format percentages cleanly (e.g. 26.5%)
 */
export function formatPercent(val: number, decimals: number = 1): string {
  if (isNaN(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
}
