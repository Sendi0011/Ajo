'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TransactionStats, FilterOptions } from '@/types/transaction';

interface UseTransactionStatsParams {
  filters?: FilterOptions;
  userAddress?: string;
  poolId?: string;
  autoFetch?: boolean;
}

interface UseTransactionStatsReturn {
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactionStats({
  filters,
  userAddress,
  poolId,
  autoFetch = true,
}: UseTransactionStatsParams = {}): UseTransactionStatsReturn {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (poolId) params.append('poolId', poolId);
      if (userAddress) params.append('userAddress', userAddress);
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await fetch(`/api/transactions/stats?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, userAddress, poolId]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [fetchStats, autoFetch]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}