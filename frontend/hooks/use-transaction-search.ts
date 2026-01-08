'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from './use-debounce';
import type { TransactionSearchResult } from '@/types/transaction';

interface UseTransactionSearchParams {
  userAddress?: string;
  limit?: number;
}

interface UseTransactionSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: TransactionSearchResult[];
  loading: boolean;
  error: string | null;
}

export function useTransactionSearch({
  userAddress,
  limit = 20,
}: UseTransactionSearchParams = {}): UseTransactionSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TransactionSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchTransactions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          q: debouncedQuery,
          limit: limit.toString(),
        });

        if (userAddress) {
          params.append('userAddress', userAddress);
        }

        const response = await fetch(`/api/transactions/search?${params}`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    searchTransactions();
  }, [debouncedQuery, userAddress, limit]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
}