export type TransactionType = 
  | 'CONTRIBUTION'    // Member deposits to pool
  | 'PAYOUT'         // Disbursement to member
  | 'WITHDRAWAL'     // Emergency or regular withdrawal
  | 'EMERGENCY'      // Emergency withdrawal
  | 'FEE'            // Platform or gas fees
  | 'REFUND'         // Refunded transaction
  | 'TRANSFER';      // Pool-to-pool transfer

export type TransactionStatus = 
  | 'PENDING'        // Initiated, awaiting confirmation
  | 'PROCESSING'     // Being processed on-chain
  | 'COMPLETED'      // Successfully completed
  | 'FAILED'         // Transaction failed
  | 'CANCELLED'      // User cancelled
  | 'REVERTED';      // On-chain revert

export type TransactionCategory = 
  | 'SAVINGS'
  | 'EMERGENCY'
  | 'WITHDRAWAL'
  | 'INVESTMENT'
  | 'FEE'
  | 'OTHER';

export interface Transaction {
  id: string;
  poolId: string;
  poolName: string;
  poolType: 'rotational' | 'target' | 'flexible';
  userId: string;
  userAddress: string;
  userName: string | null;
  userAvatar: string | null;
  type: TransactionType;
  status: TransactionStatus;
  category: TransactionCategory;
  amount: string;
  amountUSD: string | null;
  currency: string;
  tokenAddress: string;
  hash: string;
  blockNumber: number | null;
  gasUsed: string | null;
  gasFee: string | null;
  timestamp: string;
  confirmedAt: string | null;
  description: string | null;
  metadata: TransactionMetadata;
  receiptUrl: string | null;
  tags: string[];
  notes: string | null;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionMetadata {
  // Pool-specific metadata
  roundNumber?: number;
  recipientAddress?: string;
  recipientName?: string;
  
  // Smart account metadata
  bundlerUrl?: string;
  userOpHash?: string;
  smartAccountAddress?: string;
  
  // Additional context
  previousBalance?: string;
  newBalance?: string;
  exchangeRate?: string;
  
  // Error details (for failed transactions)
  errorMessage?: string;
  errorCode?: string;
  
  // Custom fields
  [key: string]: any;
}

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