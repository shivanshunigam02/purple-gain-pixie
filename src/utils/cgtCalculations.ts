export interface Asset {
  id: string;
  ownedMoreThan12Months: boolean;
  purchasePrice: number;
  additionalCosts: number;
  salePrice: number;
}

export interface CGTInputs {
  annualTaxableIncome: number;
  incomeYear: string;
  hasUnappliedLosses: boolean;
  unappliedLossesAmount: number;
  assetsPurchasedBefore1985: boolean;
  foreignOrTemporaryResident: boolean;
  assets: Asset[];
}

export interface CGTResults {
  lossCarryForward: number;
  assetBreakdown: Array<{
    assetId: string;
    rawGain: number;
    discountedGain: number;
    isLoss: boolean;
  }>;
  totalCapitalGain: number;
  netCapitalGain: number;
  taxableIncomeWithGain: number;
  taxWithoutGain: number;
  taxWithGain: number;
  cgtPayable: number;
  medicareLevy: number;
  totalTaxLiability: number;
}

// Australian tax brackets for 2025-26 (residents)
const TAX_BRACKETS = [
  { min: 0, max: 18200, rate: 0, base: 0 },
  { min: 18201, max: 45000, rate: 0.16, base: 0 },
  { min: 45001, max: 135000, rate: 0.30, base: 4288 },
  { min: 135001, max: 190000, rate: 0.37, base: 31288 },
  { min: 190001, max: Infinity, rate: 0.45, base: 51638 }
];

export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  const bracket = TAX_BRACKETS.find(b => taxableIncome >= b.min && taxableIncome <= b.max);
  if (!bracket) return 0;

  return bracket.base + (taxableIncome - bracket.min + 1) * bracket.rate;
}

export function calculateMedicareLevy(taxableIncome: number): number {
  // Medicare levy is 2% of taxable income (simplified)
  // In reality, there are thresholds and exemptions
  if (taxableIncome <= 23226) return 0; // Low income threshold
  return taxableIncome * 0.02;
}

export function calculateCGT(inputs: CGTInputs): CGTResults {
  const results: CGTResults = {
    lossCarryForward: 0,
    assetBreakdown: [],
    totalCapitalGain: 0,
    netCapitalGain: 0,
    taxableIncomeWithGain: inputs.annualTaxableIncome,
    taxWithoutGain: calculateIncomeTax(inputs.annualTaxableIncome),
    taxWithGain: calculateIncomeTax(inputs.annualTaxableIncome),
    cgtPayable: 0,
    medicareLevy: 0,
    totalTaxLiability: 0
  };

  // Calculate gains/losses for each asset
  let totalGains = 0;
  let totalLosses = 0;

  inputs.assets.forEach(asset => {
    // Skip if asset purchased before 20 Sep 1985 (exempt)
    if (inputs.assetsPurchasedBefore1985) {
      results.assetBreakdown.push({
        assetId: asset.id,
        rawGain: 0,
        discountedGain: 0,
        isLoss: false
      });
      return;
    }

    const rawGain = asset.salePrice - (asset.purchasePrice + asset.additionalCosts);
    let finalGain = rawGain;

    // Apply 50% CGT discount if owned > 12 months (for individuals and not foreign residents)
    if (asset.ownedMoreThan12Months && !inputs.foreignOrTemporaryResident && rawGain > 0) {
      finalGain = rawGain * 0.5;
    }

    results.assetBreakdown.push({
      assetId: asset.id,
      rawGain: rawGain,
      discountedGain: finalGain,
      isLoss: rawGain < 0
    });

    if (finalGain > 0) {
      totalGains += finalGain;
    } else {
      totalLosses += Math.abs(finalGain);
    }
  });

  results.totalCapitalGain = totalGains;

  // Apply current year losses
  let netGain = totalGains - totalLosses;

  // Apply unapplied capital losses if any
  if (inputs.hasUnappliedLosses && inputs.unappliedLossesAmount > 0) {
    netGain -= inputs.unappliedLossesAmount;
  }

  // If still negative, carry forward the loss
  if (netGain < 0) {
    results.lossCarryForward = Math.abs(netGain);
    results.netCapitalGain = 0;
  } else {
    results.netCapitalGain = netGain;
  }

  // Calculate tax implications
  results.taxableIncomeWithGain = inputs.annualTaxableIncome + results.netCapitalGain;
  results.taxWithGain = calculateIncomeTax(results.taxableIncomeWithGain);
  results.cgtPayable = Math.max(0, results.taxWithGain - results.taxWithoutGain);

  // Medicare levy calculation
  results.medicareLevy = calculateMedicareLevy(results.taxableIncomeWithGain) - calculateMedicareLevy(inputs.annualTaxableIncome);

  results.totalTaxLiability = results.cgtPayable + results.medicareLevy;

  return results;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}