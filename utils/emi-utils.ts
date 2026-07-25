export function parseLoanAmount(amountText: string): number {
  const normalized = amountText.toUpperCase().replace(/\s+/g, '');

  if (normalized.endsWith('L')) {
    return Number(normalized.slice(0, -1)) * 100000;
  }

  if (normalized.endsWith('CR')) {
    return Number(normalized.slice(0, -2)) * 10000000;
  }

  return Number(normalized.replace(/,/g, ''));
}

export function parseInterestRate(rateText: string): number {
  return Number(rateText.replace('%', '').trim());
}

export function parseTenureYears(tenureText: string): number {
  return Number(tenureText.replace(/years?|yrs?/i, '').trim());
}

export function calculateEmi(principal: number, annualRatePercent: number, tenureYears: number): number {
  const monthlyRate = annualRatePercent / 100 / 12;
  const totalMonths = tenureYears * 12;

  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}
