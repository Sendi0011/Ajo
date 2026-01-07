export interface TaxReport {
    id: string;
    userId: string;
    taxYear: number;
    quarter?: number; // 1-4 for quarterly reports
    generatedAt: string;
    summary: TaxSummary;
    transactions: TaxTransaction[];
    format: 'PDF' | 'CSV';
    url: string;
  }
  
  export interface TaxSummary {
    totalIncome: string;
    totalExpenses: string;
    netProfit: string;
    totalFees: string;
    contributionsMade: string;
    payoutsReceived: string;
    capitalGains: string;
    transactionCount: number;
    taxableEvents: number;
  }
  
  export interface TaxTransaction {
    date: string;
    type: 'INCOME' | 'EXPENSE' | 'CAPITAL_GAIN';
    description: string;
    amount: string;
    amountUSD: string;
    currency: string;
    category: string;
    hash: string;
    isTaxable: boolean;
  }
  
  export type TaxReportPeriod = 'yearly' | 'quarterly' | 'custom';
  
  export interface TaxReportOptions {
    period: TaxReportPeriod;
    year: number;
    quarter?: number;
    startDate?: Date;
    endDate?: Date;
    includeSummary: boolean;
    includeTransactionDetails: boolean;
    groupByCategory: boolean;
  }