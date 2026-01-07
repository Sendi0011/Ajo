'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Transaction, FilterOptions, PaginationMeta, SortOption } from '@/types/transaction';

interface UseTransactionsParams {
  filters?: FilterOptions;
  page?: number;
  limit?: number;
  sortBy?: SortOption;
  userAddress?: string;
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactions({
  filters = {},
  page = 1,
  limit = 20,
  sortBy = { field: 'timestamp', direction: 'desc' },
  userAddress,
  autoFetch = true,
}: UseTransactionsParams = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy.field,
        sortDir: sortBy.direction,
      });

      // Add user address
      if (userAddress) {
        params.append('userAddress', userAddress);
      }

      // Add filters
      if (filters.type && filters.type.length > 0) {
        params.append('type', filters.type.join(','));
      }
      if (filters.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }
      if (filters.category && filters.category.length > 0) {
        params.append('category', filters.category.join(','));
      }
      if (filters.poolId && filters.poolId.length > 0) {
        params.append('poolId', filters.poolId.join(','));
      }
      if (filters.poolType && filters.poolType.length > 0) {
        params.append('poolType', filters.poolType.join(','));
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      if (filters.minAmount !== undefined) {
        params.append('minAmount', filters.minAmount.toString());
      }
      if (filters.maxAmount !== undefined) {
        params.append('maxAmount', filters.maxAmount.toString());
      }
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.isBookmarked) {
        params.append('isBookmarked', 'true');
      }
      if (filters.hasNotes) {
        params.append('hasNotes', 'true');
      }

      const response = await fetch(`/api/transactions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Transaction fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit, sortBy, userAddress]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [fetchTransactions, autoFetch]);

  return {
    transactions,
    pagination,
    loading,
    error,
    refetch: fetchTransactions,
  };
}
