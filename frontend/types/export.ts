export type ExportFormat = 'CSV' | 'PDF' | 'JSON' | 'EXCEL';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  dateRange?: DateRange;
  filters?: FilterOptions;
  includeMetadata?: boolean;
  includeReceipts?: boolean;
  columns?: ExportColumn[];
  groupBy?: 'date' | 'pool' | 'type' | 'status';
  sortBy?: SortOption;
}

export interface ExportColumn {
  key: string;
  label: string;
  enabled: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type DatePreset = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'allTime'
  | 'custom';

export interface FilterOptions {
  dateRange?: DateRange;
  datePreset?: DatePreset;
  type?: TransactionType[];
  status?: TransactionStatus[];
  category?: TransactionCategory[];
  poolId?: string[];
  poolType?: ('rotational' | 'target' | 'flexible')[];
  searchQuery?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  isBookmarked?: boolean;
  hasNotes?: boolean;
}

export interface SortOption {
  field: 'timestamp' | 'amount' | 'status' | 'type';
  direction: 'asc' | 'desc';
}

// ============================================================================
// COMMIT 3: "feat: add pagination and response types"
// FILE: types/transaction.ts (continued)
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: PaginationMeta;
  filters?: FilterOptions;
  stats?: TransactionStats;
}

export interface TransactionStats {
  totalTransactions: number;
  totalVolume: string;
  totalVolumeUSD: string;
  averageAmount: string;
  successRate: number;
  byType: Record<TransactionType, number>;
  byStatus: Record<TransactionStatus, number>;
  byCategory: Record<TransactionCategory, number>;
  recentActivity: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
}