'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types/transaction';

interface UseTransactionDetailParams {
  transactionId: string | null;
  autoFetch?: boolean;
}

interface UseTransactionDetailReturn {
  transaction: Transaction | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTransaction: (updates: Partial<Transaction>) => Promise<void>;
}

export function useTransactionDetail({
  transactionId,
  autoFetch = true,
}: UseTransactionDetailParams): UseTransactionDetailReturn {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/transactions/${transactionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction');
      }

      const data = await response.json();
      setTransaction(data.transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Transaction detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (autoFetch && transactionId) {
      fetchTransaction();
    }
  }, [fetchTransaction, autoFetch, transactionId]);

  const updateTransaction = async (updates: Partial<Transaction>) => {
    if (!transactionId) return;

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      await fetchTransaction();
    } catch (error) {
      console.error('Transaction update error:', error);
      throw error;
    }
  };

  return {
    transaction,
    loading,
    error,
    refetch: fetchTransaction,
    updateTransaction,
  };
}